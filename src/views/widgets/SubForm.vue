<template>
  <div>
    <v-container>
      <!-- For each of the properties in schema -->
      <div v-for="(property, propName) in properties" v-bind:key="propName">
        <!-- Start owr layout. v-flex must be immidiate child-->
        <v-layout justify-start row wrap>
          <!-- Label: If we are in edit mode or, there is data for this property -->
          <v-flex class="label" xs12 md2 v-if="editMode || value[propName]">
            <div>{{ property.title }}</div>
          </v-flex>

          <!-- Value: If we are in edit mode or, there is data for this property -->
          <v-flex xs12 md10 v-if="editMode || value[propName]">
            <!-- Richtext -->
            <div v-if="property.media && property.media.mediaType === 'text/html' ">
              <div
                class="outputclass"
                v-if="!editMode || property.readOnly"
                v-html="value[propName] ? value[propName] : property.default"
              ></div>
              <div v-else>
                <wysiwyg class="outputclass" v-model="value[propName]"/>
              </div>
            </div>

            <!-- WbbGl -->
            <div v-else-if="property.media && property.media.mediaType === 'image/webgl' ">
              <div v-if="!editMode || property.readOnly">
                <img class="outputclass" src="value[propName]" width="500px" height="500px">
              </div>
              <div v-else>
                <img src="value[propName]" width="500px" height="500px">
              </div>
            </div>

            <!-- Base64 -->
            <div v-else-if="property.media && property.media.type === 'image/png' ">
              <div class="outputclass" v-if="!editMode || property.readOnly">
                <!--{{value[propName]}}-->
                <img class="outputclass" v-bind:src="value[propName]">
              </div>
              <div v-else>
                <img v-bind:src="value[propName]" width="24px" height="24px">
              </div>
            </div>

            <!-- Date -->
            <div v-else-if="property && property.format === 'date-time' ">
              <div class="outputclass" v-if="!editMode || property.readOnly">
                <div>{{ new Date(Date.parse(value[propName])).toLocaleDateString() }}</div>
              </div>
              <div v-else>
                <div>{{ new Date(Date.parse(value[propName])).toLocaleDateString() }}</div>
              </div>
            </div>

            <!-- Uri -->
            <div v-else-if="property.media && property.media.format === 'uri' ">
              <div v-if="!editMode || property.readOnly">
                <a class="outputclass" uri="value[propName]"></a>
              </div>
              <div v-else>
                <a uri="value[propName]"></a>
              </div>
            </div>

            <!-- Enum -->
            <div v-else-if="property.enum">
              <div class="outputclass" v-if="!editMode || property.readOnly">{{ value[propName] }}</div>
              <div v-else>
                <v-select
                  class="outputclass"
                  v-bind:label="property.title"
                  v-model="value[propName]"
                  v-bind:readonly="!editMode || property.readOnly || property.enum.length < 2"
                  v-bind:items="property.enum"
                  single-line
                  outline
                ></v-select>
              </div>
            </div>

            <!-- Select from Query Results -->
            <div v-else-if="property.query">
              <ec-select
                v-model="value[propName]"
                v-bind:query="property.query"
                v-bind:readonly="property.readOnly || !editMode"
              ></ec-select>
            </div>

            <!--String-->
            <div v-else-if="property.type === 'string'">
              <div class="outputclass" v-if="!editMode || property.readOnly">{{ value[propName] }}</div>
              <div v-else>
                <v-text-field
                  class="outputclass"
                  v-model.trim="value[propName]"
                  single-line
                  outline
                ></v-text-field>
              </div>
              <!-- v-bind:hint="property.description"
              append-outer-icon="property.description ? 'help_outline'"-->
            </div>

            <!--Number-->
            <div v-else-if="property.type === 'number'">
              <div class="outputclass" v-if="!editMode || property.readOnly">{{ value[propName] }}</div>
              <div v-else>
                <v-text-field
                  class="inputclass"
                  v-model.number="value[propName]"
                  type="number"
                  single-line
                  outline
                ></v-text-field>
              </div>
            </div>

            <!-- Boolean -->
            <div v-else-if="property.type === 'boolean'">
              <div v-if="!editMode || property.readOnly">
                <div class="outputclass">{{ value[propName] === true ? 'true' : 'false' }}</div>
              </div>
              <div v-else>
                <v-checkbox value="value[propName]"></v-checkbox>
              </div>
            </div>

            <!-- Array -->
            <div v-else-if="property.type === 'array'">
              <div class="outputclass">
                <div v-if="property.items.type === 'object'">
                  <div v-for="(childData, idx) in value[propName]" v-bind:key="idx">
                    <ec-sub-form
                      class="outputclass"
                      v-bind:editMode="editMode"
                      v-model="value[propName][idx]"
                      v-bind:properties="property.items.properties"
                    ></ec-sub-form>
                    <br>
                  </div>
                </div>
                <div v-else>
                  <div v-for="(childData, idx) in value[propName]" v-bind:key="idx">
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
                    v-model="value[propName]"
                    v-bind:properties="property.properties"
                  ></ec-sub-form>
                </div>
                <div v-else-if="property.additionalProperties">
                  <div
                    v-for="(childData, subPropName) in baseClassViewObj[propName]"
                    v-bind:key="subPropName"
                  >
                    <div class="outputclass">{{ subPropName }}</div>
                    <!-- <div class="outputclass">{{ baseClassViewObj[propName][subPropName] }}</div> -->
                    <ec-sub-form
                      class="outputclass"
                      v-bind:editMode="editMode"
                      v-model="baseClassViewObj[propName][subPropName]"
                      v-bind:properties="property.additionalProperties"
                    ></ec-sub-form>
                    <br>
                  </div>
                </div>
                <div v-else>
                  <div class="monoSpaced">{{ JSON.stringify(value[propName], replacer, 2) }}></div>
                </div>
              </div>
            </div>

            <div v-else>
              <div>
                Unknown property: {{ propName }}
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
export default {
  name: "subForm",
  props: {
    editMode: Boolean,
    properties: Object,
    definitions: Object,
    value: Object
  },
  data() {
    return {
    	baseClassViewObj: {}
    };
  },
  methods: {
    replacer(name, val) {
      // we do this because icons are very long
      if (name === "icon") return "base64 icon string";
      else return val;
	},
	getSubView: async function() {
		if(!this.value) return
		// If value (object being edited) is a View, go ahead and materialize it
		if (this.value.classId === "pylvseoljret") {
			let baseClassViewObj = await this.$store.dispatch(
				"materializedView",
				this.value.key
			)
			this.baseClassViewObj = baseClassViewObj
	  	}
	}
  },
  watch: {
    value: {
      handler: "getSubView",
	  deep: true,
	  immediate: true 
    }
  }
};
</script>
<style scoped>
.label {
  padding: 10px;
  font-size: 16px;
  line-height: 42px;
}
.outputclass {
  background-color: #ffffff0d;
  padding: 10px;
  font-size: 16px;
  line-height: 42px;
  border-radius: 5px;
  margin: 4px;
}

.v-input__slot {
  background-color: green !important;
  min-height: 24px;
}

input:read-only {
  background-color: blue;
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
