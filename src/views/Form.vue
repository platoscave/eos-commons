<template>
    <div>
        <template v-if="view && selectedObj">
            <v-container fluid grid-list-md>
                <template v-for="(property, key) in view.properties">
                    <!--<template  v-if="property">-->
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
                                    <div class="readOnlyInput" v-html="selectedObj[key]"></div>
                                </template>
                                <template v-else>
                                    <div v-html="selectedObj[key]"></div>
                                </template>
                            </template>

                            <!-- WbbGl -->
                            <template v-if="propertyHas( property, 'media.mediaType', 'image/webgl') ">
                                <template v-if="!editMode || property.readOnly">
                                    <img  class="readOnlyInput" src="selectedObj[key]" width="500px" height="500px">
                                </template>
                                <template v-else>
                                    <img src="selectedObj[key]" width="500px" height="500px">
                                </template>
                            </template>

                            <!-- Base64 -->
                            <template v-if="propertyHas( property, 'media.type', 'image/png') ">
                                <template v-if="!editMode || property.readOnly">
                                    <img  class="readOnlyInput" src="selectedObj[key]" width="24px" height="24px">
                                </template>
                                <template v-else>
                                    <img src="selectedObj[key]" width="24px" height="24px">
                                </template>
                            </template>

                            <!-- Date -->
                            <template v-if="propertyHas( property, 'media.format', 'date-time') ">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">Date.parse(selectedObj[key]).toLocaleDateString()</div>
                                </template>
                                <template v-else>
                                    <div>Date.parse(selectedObj[key]).toLocaleDateString()</div>
                                </template>
                            </template>

                            <!-- Uri -->
                            <template v-if="propertyHas( property, 'media.format', 'uri') ">
                                <template v-if="!editMode || property.readOnly">
                                    <a class="readOnlyInput" uri="selectedObj[key]"></a>
                                </template>
                                <template v-else>
                                    <a uri="selectedObj[key]"></a>
                                </template>
                            </template>

                            <!-- Enum -->
                            <template v-if="propertyHas( property, 'enum' )">
                                <!--{{ key }} <br>
                                {{ selectedObj }}
                                    <br>
                                {{ selectedObj[key] }}-->
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">{{ selectedObj[key] }}</div>
                                </template>
                                <template v-else>
                                    <div>{{ selectedObj[key] }}</div>
                                </template>
                            </template>

                            <!-- Query -->
                            <template v-if="propertyHas( property, 'query' )">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">{{ selectedObj[key] }}</div>
                                </template>
                                <template v-else>
                                    <div>{{ selectedObj[key] }}</div>
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
                            <template v-if="propertyHas( property, 'type', 'string') ">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">{{ selectedObj[key] }}</div>
                                </template>
                                <template v-else>
                                    <div>{{ selectedObj[key] }}</div>
                                </template>
                            </template>

                            <!--Number-->
                            <template v-if="propertyHas( property, 'type', 'number') ">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">{{ selectedObj[key] }}</div>
                                </template>
                                <template v-else>
                                    <div>{{ selectedObj[key] }}</div>
                                </template>
                            </template>

                            <!-- Boolean -->
                            <template v-if="propertyHas( property, 'type', 'boolean') ">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">{{ selectedObj[key] === true ? 'true' : 'false' }}</div>
                                </template>
                                <template v-else>
                                    <div v-html="selectedObj[key] === 'true' ? true : false"></div>
                                </template>
                            </template>

                            <!-- Array -->
                            <template v-if="propertyHas( property, 'type', 'array') ">
                                <template v-for="(data, n) in selectedObj[key]">
                                    <ec-form v-bind:level="level"
                                             v-bind:editMode="editMode"
                                             v-bind:data="data"
                                             v-bind:schema="property[key].items"></ec-form>
                                </template>
                            </template>

                            <!-- Object -->
                            <template v-if="propertyHas( property, 'type', 'object') ">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">{{ selectedObj[key] }}</div>
                                </template>
                                <template v-else>
                                    <div>{{ selectedObj[key] }}</div>
                                </template>
                            </template>

                            <!--Json-->
                            <template v-else-if="propertyHas(property, 'type', 'json')">
                                <template v-if="!editMode || property.readOnly">
                                    <div class="readOnlyInput">{{ JSON.stringify(selectedObj[key], null, '    ') }}></div>
                                </template>
                                <template v-else>
                                    <div>{{ JSON.stringify(selectedObj[key], null, '    ') }}></div>
                                </template>
                            </template>

                            <template v-else>
                                <div>Unknown property: {{ property }}</div>
                            </template>
                        </v-flex>
                    </v-layout>
                </template>
            </v-container>
        </template>
    </div>
</template>
<script>
  // import JsonEditor from 'vue-json-ui-editor'
  // JsonEditor.setComponent('form', 'v-form')
  import Vue from 'vue'
  export default {
    components: {},
    props: {
      level: Number,
      widget: Object,
      schema: Object,
      data: Object
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
      propertyHas(property, path, value) {
        console.log('propertyHas', property, path, value)
        if(Vue._.get(property, path) === value) console.log('YES')
        if (value) return Vue._.get(property, path) === value
        return Vue._.get(property, path)
      },
      /*computeDidgitType(attrProps, type) {
        if (Vue._.get( attrProps, 'media.mediaType' ) === 'text/html');
        if (Vue._.get( attrProps, 'media.mediaType' ) === 'image/webgl');
        if (Vue._.get( attrProps, 'media.type' ) === 'image/png');// TODO should this be mediaType?
        if (Vue._.get( attrProps, 'media.format' ) === 'date-time');
        if (Vue._.get( attrProps, 'media.format' ) === 'uri');
        if (Vue._.get( attrProps, 'properties' ));
        if (Vue._.get( attrProps, 'enum' ));
        if (Vue._.get( attrProps, 'query' ));
        if (Vue._.get( attrProps, 'type' ) === 'string');
        if (Vue._.get( attrProps, 'type' ) === 'number');
        if (Vue._.get( attrProps, 'type' ) === 'json');
        switch(type) {
          case 'html':
            code block
            break;
          case 'img':
            code block
            break;
          default:
            code block
        }
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
      },*/
      submit(_e) {
        alert(JSON.stringify(this.model));
      },
      reset() {
        this.$refs.JsonEditor.reset();
      },
    },
    created() {
      this.$store.dispatch('materializedView', this.widget.viewId).then((view) => {
        console.log('view', Object.keys(view.properties))
        this.view = view
      })

      const pageDesc = this.$store.state.levelIdsArr[this.level]
      this.$store.dispatch('loadCommon', pageDesc.selectedObjId).then((selectedObj) => {
        console.log('selectedObj', selectedObj)
        this.selectedObj = selectedObj
      })

      /*this.$store.dispatch('query', viewQueryObj).then((selectedObjArr) => {
        console.log('selectedObj', selectedObjArr[0])
        this.selectedObj = selectedObjArr[0]
      })*/

      /*this.$store.dispatch('loadCommon', pageDesc.selectedObjId).then((selectedObj) => {
        console.log('selectedObj', selectedObj)
        this.selectedObj = selectedObj
      })*/
    }
  }
</script>
<style>
    .readOnlyInput {
        background-color: #424242;
        padding: 5px;
    }

</style>