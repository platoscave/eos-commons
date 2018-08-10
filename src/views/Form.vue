<template>
    <div>
        <template v-if="schema && data">
            <v-container fluid grid-list-md>
                <template v-for="(property, key) in schema.properties">
                    <v-layout justify-start>
                        <!--
                        <vaadin-text-field class="full-width"
                                               value="{{propValue.value}}"
                                               minlength="[[propValue.minLength]]"
                                               maxlength="[[propValue.maxLength]]"
                                               prevent-invalid-input></vaadin-text-field >
                        -->
                        <v-flex xs2 class="text-xs-right">{{ property.title }}</v-flex>

                        <v-flex xs6>
                            <!-- Richtext -->
                            <template v-if="propertyHas( property, 'media.mediaType', 'text/html') ">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput" v-html="data[key]"></div>
                                </template>
                                <template v-else>
                                    <div v-html="data[key]"></div>
                                </template>
                            </template>

                            <!-- WbbGl -->
                            <template v-else-if="propertyHas( property, 'media.mediaType', 'image/webgl') ">
                                <template v-if="!editMode || property.readOnly">
                                    <img  class="readOnlyInput" src="data[key]" width="500px" height="500px">
                                </template>
                                <template v-else>
                                    <img src="data[key]" width="500px" height="500px">
                                </template>
                            </template>

                            <!-- Base64 -->
                            <template v-else-if="propertyHas( property, 'media.type', 'image/png') ">
                                <template v-if="!editMode || property.readOnly">
                                    <img  class="readOnlyInput" src="data[key]" width="24px" height="24px">
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
                            <template v-if="propertyHas( property, 'media.format', 'uri') ">
                                <template v-if="!editMode || property.readOnly">
                                    <a class="readOnlyInput" uri="data[key]"></a>
                                </template>
                                <template v-else>
                                    <a uri="data[key]"></a>
                                </template>
                            </template>

                            <!-- Enum -->
                            <template v-else-if="propertyHas( property, 'enum' )">
                                <!--{{ key }} <br>
                                {{ data }}
                                    <br>
                                {{ data[key] }}-->
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
                                    <div class="readOnlyInput">{{ data[key] }}</div>
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
                                    <div v-html="data[key] === 'true' ? true : false"></div>
                                </template>
                            </template>

                            <!-- Array -->
                            <template v-else-if="propertyHas( property, 'type', 'array') ">
                                <template v-for="(data, n) in data[key]">
                                    <ec-form v-bind:level="level"
                                             v-bind:editMode="editMode"
                                             v-bind:data="data"
                                             v-bind:schema="property.items"></ec-form>
                                </template>
                            </template>

                            <!-- Object -->
                            <template v-else-if="propertyHas( property, 'type', 'object') ">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">{{ data[key] }}</div>
                                </template>
                                <template v-else>
                                    <div>{{ data[key] }}</div>
                                </template>
                            </template>

                            <!--Json-->
                            <template v-else-if="propertyHas(property, 'type', 'json')">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">{{ JSON.stringify(data[key], null, '    ') }}></div>
                                </template>
                                <template v-else>
                                    <div>{{ JSON.stringify(data[key], null, '    ') }}></div>
                                </template>
                            </template>

                            <template v-else>
                                <div>Unknown property: {{ key }}</div>
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
    parentSchema: Object,
    parentData: Object
  },
  /*    computed: {
      schema() {
        if (this.viewId){
          this.$store.dispatch('materializedView', this.viewId).then((view) => {
            console.log('view', view)
            return view
          })
        }
        return this.schema
      },
      data() {
        if (this.data) return this.data
        else {
          const pageDesc = this.$store.state.levelIdsArr[this.level]
          this.$store.dispatch('loadCommon', pageDesc.selectedObjId).then((selectedObj) => {
            console.log('selectedObj', selectedObj)
            return selectedObj
          })
        }
      }
    }, */
  data () {
    return {
      editMode: false,
      schema: null,
      data: null,
      model: {
        name: 'Yourtion'
      }
    }
  },
  methods: {
    propertyHas (property, path, value) {
      if (value) return Vue._.get(property, path) === value
      return Vue._.get(property, path)
    },

    submit (_e) {
      alert(JSON.stringify(this.model))
    },
    reset () {
      this.$refs.JsonEditor.reset()
    }
  },
  watch: {
    viewId (viewId) {
      console.log(viewId)
    },
    parentSchema (schema) {
      console.log(schema)
    },
    parentData (data) {
      console.log(data)
    }
  },
  created () {
    if (!this.viewId) return
    this.$store.dispatch('materializedView', this.viewId).then((view) => {
      console.log('view', Object.keys(view.properties))
      this.schema = view
    })

    const pageDesc = this.$store.state.levelIdsArr[this.level]
    this.$store.dispatch('loadCommon', pageDesc.selectedObjId).then((selectedObj) => {
      console.log('selectedObj', selectedObj)
      this.data = selectedObj
    })
  }
}
</script>
<style>
    .readOnlyInput {
        background-color: #424242;
        padding: 5px;
    }

</style>
