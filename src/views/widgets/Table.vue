<template>
  <div v-if="viewObj && headers && dataArr">
    <!-- https://stackoverflow.com/questions/49607082/dynamically-building-a-table-using-vuetifyjs-data-table -->
    <v-data-table :headers="headers" :items="dataArr">
	       <template slot="items" slot-scope="myprops">
        <td v-for="header in headers">
        {{ myprops.item[header.value] }}
        </td>
      </template>
    </v-data-table>
  </div>
</template>
<script>
export default {
  props: {
    level: Number,
    viewId: String,
    editMode: Boolean
  },
  data() {
    return {
      dataArr: [],
      headers: [],
      viewObj: {}
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
    const arr = Object.keys(this.viewObj.properties).map(key => ({
      text: this.viewObj.properties[key].title,
      value: key
    }));
    this.headers = arr;

    const queryObj = {
      queryId: this.viewObj.queryId
    };
    let resultsArr = await this.$store.dispatch("query", queryObj);
    console.log("newData", resultsArr);

    // this.dataArr = Object.assign({}, resultsArr) // Force reactive update
    this.dataArr = resultsArr;
  }
};
</script>
<style >
</style>
