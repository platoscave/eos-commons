<template>
  <div v-if="viewObj && headers && dataArr">
    <!-- <div v-if="viewObj.toolbarProperties">
      <v-btn color="blue darken-1" @click="takeAction">Add Service Request</v-btn>
    </div>-->
    <!-- https://stackoverflow.com/questions/49607082/dynamically-building-a-table-using-vuetifyjs-data-table -->
    <!-- https://codepen.io/fontzter/pen/qywQjK filter in toolbar -->
    <v-text-field
      class="searchRextField"
      v-model="search"
      append-icon="search"
      placeholder="Search"
      single-line
      hide-details
      clearable
    ></v-text-field>
    <v-data-table
      :headers="headers"
      :items="filteredDataArr"
      hide-default-header
      hide-default-footer
      :search="search"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    >
      <!-- The header-->
      <template v-slot:header="{ props: { headers } }">
        <thead>
          <tr>
            <th
              v-for="header in headers"
              v-bind:key="header.text"
              v-on:click.stop="changeSort(header.value)"
              itemKey="key"
            >
              <!-- The filter menu-->
              <v-menu
                v-if="header.value !== 'name' && header.value !== 'description' && columnValueList(header.value).length > 1"
                :close-on-content-click="false"
                :nudge-width="200"
                offset-x
              >
                <!-- The filter icon -->
                <template v-slot:activator="{ on }">
                  <v-icon
                    small
                    v-on="on"
                    :color="filters[header.value].length > 0 ? 'yellow' : ''"
                  >filter</v-icon>
                </template>
                <!-- The filter list -->
                <v-list dense>
                  <v-list-item-group v-model="filters[header.value]" multiple active-class>
                    <template v-for="(itemValue)  in columnValueList(header.value)">
                      <v-list-item v-bind:key="itemValue" v-bind:value="itemValue">
                        <template v-slot:default="{ active, toggle  }">
                          <v-list-item-action>
                            <v-checkbox
                              :input-value="active"
                              :true-value="itemValue"
                              color="deep-purple accent-4"
                              @click.stop="toggle"
                            ></v-checkbox>
                          </v-list-item-action>
                          <v-list-item-content>
                            <ec-select-control
                              v-bind:value="itemValue"
                              v-bind:property="viewObj.properties[header.value]"
                            ></ec-select-control>
                          </v-list-item-content>
                        </template>
                      </v-list-item>
                    </template>
                  </v-list-item-group>
                </v-list>
              </v-menu>
              {{ header.text }}
              <i
                v-bind:class="['mdi', header.value === sortBy ? sortDesc ?  'mdi-arrow-down' : 'mdi-arrow-up' : '']"
              ></i>
            </th>
          </tr>
        </thead>
      </template>

      <!-- The body-->
      <template v-slot:body="{ items }">
        <tbody>
          <tr v-for="(item, itemKey) in items" :key="itemKey" v-on:click="itemClick(item)">
            <td v-for="(property, propName) in viewObj.properties" v-bind:key="propName">
              <ec-select-control v-model="item[propName]" v-bind:property="property"></ec-select-control>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>

    <!-- Dialog to add new record -->
    <v-dialog v-if="addDialogViewObj && addRecordAllowed" v-model="dialog" width="500">
      <template v-slot:activator="{ on }">
        <v-btn class="button-bottom" absolute dark fab bottom right color="pink" v-on="on">
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <v-card v-on:button-click="takeAction">
        <v-card-title>{{this.addDialogViewObj.name}}</v-card-title>
        <ec-sub-form
          v-bind:showAllFields="true"
          v-model="newObj"
          v-bind:properties="addDialogViewObj.properties"
        ></ec-sub-form>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import ApiService from "../../services/IndexedDBApiService";
import EcSelectControl from "../formControls/EcSelectControl.vue";
import SubForm from "./recursive/SubForm.vue";
import Vue from "vue";

export default {
  name: "ec-table",
  components: {
    EcSelectControl,
    SubForm
  },
  props: {
    level: Number,
    viewId: String,
    editMode: Boolean
  },
  data() {
    return {
      dataArr: [],
      headers: [],
      viewObj: {},
      search: "",
      dialog: false,
      menu: false,
      newObj: {},
      addRecordAllowed: false,
      addDialogViewObj: {},
      sortBy: "startDate",
      sortDesc: true,
      filters: {},
      query: {}
    };
  },
  created: async function() {
    this.viewObj = await this.$store.dispatch(
      "getMaterializedView",
      this.viewId
    );

    // initialize the filter arrays, and sort
    Object.keys(this.viewObj.properties).forEach(key => {
      Vue.set(this.filters, key, []); // must be set reactivly
      if (this.viewObj.properties[key].sort) {
        // console.log(this.viewObj.properties[key])
        this.sortBy = key;
        this.sortDec = this.viewObj.properties[key].sort === "desc";
      }
    });

    // create the header
    this.headers = Object.keys(this.viewObj.properties).map(key => ({
      text: this.viewObj.properties[key].title,
      value: key
    }));

    // get the query for this view
    this.query = await this.$store.dispatch(
      "getCommonByKey",
      this.viewObj.queryId
    );

    if (this.query.addDialogViewId) {
      this.addDialogViewObj = await this.$store.dispatch(
        "getMaterializedView",
        this.query.addDialogViewId
      );
    }

    // watch the selected obj change
    this.$store.watch(
      state => state.levelIdsArr[this.level].selectedObjId,
      async selectedObjId => {
        if (!selectedObjId) return;

        const queryObj = {
          query: this.query,
          currentObj: selectedObjId
        };
        // get the data
        let resultsArr = await this.$store.dispatch("query", queryObj);

        // add empty response
        /* const date = new Date();
        const newAgreementHistory = {
          description: "",
          state: "",
          stateDate: date.toISOString()
        };
        resultsArr.push(newAgreementHistory); */
        this.dataArr = Object.assign([], resultsArr); // Force reactive update
      },
      { immediate: true }
    );

    // watch the current user
    this.$store.watch(
      state => state.currentUserId,
      async currentUserId => {
        if (!currentUserId) return;
        if (this.viewObj.baseClassId === "i1gjptcb2skq") {
          // Agreements
          this.addRecordAllowed = true;
        } else {
          const orgId = this.$store.state.levelIdsArr[this.level].selectedObjId;
          const addRecordAllowed = await this.$store.dispatch(
            "userMayAddHistory",
            orgId
          );
          this.addRecordAllowed = addRecordAllowed;
        }
      },
      { immediate: true }
    );
  },
  computed: {
    filteredDataArr() {
      return this.dataArr.filter(dataObj => {
        // for each of the props in the filters obj
        return Object.keys(this.filters).every(filterProp => {
          // console.log(filterProp, dataObj);
          // if the data obj [filterProp] value matches a value in filters[filterProp] array
          return (
            this.filters[filterProp].length < 1 ||
            this.filters[filterProp].includes(dataObj[filterProp])
          );
        });
      });
    }
  },
  methods: {
    itemClick: async function(item) {
      // TODO move this to store, remove from tree
      // Recusivly get the default pageId, from the first ancestor class that has one
      const getPageIdFromClassById = async classId => {
        let classObj = await ApiService.getCommonByKey(classId);
        if (classObj.pageId) return classObj.pageId;
        else if (classObj.parentId) {
          return await getPageIdFromClassById(classObj.parentId);
        }
        return ""; // set to default pageId
      };

      let pageId = this.query.pageId ? this.query.pageId : item.pageId;
      if (!pageId && node.classId) {
        pageId = await getPageIdFromClassById(node.classId);
      }
      if (pageId) {
        this.$store.commit("SET_PAGE_STATE2", {
          level: this.level + 1,
          pageId: pageId,
          selectedObjId: item.key
        });
      }
    },
    takeAction: async function(action) {
      this.dialog = false;
      if (action === "addAgreement") {
        const processObj = await this.$store.dispatch(
          "getCommonByKey",
          "cie1pllxq5mu"
        ); // Service Request Process

        this.newObj.docType = "object";
        this.newObj.stateId = processObj.substateId;
        const date = new Date();
        this.newObj.startDate = date.toISOString();
        this.newObj.sellerId = this.$store.state.levelIdsArr[
          this.level
        ].selectedObjId;
        this.newObj.buyerId = this.$store.state.currentUserId;
        this.newObj.classId = "w3mzeetidb5n"; // Service Request
        this.newObj.processId = "cie1pllxq5mu"; // Service Request Process

        const key = await this.$store.dispatch("upsertCommon", this.newObj);
        // let key = await this.$store.dispatch("transact", this.newObj);
      } else if (action === "addHistory") {
        this.newObj.agreementId = this.$store.state.levelIdsArr[
          this.level
        ].selectedObjId;
        const key = await this.$store.dispatch("takeAction", this.newObj);
      }

      const queryObj = {
        query: this.query
      };
      let resultsArr = await this.$store.dispatch("query", queryObj);
      this.dataArr = Object.assign([], resultsArr); // Force reactive update
    },
    changeSort(column) {
      if (this.sortBy === column) {
        this.sortDesc = !this.sortDesc;
      } else {
        this.sortBy = column;
        this.sortDesc = false;
      }
    },
    columnValueList(propName) {
      const valueArr = this.dataArr.map(item => {
        return item[propName];
      });
      // make distict
      return [...new Set(valueArr)];
    }
  }
};
</script>
<style >
td {
  vertical-align: top;
  padding: 0 !important;
}
.v-data-table {
  background-color: transparent !important;
}
.v-data-table tr:hover {
  background-color: #424242 !important;
}
</style>
<style scoped>
.button-bottom {
  bottom: 20px !important;
}
.searchRextField {
  height: 32px;
  padding-left: 12px;
  padding-right: 12px;
}
</style>
