<template>
  <div v-if="viewObj && headers && dataArr">
    <!-- <div v-if="viewObj.toolbarProperties">
      <v-btn color="blue darken-1" @click="takeAction">Add Service Request</v-btn>
    </div>-->
    <!-- https://stackoverflow.com/questions/49607082/dynamically-building-a-table-using-vuetifyjs-data-table -->
    <!-- https://codepen.io/fontzter/pen/qywQjK filter in toolbar -->
    <v-text-field
      v-model="search"
      append-icon="search"
      label="Search"
      single-line
      hide-details
      clearable
    ></v-text-field>
    <v-data-table
      :headers="headers"
      :items="filteredDesserts"
      hide-default-header
      hide-default-footer
      fixed-header
      :search="search"
      :sortBy="sortBy"
      :sortDesc="sortDesc"
    >
      <template v-slot:header="{ props: { headers } }">
        <thead>
          <tr>
            <th
              v-for="header in headers"
              v-bind:key="header.text"
              v-bind:class="['column sortable', sortDesc ? 'desc' : 'asc', header.value === sortBy ? 'active' : '']"
              v-on:click="changeSort(header.value)"
              itemKey="key"
            >
                <!-- The filter menu-->
              <v-menu
                v-if="header.value !== 'name' && header.value !== 'description' "
                v-model="menu"
                :close-on-content-click="false"
                :nudge-width="200"
                offset-x
              >
                <template v-slot:activator="{ on }">
                  <v-icon small v-on="on">filter</v-icon>
                </template>
                <v-list>
                  <v-list-item-group v-model="filters[header.value]" multiple active-class>
                    <v-list-item
                      v-for="(name, propName)  in columnValueList(header.value)"
                      v-bind:key="propName"
                    >
                      <template v-slot:default="{ active }">
                        <v-list-item-action>
                          <v-checkbox v-model="active"></v-checkbox>
                        </v-list-item-action>
                        <v-list-item-content>{{name}}</v-list-item-content>
                      </template>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-menu>
              {{ header.text }}
              <v-icon small>arrow_upward</v-icon>
            </th>
          </tr>
        </thead>
      </template>

      <template v-slot:body="{ items }">
        <tbody>
          <tr v-for="(item, itemKey) in items" :key="itemKey" v-on:click="itemClick(items.item)">
            <td v-for="(property, propName) in viewObj.properties" v-bind:key="propName">
              <ec-select-control v-model="item[propName]" v-bind:property="property"></ec-select-control>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>

    <v-dialog v-if="addDialogViewObj" v-model="dialog" width="500">
      <template v-slot:activator="{ on }">
        <v-btn class="button-bottom" absolute dark fab bottom right color="pink" v-on="on">
          <v-icon>add</v-icon>
        </v-btn>
      </template>
      <v-card v-on:button-click="takeAction">
        <v-card-title>{{this.addDialogViewObj.name}}</v-card-title>
        <ec-sub-form
          v-bind:editMode="true"
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
      addDialogViewObj: {},
      sortBy: "startDate",
      sortDesc: true,
      filters: {
        stateId: [],
        startDate: [],
        name: "",
        description: ""
      }
    };
  },
  created: async function() {
    /* this.$store.watch( state => state.levelIdsArr[this.level].selectedObjId, selectedObjId => {
        if (!selectedObjId) return
        this.$store.dispatch('getCommonByKey', selectedObjId).then(newData => {
          // console.log('dataObj', newData)
          this.dataObj = Object.assign({}, newData) // Force reactive update
        })
      },
      { immediate: true }
    ) */

    this.viewObj = await this.$store.dispatch("materializedView", this.viewId);
    // console.log('view', this.viewObj)

    this.headers = Object.keys(this.viewObj.properties).map(key => ({
      text: this.viewObj.properties[key].title,
      value: key
    }));

    this.query = await this.$store.dispatch(
      "getCommonByKey",
      this.viewObj.queryId
    );

    if (this.query.addDialogViewId) {
      this.addDialogViewObj = await this.$store.dispatch(
        "materializedView",
        this.query.addDialogViewId
      );
    }
    const queryObj = {
      query: this.query
    };
    let resultsArr = await this.$store.dispatch("query", queryObj);
    console.log("newData", resultsArr);

    // this.dataArr = Object.assign({}, resultsArr) // Force reactive update
    this.dataArr = resultsArr;
  },
  computed: {
    addProperties: async function() {
      if (this.query.addViewId) {
        const addView = await this.$store.dispatch(
          "materializedView",
          this.query.addViewId
        );
        return addView.properties;
      } else return {};
    },
    filteredDesserts() {
      return this.dataArr.filter(dataObj => {
        // for each of the props in the filters obj
        return Object.keys(this.filters).every(filterProp => {
          console.log(filterProp, dataObj);
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
    itemClick: async function(node) {
      // TODO move this to store, remove from tree
      // Recusivly get the default pageId, from the first ancestor class that has one
      const getIconFromClassById = async classId => {
        let classObj = await ApiService.getCommonByKey(classId);
        if (classObj.icon) return classObj.icon;
        else if (classObj.parentId) {
          return await getIconFromClassById(classObj.parentId);
        }
        return ""; // set to default icon
      };

      let pageId = this.query.pageId ? this.query.pageId : item.pageId;
      if (!pageId && node.classId) {
        pageId = await getPageIdFromClassById(node.classId);
      }
      if (pageId) {
        this.$store.commit("SET_PAGE_STATE2", {
          level: this.level + 1,
          pageId: pageId,
          selectedObjId: node.key
        });
      }
    },
    takeAction: async function(action) {
      console.log("action", action);
      if (action === "addAgreement") {
        this.newObj.docType = "object";
        const date = new Date();
        this.newObj.startDate = date.toLocaleDateString();
        this.newObj.sellerId = this.$store.state.levelIdsArr[
          this.level
        ].selectedObjId;
        this.newObj.buyerId = "testuser1111";
        this.newObj.classId = this.query.from;
        this.newObj.processId = "cie1pllxq5mu";
      }
      let key = await this.$store.dispatch("transact", this.newObj);

      const queryObj = {
        query: this.query
      };
      let resultsArr = await this.$store.dispatch("query", queryObj);
      this.dataArr = Object.assign([], resultsArr); // Force reactive update
    },
    changeSort(column) {
      if (this.sortBy === column) {
        // Vue.set(this.pagination, "descending", !this.pagination.descending);
        this.sortDesc = !this.sortDesc;
      } else {
        // Vue.set(this.pagination, "sortBy", column);
        // Vue.set(this.pagination, "descending", false);

        this.sortBy = column;
        this.sortDesc = false;
      }
    },
    columnValueList(val) {
      return this.dataArr.map(d => d[val]);
    }
  }
};
</script>
<style >
td {
  vertical-align: top;
  padding: 0 !important;
}
table {
  background-color: transparent !important;
}
tr:hover {
  background-color: #4242426e !important;
}
</style>
<style scoped>
.button-bottom {
  bottom: 10px;
  right: 30px;
}
</style>
