<template>
  <div v-if="viewObj && headers && dataArr">
        <div v-if="viewObj.toolbarProperties">
            <v-btn color="blue darken-1" @click="takeAction('addObject')">Add Service Request</v-btn>
        </div>
    <!-- https://stackoverflow.com/questions/49607082/dynamically-building-a-table-using-vuetifyjs-data-table -->
    <!-- https://codepen.io/fontzter/pen/qywQjK filter in toolbar -->
    <v-data-table :headers="headers" :items="dataArr" hide-actions>
      <template template slot="items" slot-scope="row">
        <tr v-on:click="itemClick(row.item)">
          <td v-for="(property, propName) in viewObj.properties" v-bind:key="propName">
            <!-- {{ row.item[propName] }} -->

            <!-- Richtext -->
            <ec-rich-text
              v-if="property.media && property.media.mediaType === 'text/html' "
              v-model.trim="row.item[propName]"
              v-bind:property="property"
            ></ec-rich-text>

            <!-- Image -->
            <ec-image
              v-else-if="property.media && property.media.type === 'image/png' "
              v-model.trim="row.item[propName]"
              v-bind:property="property"
            ></ec-image>

            <!-- Date -->
            <ec-date
              v-else-if="property.type === 'date'"
              v-model.number="row.item[propName]"
              v-bind:property="property"
            ></ec-date>

            <!-- Uri -->
            <ec-uri
              v-else-if="property.media && property.media.format === 'uri' "
              v-model.trim="row.item[propName]"
              v-bind:property="property"
            ></ec-uri>

            <!-- Enum -->
            <ec-select
              v-else-if="property.enum"
              v-model="row.item[propName]"
              v-bind:property="property"
              v-bind:items="property.enum"
            ></ec-select>

            <!-- Select from Query Results -->
            <ec-query-select
              v-else-if="property.query"
              v-model.trim="row.item[propName]"
              v-bind:property="property"
            ></ec-query-select>

            <!--String-->
            <ec-string
              v-else-if="property.type === 'string'"
              v-model.trim="row.item[propName]"
              v-bind:property="property"
            ></ec-string>

            <!--Number-->
            <ec-number
              v-else-if="property.type === 'number'"
              v-model.number="row.item[propName]"
              v-bind:property="property"
            ></ec-number>

            <!-- Boolean -->
            <ec-boolean
              v-else-if="property.type === 'boolean'"
              v-model.number="row.item[propName]"
              v-bind:property="property"
            ></ec-boolean>

            <!-- Array -->
            <div v-else-if="property.type === 'array'">
              <div class="outputclass">
                <div v-if="property.items.type === 'object'">
                  <div v-for="(childData, idx) in row.item[propName]" v-bind:key="idx">
                    <!-- <div class="monoSpaced">{{ JSON.stringify(properties, replacer, 2) }}></div>
						<br>
                    <div class="monoSpaced">{{ JSON.stringify(property.items.properties, replacer, 2) }}></div>-->
                    <ec-sub-form
                      class="outputclass"
                      v-bind:editMode="editMode"
                      v-model="row.item[propName][idx]"
                      v-bind:properties="property.items.properties"
                      v-bind:definitions="definitions"
                    ></ec-sub-form>
                    <br />
                  </div>
                </div>
                <div v-else>
                  <div v-for="(childData, idx) in row.item[propName]" v-bind:key="idx">
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
                    v-model="row.item[propName]"
                    v-bind:properties="property.properties"
                    v-bind:definitions="definitions"
                  ></ec-sub-form>
                </div>
                <div v-else-if="property.additionalProperties">
                  <div
                    v-for="(childData, subPropName) in row.item[propName]"
                    v-bind:key="subPropName"
                  >
                    <div class="outputclass">{{ subPropName }}</div>
                    <!-- We're cheating here, We assume additionProperties can be found in definitions, instead of resolving $ref -->
                    <!-- {{row.item[propName][subPropName]}} -->
                    <ec-sub-form
                      class="outputclass"
                      v-bind:editMode="editMode"
                      v-model="row.item[propName][subPropName]"
                      v-bind:properties="definitions.additionalProperties"
                      v-bind:definitions="definitions"
                    ></ec-sub-form>
                    <br />
                  </div>
                </div>
                <div v-else>
                  <div class="monoSpaced">{{ JSON.stringify(row.item[propName], replacer, 2) }}></div>
                </div>
              </div>
            </div>

            <!-- button -->
            <ec-button
              v-else-if="property.type === 'button'"
              v-model.number="row.item[propName]"
              v-bind:property="property"
            ></ec-button>

            <div v-else>
              <div>
                Unknown property: {{ propName }}
                <br />
                <div class="monoSpaced">{{ JSON.stringify(property, replacer, 2) }}></div>
              </div>
            </div>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>
<script>
import ApiService from '../../services/IndexedDBApiService'

import EcString from "../formControls/EcString.vue";
import EcQuerySelect from "../formControls/EcQuerySelect.vue";
import EcSelect from "../formControls/EcSelect.vue";
import EcNumber from "../formControls/EcNumber.vue";
import EcBoolean from "../formControls/EcBoolean.vue";
import EcDate from "../formControls/EcDate.vue";
import EcRichText from "../formControls/EcRichText.vue";
import EcImage from "../formControls/EcImage.vue";
import EcUri from "../formControls/EcUri.vue";
import EcButton from "../formControls/EcButton.vue";
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
    EcImage,
    EcUri,
    EcButton,
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

    this.headers = Object.keys(this.viewObj.properties).map(key => ({
      text: this.viewObj.properties[key].title,
      value: key
    }));

    this.query = await this.$store.dispatch("materializedView", this.viewObj.queryId);

    const queryObj = {
      query: this.query
    };
    let resultsArr = await this.$store.dispatch("query", queryObj);
    console.log("newData", resultsArr);

    // this.dataArr = Object.assign({}, resultsArr) // Force reactive update
    this.dataArr = resultsArr;
  },
  methods: {
    itemClick: async function(node) {
        //TODO move this to store, remove from tree
        // Recusivly get the default icon, from the first ancestor class that has one
        const getIconFromClassById = async classId => {
            let classObj = await ApiService.getCommonByKey(classId)
            if (classObj.icon) return classObj.icon
            else if (classObj.parentId) return await getIconFromClassById(classObj.parentId)
            return '' // set to default icon
        }
      
        let pageId = this.query.pageId ? this.query.pageId : item.pageId
        if (!pageId && node.classId) pageId = await getPageIdFromClassById(node.classId)
        if (pageId) {
            this.$store.commit("SET_PAGE_STATE2", {
            level: this.level + 1,
            pageId: pageId,
            selectedObjId: node.key
        });
      }
    },
    takeAction: async function (action, parentNode, valuePath) {
	  // console.log("action", action, subIdsName);

      if (action === 'addObject') {
        const classId = _.get(
          parentNode,
          'Xdata.queryArrObj.currentObj.key'
        )
        let newObject = {
          classId: classId,
          name: '[new object]',
          docType: 'object'
        }
        let key = await this.$store.dispatch('upsertCommon', newObject)
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
tr:hover {
  background-color: #4242426e !important;
}
</style>
