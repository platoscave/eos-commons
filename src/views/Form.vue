<template>
    <div>
        <template v-if="schema && data">
            <v-container fluid grid-list-md>
                <template v-for="(property, key) in schema.properties">
                    <template v-if="data[key]" >
                        <v-layout justify-start v-bind:key="key">
                            <v-flex >
                                <!--key-->
                                <template v-if="key === 'key'">
                                    <a href="https://ipfs.io/ipfs/ + data[key]" target="_blank">{{ data[key] }}</a>
                                </template>

                                <!-- Richtext -->
                                <template v-else-if="propertyHas( property, 'media.mediaType', 'text/html') ">
                                    <template v-if="!editMode || property.readOnly">
                                        <div class="readOnlyInput" v-html="data[key] ? data[key] : property.default"></div>
                                    </template>
                                    <template v-else>
                                        <div class="readOnlyInput" v-html="data[key] ? data[key] : property.default"></div>
                                    </template>
                                </template>

                                <!-- WbbGl -->
                                <template v-else-if="propertyHas( property, 'media.mediaType', 'image/webgl') ">
                                    <template v-if="!editMode || property.readOnly">
                                        <img class="readOnlyInput" src="data[key]" width="500px" height="500px">
                                    </template>
                                    <template v-else>
                                        <img src="data[key]" width="500px" height="500px">
                                    </template>
                                </template>

                                <!-- Base64 -->
                                <template v-else-if="propertyHas( property, 'media.type', 'image/png') ">
                                    <template v-if="!editMode || property.readOnly">
                                        <!--{{data[key]}}-->
                                        <img class="readOnlyInput" v-bind:src="data[key]">
                                    </template>
                                    <template v-else>
                                        <img v-bind:src="data[key]" width="24px" height="24px">
                                    </template>
                                </template>

                                <!-- Date -->
                                <template v-else-if="propertyHas( property, 'media.format', 'date-time') ">
                                    <template v-if="!editMode || property.readOnly">
                                        <div class="readOnlyInput">Date.parse(data[key]).toLocaleDateString()</div>
                                    </template>
                                    <template v-else>
                                        <div>Date.parse(data[key]).toLocaleDateString()</div>
                                    </template>
                                </template>

                                <!-- Uri -->
                                <template v-else-if="propertyHas( property, 'media.format', 'uri') ">
                                    <template v-if="!editMode || property.readOnly">
                                        <a class="readOnlyInput" uri="data[key]"></a>
                                    </template>
                                    <template v-else>
                                        <a uri="data[key]"></a>
                                    </template>
                                </template>

                                <!-- Enum -->
                                <template v-else-if="propertyHas( property, 'enum' )">
                                    <v-select
                                        v-bind:label="property.title"
                                        v-model="data[key]"
                                        :diaable="!editMode || property.readOnly || property.enum.length < 2"
                                        :items="property.enum"
                                    ></v-select>
                                </template>

                                <!-- Query -->
                                <template v-else-if="propertyHas( property, 'query' )">
                                    <ec-select
                                        v-bind:key="data[key]"
                                        v-bind:property="property"
                                        v-bind:readonly="property.readOnly || !editMode"
                                    ></ec-select>
                                </template>

                                <!--String-->
                                <template v-else-if="propertyHas( property, 'type', 'string') ">
                                    <v-text-field
                                        v-bind:label="property.title"
                                        v-bind:disabled="property.readOnly || !editMode"
                                        v-bind:value="data[key]"
                                        append-outer-icon="property.description ? 'help_outline'"
                                        v-bind:hint="property.description">
                                    </v-text-field>
                                </template>

                                <!--Number-->
                                <template v-else-if="propertyHas( property, 'type', 'number') ">
                                   <v-text-field
                                        v-bind:label="property.title"
                                        v-bind:disabled="property.readOnly || !editMode"
                                        v-bind:value="data[key]"
                                        type="number">
                                    </v-text-field>
                                </template>

                                <!-- Boolean -->
                                <template v-else-if="propertyHas( property, 'type', 'boolean') ">
                                    <template v-if="!editMode || property.readOnly">
                                        <div class="readOnlyInput">{{ data[key] === true ? 'true' : 'false' }}</div>
                                    </template>
                                    <template v-else>
                                        <v-checkbox></v-checkbox>
                                    </template>
                                </template>

                                <!-- Array -->
                                <template v-else-if="propertyHas( property, 'type', 'array') ">
                                    <div>
                                        <!--<v-layout column>-->
                                        <template v-if="propertyHas( property.items, 'type', 'object') ">
                                            <template v-for="(childData, key) in data[key]">
                                                <!--<flex>-->
                                                <ec-form class="readOnlyInput" v-bind:level="level"
                                                         v-bind:editMode="editMode"
                                                         v-bind:parent-data="childData"
                                                         v-bind:parent-schema="property.items"
                                                         v-bind:key="key"></ec-form>
                                                <!--</flex>-->
                                                <br v-bind:key="key">
                                            </template>
                                        </template>
                                        <template v-else>
                                            <template v-for="(childData, key) in data[key]">
                                                <div class="readOnlyInput" v-bind:key="key">{{ childData }}</div>
                                            </template>
                                        </template>

                                        <!--</v-layout>-->
                                    </div>
                                </template>

                                <!-- Object -->
                                <template v-else-if="propertyHas( property, 'type', 'object') ">
                                    <div class="readOnlyInput">
                                        <template v-if="property.properties">
                                            <ec-form v-bind:level="level"
                                                     v-bind:editMode="editMode"
                                                     v-bind:parent-data="data[key]"
                                                     v-bind:parent-schema="property"></ec-form>
                                        </template>
                                        <template v-else>
                                            <div class="monoSpaced">{{ JSON.stringify(data[key], replacer, 2) }}></div>
                                            <!--<div>{{ JSON.stringify(data[key], replacer, 2) }}></div>-->
                                        </template>
                                    </div>
                                </template>

                                <!--Json-->
                                <template v-else-if="propertyHas(property, 'type', 'json')">
                                    <template v-if="!editMode || property.readOnly">
                                        <div class="readOnlyInput">{{ JSON.stringify(data[key], null, 2) }}></div>
                                    </template>
                                    <template v-else>
                                        <div class="monoSpaced">{{ JSON.stringify(data[key], null, 2) }}></div>
                                    </template>
                                </template>

                                <template v-else>
                                    <div>Unknown property: {{ key }} <br>
                                        <div class="monoSpaced">{{ JSON.stringify(property, replacer, 2) }}></div><!--
                                    Data: <br>
                                    <div class="monoSpaced">{{ JSON.stringify(data[key], replacer, 2) }}></div>-->
                                        <br>
                                    </div>
                                </template>
                            </v-flex>
                        </v-layout>
                    </template>
                </template>
            </v-container>
        </template>
    </div>
</template>
<script>
import Vue from 'vue'

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
  data () {
    return {
      schema: this.parentSchema,
      data: this.parentData,
      childData: Object,
      model: {
        name: 'Yourtion'
      }
    }
  },
  methods: {
    propertyHas (property, path, value) {
      if (value) return Vue._.get(property, path) === value
      return !!Vue._.get(property, path)
    },
    replacer (name, val) {
      // console.log(name, val)
      if (name === 'icon') {
        return undefined // remove from result
      } else {
        return val
      }
    },
    getCommonByKey: async (id) => {
      if (!id) return '[null]'
      const obj = await this.$store.dispatch('getCommonByKey', id)
      if (!obj) return '[not found: ' + id + ']'
      return obj.name ? obj.name : obj.title
    },
    queryItems: async (query) => {
      const results = await this.$store.dispatch('query', query)
      return results
    }
  },
  created () {
    if (!this.parentData) {
      this.$store.watch(
        state => state.levelIdsArr[this.level].selectedObjId,
        newVal => {
          // console.log('selectedObjId Changed!', newVal)
          if (!newVal) return
          this.$store.dispatch('getCommonByKey', newVal).then(data => {
            // console.log('data', data)
            this.data = data
          })
        },
        { immediate: true }
      )
    }

    if (!this.parentSchema && this.viewId) {
      this.$store.dispatch('materializedView', this.viewId).then(view => {
        // console.log('view', view)
        this.schema = view
      })
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
}
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
        color: lightseagreen
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
