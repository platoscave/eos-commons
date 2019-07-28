<template>
  <div v-if="viewObj && headers && dataArr">
    <!-- <div v-if="viewObj.toolbarProperties">
      <v-btn color="blue darken-1" @click="takeAction">Add Service Request</v-btn>
    </div>-->
    <!-- https://stackoverflow.com/questions/49607082/dynamically-building-a-table-using-vuetifyjs-data-table -->
    <!-- https://codepen.io/fontzter/pen/qywQjK filter in toolbar -->
    <v-data-table :headers="headers" :items="dataArr" hide-actions>
      <template template slot="items" slot-scope="row">
        <tr v-on:click="itemClick(row.item)">
          <td v-for="(property, propName) in viewObj.properties" v-bind:key="propName">
            <ec-select-control v-model="row.item[propName]" v-bind:property="property"></ec-select-control>
          </td>
        </tr>
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
        <ec-sub-form v-bind:editMode="true" v-model="newObj" v-bind:properties="addDialogViewObj.properties"></ec-sub-form>
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
      selected: [],
      dialog: false,
      newObj: { name: 'TRY ME'},
      addDialogViewObj: {}
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
        /* let addPropertiesObj = {};
        Object.keys(this.viewObj.addProperties).forEach(key => {
          var value = this.viewObj.properties[key];
          if (value) addPropertiesObj[key] = value;
          else addPropertiesObj[key] = this.viewObj.addProperties[key];
        });
        return addPropertiesObj; */
      } else return {};
    }
  },
  methods: {
    itemClick: async function(node) {
      //TODO move this to store, remove from tree
      // Recusivly get the default pageId, from the first ancestor class that has one
      const getIconFromClassById = async classId => {
        let classObj = await ApiService.getCommonByKey(classId);
        if (classObj.icon) return classObj.icon;
        else if (classObj.parentId)
          return await getIconFromClassById(classObj.parentId);
        return ""; // set to default icon
      };

      let pageId = this.query.pageId ? this.query.pageId : item.pageId;
      if (!pageId && node.classId)
        pageId = await getPageIdFromClassById(node.classId);
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
      debugger;
      const name = "[new Agreemnt]";
      const date = new Date();
      let newObject = {
        docType: "object",
        name: name,
        startDate: date.toLocaleDateString(),
        //'stateId': 'yefagaab4ua2',
        //'assetId': 'pwyzd1adoyzu',
        buyerId: "testuser1111",
        classId: this.query.from,
        processId: "cie1pllxq5mu",
        // 'sellerProcessId': 'cie1pllxq5mu',
        sellerId: this.$store.state.levelIdsArr[this.level].selectedObjId
      };
      let key = await this.$store.dispatch("upsertCommon", newObject);

      const queryObj = {
        query: this.query
      };
      let resultsArr = await this.$store.dispatch("query", queryObj);
      this.dataArr = Object.assign([], resultsArr); // Force reactive update
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
