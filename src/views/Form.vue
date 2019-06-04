<template>
  <div>
    <!-- Wait for data and schema to arrive -->
    <v-container v-if="schema && data">

      <!-- For each of the properties in schema -->
      <div v-for="(property, propName) in schema.properties" v-bind:key="propName">

        <!-- Start owr layout. v-flex must be immidiate child-->
        <v-layout justify-start row wrap>

          <!-- Label: If we are in edit mode or, there is data for this property -->
          <v-flex xs12 md2 v-if="editMode || data[propName]">
            <div>{{ property.title }}</div>
          </v-flex>

          <!-- Value: If we are in edit mode or, there is data for this property -->
          <v-flex xs12 md10 v-if="editMode || data[propName]">

            <!-- Richtext -->
            <div v-if="propertyHas( property, 'media.mediaType', 'text/html') ">
              <div v-if="!editMode || property.readOnly">
                <div class="readOnlyInput" v-html="data[propName] ? data[propName] : property.default"></div>
              </div>
              <div v-else>
                <div class="readOnlyInput" v-html="data[propName] ? data[propName] : property.default"></div>
              </div>
            </div>

            <!-- WbbGl -->
            <div v-else-if="propertyHas( property, 'media.mediaType', 'image/webgl') ">
              <div v-if="!editMode || property.readOnly">
                <img class="readOnlyInput" src="data[propName]" width="500px" height="500px">
              </div>
              <div v-else>
                <img src="data[propName]" width="500px" height="500px">
              </div>
            </div>

            <!-- Base64 -->
            <div v-else-if="propertyHas( property, 'media.type', 'image/png') ">
              <div v-if="!editMode || property.readOnly">
                <!--{{data[propName]}}-->
                <img class="readOnlyInput" v-bind:src="data[propName]">
              </div>
              <div v-else>
                <img v-bind:src="data[propName]" width="24px" height="24px">
              </div>
            </div>

            <!-- Date -->
            <div v-else-if="propertyHas( property, 'media.format', 'date-time') ">
              <div v-if="!editMode || property.readOnly">
                <div class="readOnlyInput">Date.parse(data[propName]).toLocaleDateString()</div>
              </div>
              <div v-else>
                <div>Date.parse(data[propName]).toLocaleDateString()</div>
              </div>
            </div>

            <!-- Uri -->
            <div v-else-if="propertyHas( property, 'media.format', 'uri') ">
              <div v-if="!editMode || property.readOnly">
                <a class="readOnlyInput" uri="data[propName]"></a>
              </div>
              <div v-else>
                <a uri="data[propName]"></a>
              </div>
            </div>

            <!-- Enum -->
            <div v-else-if="propertyHas( property, 'enum' )">
              <v-select
                v-bind:label="property.title"
                v-model="data[propName]"
                :diaable="!editMode || property.readOnly || property.enum.length < 2"
                :items="property.enum"
              ></v-select>
            </div>

            <!-- Query -->
            <div v-else-if="propertyHas( property, 'query' )">
              <ec-select
                v-bind:key="data[propName]"
                v-bind:property="property"
                v-bind:readonly="property.readOnly || !editMode"
              ></ec-select>
            </div>

            <!--String-->
            <div v-else-if="propertyHas( property, 'type', 'string') ">
              <v-text-field
                v-bind:label="property.title"
                v-bind:disabled="property.readOnly || !editMode"
                v-bind:value="data[propName]"
                append-outer-icon="property.description ? 'help_outline'"
                v-bind:hint="property.description"
                single-line
                outline
              ></v-text-field>
            </div>

            <!--Number-->
            <div v-else-if="propertyHas( property, 'type', 'number') ">
              <v-text-field
                v-bind:label="property.title"
                v-bind:disabled="property.readOnly || !editMode"
                v-bind:value="data[propName]"
                type="number"
              ></v-text-field>
            </div>

            <!-- Boolean -->
            <div v-else-if="propertyHas( property, 'type', 'boolean') ">
              <div v-if="!editMode || property.readOnly">
                <div class="readOnlyInput">{{ data[propName] === true ? 'true' : 'false' }}</div>
              </div>
              <div v-else>
                <v-checkbox></v-checkbox>
              </div>
            </div>

            <!-- Array -->
            <div v-else-if="propertyHas( property, 'type', 'array') ">
                <div v-if="propertyHas( property.items, 'type', 'object') ">
                  <div v-for="(childData, idx) in data[propName]" v-bind:key="idx">
                    <ec-form
                      class="readOnlyInput"
                      v-bind:level="level"
                      v-bind:editMode="editMode"
                      v-bind:parent-data="childData"
                      v-bind:parent-schema="property.items"
                    ></ec-form>
                    <br>
                  </div>
                </div>
                <div v-else>
                  <div v-for="(childData, idx) in data[propName]" v-bind:key="idx">
                    <div class="readOnlyInput">{{ childData }}</div>
                  </div>
                </div>
            </div>

            <!-- Object -->
            <div v-else-if="propertyHas( property, 'type', 'object') ">
              <div class="readOnlyInput">
                <div v-if="property.properties">
                  <ec-form
                    v-bind:level="level"
                    v-bind:editMode="editMode"
                    v-bind:parent-data="data[propNane]"
                    v-bind:parent-schema="property"
                  ></ec-form>
                </div>
                <div v-else>
                  <div class="monoSpaced">{{ JSON.stringify(data[propNane], replacer, 2) }}></div>
                </div>
              </div>
            </div>

            <!--Json-->
            <div v-else-if="propertyHas(property, 'type', 'json')">
              <div v-if="!editMode || property.readOnly">
                <div class="readOnlyInput">{{ JSON.stringify(data[propName], null, 2) }}></div>
              </div>
              <div v-else>
                <div class="monoSpaced">{{ JSON.stringify(data[propName], null, 2) }}></div>
              </div>
            </div>

            <div v-else>
              <div>
                Unknown property: {{ propNane }}
                <br>
                <div class="monoSpaced">{{ JSON.stringify(property, replacer, 2) }}></div>
                <br>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </div>
</template>
<script>
import Vue from "vue";
import EosApiService from "../services/EosApiService";

export default {
  props: {
    level: Number,
    viewId: String,
    editMode: Boolean,
    parentSchema: {
      type: Object,
      default: null
    },
    parentData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      schema: this.parentSchema,
      data: this.parentData,
      childData: Object,
      model: {
        name: "Yourtion"
      }
    };
  },
  methods: {
    propertyHas(property, path, value) {
      if (value) return Vue._.get(property, path) === value;

      return !!Vue._.get(property, path);
    },
    propertyType(property, type) {
        console.log(Vue._.get(property, 'media.mediaType'), type)
      if(Vue._.get(property, 'media.mediaType') === type) return true
      if(Vue._.get(property, 'media.type') === type) return true
      if(Vue._.get(property, 'media.format') === type) return true
      if(property[type]) return true
      if(Vue._.get(property, 'type') === type) return true

      return false
    },
    replacer(name, val) {
      // console.log(name, val)
      if (name === "icon") {
        return undefined; // remove from result
      } else {
        return val;
      }
    },
    queryItems: async query => {
      const results = await this.$store.dispatch("query", query);
      return results;
    }
  },
  created() {
    if (!this.parentData) {
      this.$store.dispatch("getCommonByKey", "eoscommonsio").then(data => {
        // console.log('data', data)
        this.data = data;
      });
      /* this.$store.watch(
        state => state.levelIdsArr[this.level].selectedObjId,
        newVal => {
          // console.log('selectedObjId Changed!', newVal)
          if (!newVal) return;
          this.$store.dispatch("getCommonByKey", newVal).then(data => {
            // console.log('data', data)
            this.data = data;
          });
        },
        { immediate: true }
      ) */
    }

    if (!this.parentSchema && this.viewId) {
      this.$store.dispatch("materializedView", this.viewId).then(view => {
        // console.log('view', view)
        this.schema = view;
        EosApiService.getAccountInfo("eoscommonsio").then(info => {
          this.data = info;
        });
      });
    }
    /* if (this.parentData) this.data = this.parentData
      else {
        const pageDesc = this.$store.state.levelIdsArr[this.level]
        this.$store.dispatch('getCommonByKey', pageDesc.selectedObjId).then((data) => {
          console.log('data', data)
          this.data = data
        })
      } */
  }
};
</script>
<style scoped>
.readOnlyInput {
  background-color: #ffffff0d;
  min-height: 24px;
  padding-left: 4px;
}

.p {
  margin-bottom: 0;
}

.description {
  color: lightseagreen;
}

.monoSpaced {
  font-family: monospace, monospace;
  white-space: pre;
}

.input-alpha input {
  border: solid 1px #e6e6ea;
  /* height: 48px; */
  width: 100%;
  padding: 16px;
  border-radius: 2px;
  box-shadow: inset 0px 0px 0px 0px #f00;
  -webkit-appearance: none;
  -moz-appearance: none;
  font-size: 14px;
  transition: all 0.1s ease-in-out;
}

.input-alpha input:focus {
  outline: 0;
  border: 1px solid #00f;
}

.input-alpha input:focus + label {
  color: blue;
}

.input-alpha input:valid,
.input-alpha input:-webkit-autofill {
  padding: 26px 32px 10px 16px;
}

.input-alpha input:valid + label,
.input-alpha input:-webkit-autofill + label {
  top: 7px;
  transform: scale(0.8);
}
.input-alpha > .v-input__control {
  min-height: 24px;
}
.v-input__slot {
  border-width: 1px;
  border-color: darkblue;
}
.theme--dark .v-text-field--outline > .v-input__control > .v-input__slot {
  border-width: 1px;
  border-color: red;
}
</style>
