<template>
    <div>
        <template v-if="schema && data">
            <v-container fluid grid-list-md>
                <template v-for="(property, key) in schema.properties">
                    <template v-if="data[key]" >
                        <v-layout justify-start v-bind:key="key">
                            <!--
                            <vaadin-text-field class="full-width"
                                                   value="{{propValue.value}}"
                                                   minlength="[[propValue.minLength]]"
                                                   maxlength="[[propValue.maxLength]]"
                                                   prevent-invalid-input></vaadin-text-field >
                            -->
                            <v-flex xs2 class="text-xs-right pa--5">{{ property.title }}</v-flex>

                            <v-flex >
                                <!-- Richtext -->
                                <template v-if="propertyHas( property, 'media.mediaType', 'text/html') ">
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
                                    <template v-if="!editMode || property.readOnly">
                                        <div class="readOnlyInput">{{ data[key] }}</div>
                                    </template>
                                    <template v-else>
                                        <div>{{ data[key] }}</div>
                                    </template>
                                </template>

                                <!-- Query -->
                                <template v-else-if="propertyHas( property, 'query' )">
                                    <template v-if="!editMode || property.readOnly">
                                        <div class="readOnlyInput">{{ getCommonByCid(data[key]) }}</div>
                                    </template>
                                    <template v-else>
                                        <v-select outline></v-select>
                                    </template>
                                    <!-- <nq-combobox
                                                    query="[[property.query]]"
                                                    doc-id="[[docId]]"
                                                    read-only="[[computeReadOnly(property.readOnly,editMode)]]"
                                                    value="{{propValue.value}}"
                                                    noLabelFloat>
                                            </nq-combobox>-->
                                </template>

                                <!--String-->
                                <template v-else-if="propertyHas( property, 'type', 'string') ">
                                    <template v-if="!editMode || property.readOnly">
                                        <div class="readOnlyInput">{{ data[key] }}</div>
                                    </template>
                                    <template v-else>
                                        <v-text-field outline></v-text-field>
                                    </template>
                                </template>

                                <!--Number-->
                                <template v-else-if="propertyHas( property, 'type', 'number') ">
                                    <template v-if="!editMode || property.readOnly">
                                        <div class="readOnlyInput">{{ data[key] }}</div>
                                    </template>
                                    <template v-else>
                                        <div>{{ data[key] }}</div>
                                    </template>
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
                                            </template>                                       </template>
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
    getCommonByCid (id) {
      if (!id) return '[null]'
      const obj = this.$store.state.classes[id]
      if (!obj) return '[not found: ' + id + ']'
      return obj.name ? obj.name : obj.title
    }
  },
  created () {
    if (!this.parentData) {
      this.$store.watch(
        state => state.levelIdsArr[this.level].selectedObjId,
        newVal => {
          console.log('selectedObjId Changed!', newVal)
          if (!newVal) return
          this.$store.dispatch('getCommonByCid', newVal).then(data => {
            console.log('data', data)
            this.data = data
          })
        },
        { immediate: true }
      )
    }

    if (!this.parentSchema && this.viewId) {
      this.$store.dispatch('materializedView', this.viewId).then(view => {
        console.log('view', view)
        this.schema = view
      })
    }
    /* if (this.parentData) this.data = this.parentData
      else {
        const pageDesc = this.$store.state.levelIdsArr[this.level]
        this.$store.dispatch('getCommonByCid', pageDesc.selectedObjId).then((data) => {
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

.monoSpaced {
  font-family: monospace, monospace;
  white-space: pre;
}

.xcontainer {
  padding: 0;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  max-width: none;
  scroll: auto;
}
</style>
