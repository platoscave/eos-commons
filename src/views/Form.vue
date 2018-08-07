<template>
    <div v-if="view">
        <v-container fluid grid-list-sm>
            <div v-for="(property, n) in view.properties" :key="n">
                <v-layout justify-start wrap>
                    <v-flex xs2 class="rightAligned">{{ property.title }}</v-flex>
                    <v-flex>
                        <div style="background-color:blue">BBBBBBB BBBBBB BBBBBBBBB</div>
                    </v-flex>
                    <!-- <v-flex xs2>
                         <div class="rightAligned" style="background-color:red">{{ property.title }}</div>
                     </v-flex>
                     <v-flex>
                         <div style="background-color:blue">BBBBBBB BBBBBB BBBBBBBBB</div>
                     </v-flex>-->

                    <!--
                    <vaadin-text-field class="full-width"
                                           value="{{propValue.value}}"
                                           minlength="[[propValue.minLength]]"
                                           maxlength="[[propValue.maxLength]]"
                                           prevent-invalid-input></vaadin-text-field>
                    -->
                </v-layout>

                <v-flex xs2 class="rightAligned">{{ property.title }}</v-flex>

                <v-flex>
                    <!-- Richtext -->
                    <div v-if="computeDidgitType(property,'html')">
                        <div v-if="!editMode || property.readOnly">
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                        <div v-else>
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>

                    </div>

                    <!-- Base64 -->
                    <div v-if="computeDidgitType(property,'img')">
                        <div v-if="!editMode || property.readOnly">
                            <img src="selectedObj.properties[property]" width="24px" height="24px">
                        </div>
                        <div v-else>
                            <img src="selectedObj.properties[property]" width="24px" height="24px">
                        </div>
                    </div>

                    <!-- WbbGl -->
                    <div v-if="computeDidgitType(property,'webGL')">
                        <div v-if="!editMode || property.readOnly">
                            <img src="selectedObj.properties[property]" width="500px" height="500px">
                        </div>
                        <div v-else>
                            <img src="selectedObj.properties[property]" width="500px" height="500px">
                        </div>
                    </div>

                    <!-- Date -->
                    <div v-if="computeDidgitType(property,'date')">
                        <div v-if="!editMode || property.readOnly">
                            <div>Date.parse(selectedObj.properties[property]).toLocaleDateString()</div>
                        </div>
                        <div v-else>
                            <div>Date.parse(selectedObj.properties[property]).toLocaleDateString()</div>
                        </div>
                    </div>

                    <!-- Uri -->
                    <div v-if="computeDidgitType(property,'uri')">
                        <div v-if="!editMode || property.readOnly">
                            <a uri="selectedObj.properties[property]"></a>
                        </div>
                        <div v-else>
                            <a uri="selectedObj.properties[property]"></a>
                        </div>
                    </div>

                    <!-- Enum -->
                    <div v-if="computeDidgitType(property,'enum')">
                        <div v-if="!editMode || property.readOnly">
                            <div>{{ selectedObj.properties[property] }}</div>
                        </div>
                        <div v-else>
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                    </div>

                    <!-- Query -->
                    <div v-if="computeDidgitType(property,'query')">
                        <div v-if="!editMode || property.readOnly">
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                        <div v-else>
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                        <!-- <nq-combobox
                                        query="[[property.query]]"
                                        doc-id="[[docId]]"
                                        read-only="[[computeReadOnly(property.readOnly,editMode)]]"
                                        value="{{propValue.value}}"
                                        noLabelFloat>
                                </nq-combobox>-->
                    </div>

                    <!--String-->
                    <div v-if="computeDidgitType(property,'string')">
                        <div v-if="!editMode || property.readOnly">
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                        <div v-else>
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                    </div>

                    <!--Number-->
                    <div v-if="computeDidgitType(property,'number')">
                        <div v-if="!editMode || property.readOnly">
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                        <div v-else>
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                    </div>

                    <!-- Boolean -->
                    <div v-if="computeDidgitType(property,'boolean')">
                        <div v-if="!editMode || property.readOnly">
                            <div v-html="selectedObj.properties[property] === 'true' ? true : false"></div>
                        </div>
                        <div v-else>
                            <div v-html="selectedObj.properties[property] === 'true' ? true : false"></div>
                        </div>
                    </div>

                    <!-- Array -->
                    <div v-if="computeDidgitType(property,'array')">
                        <div v-if="!editMode || property.readOnly">
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                        <div v-else>
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                    </div>

                    <!-- Object -->
                    <div v-if="computeDidgitType(property,'object')">
                        <div v-if="!editMode || property.readOnly">
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                        <div v-else>
                            <div v-html="selectedObj.properties[property]"></div>
                        </div>
                    </div>

                    <!--Json-->
                    <div v-if="computeDidgitType(property,'json')">
                        <div v-if="!editMode || property.readOnly">
                            <div>{{ JSON.stringify(selectedObj.properties[property], null, '    ') }}></div>
                        </div>
                        <div v-else>
                            <div>{{ JSON.stringify(selectedObj.properties[property], null, '    ') }}></div>
                        </div>
                    </div>
                </v-flex>
            </div>

        </v-container>
    </div>
</template>
<script>
  // import JsonEditor from 'vue-json-ui-editor'
  // JsonEditor.setComponent('form', 'v-form')
  export default {
    components: {},
    props: {
      level: Number,
      widget: Object
    },
    data() {
      return {
        editMode: false,
        view: null,
        selectedObj: null,
        // data
        model: {
          name: 'Yourtion',
        },
      }
    },
    methods: {
      computeDidgitType(attrProps, type) {
        //console.log('tpye', type, attrProps  );
        if (attrProps.type === 'string') {
          if (attrProps.media) {
            if (attrProps.media.mediaType === 'text/html') return type === 'html';
            if (attrProps.media.type === 'image/png') return type === 'img';//TODO should this be mediaType?
            if (attrProps.media.mediaType === 'image/webgl') return type === 'webGl';
          }
          if (attrProps.format) {
            if (attrProps.media.format === 'date-time') return type === 'date';
            if (attrProps.media.format === 'uri') return type === 'a';
          }
          if (attrProps.enum) return type === 'enum';
          if (attrProps.query) return type === 'query';
          return type === 'string';
        }
        else if (attrProps.type === 'object') {
          if (attrProps.properties) return type === 'object';
          else return type === 'json';
        }
        else return attrProps.type === type;
      },
      submit(_e) {
        alert(JSON.stringify(this.model));
      },
      reset() {
        this.$refs.JsonEditor.reset();
      },
    },
    created() {
      this.$store.dispatch('materializedView', this.widget.viewId).then((view) => {
        console.log('view', view)
        this.view = view
      })
    }
  }
</script>
<style>
    .rightAligned {
        text-align: right;
    }

</style>