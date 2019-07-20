<template>
  <div v-if="viewObj && headers && dataArr">
    <!-- https://stackoverflow.com/questions/49607082/dynamically-building-a-table-using-vuetifyjs-data-table -->
    <v-data-table :headers="headers" :items="dataArr" hide-actions>
      <template slot="items" slot-scope="myprops">
        <td v-for="(property, propName) in viewObj.properties" v-bind:key="propName" v-on:click="(itemClick())">
          <!-- {{ myprops.item[propName] }} -->

          <!-- Richtext -->
          <ec-rich-text
            v-if="property.media && property.media.mediaType === 'text/html' "
            v-model.trim="myprops.item[propName]"
            v-bind:property="property"
          ></ec-rich-text>

          <!-- Base64 -->
          <ec-base64
            v-else-if="property.media && property.media.type === 'image/png' "
            v-model.trim="myprops.item[propName]"
            v-bind:property="property"
          ></ec-base64>

          <!-- Date -->
          <ec-date
            v-else-if="property.type === 'date'"
            v-model.number="myprops.item[propName]"
            v-bind:property="property"
          ></ec-date>

          <!-- Uri -->
          <ec-uri
            v-else-if="property.media && property.media.format === 'uri' "
            v-model.trim="myprops.item[propName]"
            v-bind:property="property"
          ></ec-uri>

          <!-- Enum -->
          <ec-select
            v-else-if="property.enum"
            v-model="myprops.item[propName]"
            v-bind:property="property"
            v-bind:items="property.enum"
          ></ec-select>

          <!-- Select from Query Results -->
          <ec-query-select
            v-else-if="property.query"
            v-model.trim="myprops.item[propName]"
            v-bind:property="property"
          ></ec-query-select>

          <!--String-->
          <ec-string
            v-else-if="property.type === 'string'"
            v-model.trim="myprops.item[propName]"
            v-bind:property="property"
          ></ec-string>

          <!--Number-->
          <ec-number
            v-else-if="property.type === 'number'"
            v-model.number="myprops.item[propName]"
            v-bind:property="property"
          ></ec-number>

          <!-- Boolean -->
          <ec-boolean
            v-else-if="property.type === 'boolean'"
            v-model.number="myprops.item[propName]"
            v-bind:property="property"
          ></ec-boolean>

          <!-- Array -->
          <div v-else-if="property.type === 'array'">
            <div class="outputclass">
              <div v-if="property.items.type === 'object'">
                <div v-for="(childData, idx) in myprops.item[propName]" v-bind:key="idx">
                  <!-- <div class="monoSpaced">{{ JSON.stringify(properties, replacer, 2) }}></div>
						<br>
                  <div class="monoSpaced">{{ JSON.stringify(property.items.properties, replacer, 2) }}></div>-->
                  <ec-sub-form
                    class="outputclass"
                    v-bind:editMode="editMode"
                    v-model="myprops.item[propName][idx]"
                    v-bind:properties="property.items.properties"
                    v-bind:definitions="definitions"
                  ></ec-sub-form>
                  <br />
                </div>
              </div>
              <div v-else>
                <div v-for="(childData, idx) in myprops.item[propName]" v-bind:key="idx">
                  <div class="outputclass">{{ childData }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Object -->
          <div v-else-if="property.type === 'object'">
            <div class="outputclass">
              <div v-if="property.properties">
                <ec-sub-form
                  v-bind:editMode="editMode"
                  v-model="myprops.item[propName]"
                  v-bind:properties="property.properties"
                  v-bind:definitions="definitions"
                ></ec-sub-form>
              </div>
              <div v-else-if="property.additionalProperties">
                <div
                  v-for="(childData, subPropName) in myprops.item[propName]"
                  v-bind:key="subPropName"
                >
                  <div class="outputclass">{{ subPropName }}</div>
                  <!-- We're cheating here, We assume additionProperties can be found in definitions, instead of resolving $ref -->
                  <!-- {{myprops.item[propName][subPropName]}} -->
                  <ec-sub-form
                    class="outputclass"
                    v-bind:editMode="editMode"
                    v-model="myprops.item[propName][subPropName]"
                    v-bind:properties="definitions.additionalProperties"
                    v-bind:definitions="definitions"
                  ></ec-sub-form>
                  <br />
                </div>
              </div>
              <div v-else>
                <div class="monoSpaced">{{ JSON.stringify(myprops.item[propName], replacer, 2) }}></div>
              </div>
            </div>
          </div>

          <div v-else>
            <div>
              Unknown property: {{ propName }}
              <br />
              <div class="monoSpaced">{{ JSON.stringify(property, replacer, 2) }}></div>
            </div>
          </div>
        </td>
      </template>
    </v-data-table>
  </div>
</template>
<script>
import EcString from "../formControls/EcString.vue";
import EcQuerySelect from "../formControls/EcQuerySelect.vue";
import EcSelect from "../formControls/EcSelect.vue";
import EcNumber from "../formControls/EcNumber.vue";
import EcBoolean from "../formControls/EcBoolean.vue";
import EcDate from "../formControls/EcDate.vue";
import EcRichText from "../formControls/EcRichText.vue";
import EcBase64 from "../formControls/EcBase64.vue";
import EcUri from "../formControls/EcUri.vue";
import SubForm from "./recursive/SubForm.vue";
export default {
  name: "ec-table",
  components: {
    EcString,
    EcQuerySelect,
    EcSelect,
    EcNumber,
    EcDate,
    EcRichText,
    EcBase64,
    EcUri,
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
      selected: []
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
  },
  methods: {
    itemClick(node) {
      if (node.model.Xdata.pageId) {
        this.$store.commit("SET_PAGE_STATE2", {
          level: this.level + 1,
          pageId: node.model.Xdata.pageId,
          selectedObjId: node.model.key
        });
      }
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
</style>
