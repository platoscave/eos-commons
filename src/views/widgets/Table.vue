<template>
  <div v-if="viewObj && headers && dataArr">
    <!-- https://stackoverflow.com/questions/49607082/dynamically-building-a-table-using-vuetifyjs-data-table -->
    <v-data-table :headers="headers" :items="dataArr">
      <template slot="items" slot-scope="myprops">
        <td v-for="(property, propName) in viewObj.properties" v-bind:key="propName">
          <!-- {{ myprops.item[propName] }} -->
          <!-- Richtext -->
          <div
            v-if="property.media && property.media.mediaType === 'text/html' "
            v-html="myprops.item[propName] ? myprops.item[propName] : property.default"
          ></div>

          <!-- WbbGl -->
          <div v-else-if="property.media && property.media.mediaType === 'image/webgl' ">
            <img src="myprops.item[propName]" width="500px" height="500px" />
          </div>

          <!-- Base64 -->
          <div v-else-if="property.media && property.media.type === 'image/png' ">
            <img v-bind:src="myprops.item[propName]" width="24px" height="24px" />
          </div>

          <!-- Date -->
          <div v-else-if="property && property.format === 'date-time' ">
            <div>{{ new Date(Date.parse(myprops.item[propName])).toLocaleDateString() }}</div>
          </div>

          <!-- Uri -->
          <div v-else-if="property.media && property.media.format === 'uri' ">
            <a uri="myprops.item[propName]"></a>
          </div>

          <!-- Enum -->
          <div v-else-if="property.enum">
            <div v-if="!editMode || property.readOnly">{{ myprops.item[propName] }}</div>
          </div>

          <!-- Select from Query Results -->
          <div v-else-if="property.query">
            <ec-select
              v-model="myprops.item[propName]"
              v-bind:query="property.query"
              v-bind:readonly="true"
            ></ec-select>
          </div>

          <!--String-->
          <div v-else-if="property.type === 'string'">
            <div v-if="!editMode || property.readOnly">{{ myprops.item[propName] }}</div>
          </div>

          <!--Number-->
          <div v-else-if="property.type === 'number'">
            <div
              class="outputclass"
              v-if="!editMode || property.readOnly"
            >{{ myprops.item[propName].toLocaleString() }}</div>
          </div>

          <!-- Boolean -->
          <div v-else-if="property.type === 'boolean'">
            <div class="outputclass">{{ myprops.item[propName] === true ? 'true' : 'false' }}</div>
          </div>

          <!-- Array -->
          <div v-else-if="property.type === 'array'">
            <div v-for="(childData, idx) in myprops.item[propName]" v-bind:key="idx">
              <div class="outputclass">{{ childData }}</div>
            </div>
          </div>

          <!-- Object -->
          <div v-else-if="property.type === 'object'">
            <div class="monoSpaced">{{ JSON.stringify(myprops.item[propName], replacer, 2) }}></div>
          </div>

          <div v-else>
            <div>
              Unknown property: {{ propName }}
              <br />
              <div class="monoSpaced">{{ JSON.stringify(property, replacer, 2) }}></div>
              <br />
            </div>
          </div>
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
