<template>
    <div>
        <template v-if="schema && data">
            <v-container fluid grid-list-md>
                <!--{{ data }} <br>-->
                <template v-for="(property, key) in schema.properties">
                    <v-layout justify-start>
                        <!--{{ property }} <br>-->
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
                                    <div v-html="data[key]"></div>
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
                                    <img class="readOnlyInput" src="data[key]" width="24px" height="24px">
                                </template>
                                <template v-else>
                                    <img src="data[key]" width="24px" height="24px">
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
                                    <text class="readOnlyInput">{{ JSON.stringify(data[key], replacer, 2) }}></text>
                                </template>
                                <template v-else>
                                    <div>{{ data[key] }}</div>
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
                                    <div>{{ data[key] }}</div>
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
                                    <div>{{ data[key] === true ? 'true' : 'false' }}</div>
                                </template>
                            </template>

                            <!-- Array -->
                            <template v-else-if="propertyHas( property, 'type', 'array') ">
                                <div class="readOnlyInput">
                                    <template v-for="(childData, n) in data[key]">
                                        <ec-form v-bind:level="level"
                                                 v-bind:editMode="editMode"
                                                 v-bind:parent-data="childData"
                                                 v-bind:parent-schema="property.items"></ec-form>
                                    </template>
                                </div>
                            </template>

                            <!-- Object -->
                            <template v-else-if="propertyHas( property, 'type', 'object') ">
                                <div class="readOnlyInput">
                                    <template v-if="property.properties">
                                        <!--{{ data[key]  }} <br>
                                        {{ property.properties }} <br>-->
                                        <ec-form v-bind:level="level"
                                                 v-bind:editMode="editMode"
                                                 v-bind:parent-data="data[key]"
                                                 v-bind:parent-schema="property"></ec-form>
                                    </template>
                                    <template v-else>
                                        <code>{{ JSON.stringify(data[key], replacer, 2) }}></code>
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
                                    <div>{{ JSON.stringify(data[key], null, 2) }}></div>
                                </template>
                            </template>

                            <template v-else>
                                <code>Unknown property: <br> {{ property }} <br> <br>{{ data }}</code>
                            </template>
                        </v-flex>
                    </v-layout>
                </template>
            </v-container>
        </template>
    </div>
</template>
<script>
  import Vue from 'vue'

  export default {
    components: {},
    props: {
      level: Number,
      viewId: String,
      parentSchema: {
        type: Object,
        default: null
      },
      parentData: {
        type: Object,
        default: null
      },
    },
    data() {
      return {
        editMode: false,
        schema: this.parentSchema,
        data: this.parentData,
        childData: Object,
        model: {
          name: 'Yourtion'
        }
      }
    },
    methods: {
      propertyHas(property, path, value) {
        if (value) return (Vue._.get(property, path) === value)
        return !!(Vue._.get(property, path))
      },
      replacer(name, val) {
        console.log(name, val)
        if ( name === 'icon' ) {
          return undefined; // remove from result
        } else {
          return val
        }
      }
    },
/*    watch: {
      viewId(viewId) {
        console.log('viewId', viewId)
      },
      parentSchema(schema) {
        console.log('parentSchema', schema)
      },
      parentData(data) {
        console.log('parentData', data)
      }
    },*/
    created() {
      if (this.viewId) {
        this.$store.dispatch('materializedView', this.viewId).then((view) => {
          console.log('view', view)
          this.schema = view
        })
      }
      if (this.parentData) this.data = this.parentData
      else {
        const pageDesc = this.$store.state.levelIdsArr[this.level]
        this.$store.dispatch('loadCommon', pageDesc.selectedObjId).then((data) => {
          console.log('data', data)
          this.data = data
        })
      }
    }
  }
</script>
<style scoped>
    .readOnlyInput {
        background-color: #ffffff0d;
        min-height: 20px;
        padding-left: 4px;
        margin-bottom: 0;
    }
    .container {
        padding: 0;
    }
    p {
        margin-bottom: 0;
    }
</style>
