<template>
  <div>
    <v-container>
      <!-- <div class="monoSpaced">{{ JSON.stringify(properties, replacer, 2) }}></div>
		<br>
      <div class="monoSpaced">{{ JSON.stringify(value, replacer, 2) }}></div>-->
      <!-- For each of the properties in schema -->
      <div class="rowPadding" v-for="(property, propName) in properties" v-bind:key="propName">
        <!-- Start owr layout. v-flex must be immidiate child-->
        <v-layout justify-start row wrap>
          <!-- Label: If we are in edit mode or, there is data for this property -->
          <v-flex class="label" xs12 md2 v-if="editMode || value[propName]">
            <div>{{ property.title }}</div>
          </v-flex>

          <!-- Value: If we are in edit mode or, there is data for this property -->
          <v-flex xs12 md10 v-if="editMode || value[propName]">

            <!-- Richtext -->
            <ec-rich-text
              v-if="property.media && property.media.mediaType === 'text/html' "
              v-model.trim="value[propName]"
              v-bind:property="property"
            ></ec-rich-text>

            <!-- image -->
            <ec-image
              v-else-if="property.media && property.media.type === 'image/png' "
              v-model.trim="value[propName]"
              v-bind:property="property"
            ></ec-image>

            <!-- Date -->
            <ec-date
              v-else-if="property.type === 'date'"
              v-model.number="value[propName]"
              v-bind:property="property"
            ></ec-date>

            <!-- Uri -->
            <ec-uri
              v-else-if="property.media && property.media.format === 'uri' "
              v-model.trim="value[propName]"
              v-bind:property="property"
            ></ec-uri>

            <!-- Enum -->
			<ec-select
              v-else-if="property.enum"
              v-model="value[propName]"
              v-bind:property="property"
              v-bind:items="property.enum"
            ></ec-select>

            <!-- Select from Query Results -->
            <ec-query-select
              v-else-if="property.query"
              v-model.trim="value[propName]"
              v-bind:property="property"
            ></ec-query-select>

            <!--String-->
            <ec-string
              v-else-if="property.type === 'string'"
              v-model.trim="value[propName]"
              v-bind:property="property"
            ></ec-string>

            <!--Number-->
            <ec-number
              v-else-if="property.type === 'number'"
              v-model.number="value[propName]"
              v-bind:property="property"
            ></ec-number>

            <!-- Boolean -->
            <ec-boolean
              v-else-if="property.type === 'boolean'"
              v-model.number="value[propName]"
              v-bind:property="property"
            ></ec-boolean>

            <!-- Array -->
            <div v-else-if="property.type === 'array'">
              <div class="outputclass">
                <div v-if="property.items.type === 'object'">
                  <div v-for="(childData, idx) in value[propName]" v-bind:key="idx">
                    <!-- <div class="monoSpaced">{{ JSON.stringify(properties, replacer, 2) }}></div>
						<br>
                    <div class="monoSpaced">{{ JSON.stringify(property.items.properties, replacer, 2) }}></div>-->
                    <ec-sub-form
                      class="outputclass"
                      v-bind:editMode="editMode"
                      v-model="value[propName][idx]"
                      v-bind:properties="property.items.properties"
                      v-bind:definitions="definitions"
                    ></ec-sub-form>
                    <br />
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
                    v-bind:definitions="definitions"
                  ></ec-sub-form>
                </div>
                <div v-else-if="property.additionalProperties">
                  <div v-for="(childData, subPropName) in value[propName]" v-bind:key="subPropName">
                    <div class="outputclass">{{ subPropName }}</div>
                    <!-- We're cheating here, We assume additionProperties can be found in definitions, instead of resolving $ref -->
                    <!-- {{value[propName][subPropName]}} -->
                    <ec-sub-form
                      class="outputclass"
                      v-bind:editMode="editMode"
                      v-model="value[propName][subPropName]"
                      v-bind:properties="definitions.additionalProperties"
                      v-bind:definitions="definitions"
                    ></ec-sub-form>
                    <br />
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
                <br />
                <div class="monoSpaced">{{ JSON.stringify(property, replacer, 2) }}></div>
              </div>

            </div>
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </div>
</template>
<script>
import EcString from '../../formControls/EcString.vue'
import EcQuerySelect from '../../formControls/EcQuerySelect.vue'
import EcSelect from '../../formControls/EcSelect.vue'
import EcNumber from '../../formControls/EcNumber.vue'
import EcBoolean from '../../formControls/EcBoolean.vue'
import EcDate from '../../formControls/EcDate.vue'
import EcRichText from '../../formControls/EcRichText.vue'
import EcImage from '../../formControls/EcImage.vue'
import EcUri from '../../formControls/EcUri.vue'
import SubForm from "./SubForm.vue"

export default {
  name: "ec-sub-form",
  components: {
	EcString,
	EcQuerySelect,
	EcSelect,
	EcNumber,
	EcDate,
	EcRichText,
	EcImage,
    EcUri,
    SubForm
  },
  props: {
    editMode: Boolean,
    properties: Object,
    definitions: Object,
    required: Array,
    value: Object
  },
  methods: {
    replacer(name, val) {
      // we do this because icons are very long
      if (name === "icon") return "base64 icon string";
      else return val;
    }
  }
};
</script>
<style>
	.label {
		padding: 10px;
        font-size: 16px;
        margin-top: 4px;        
	}
	.outputclass {
		background-color: #ffffff0d;
		padding: 10px;
		font-size: 16px;
		/* line-height: 42px; */
		min-height: 46px;
        border-radius: 5px;
	}
	.updatable {
		border-style: solid;
		border-color: blue;
		border-width: 1px;
    }
</style>
<style scoped>
.rowPadding {
    padding-bottom: 16px;
}
.monoSpaced {
  font-family: monospace, monospace;
  white-space: pre;
}




.v-input__slot {
  background-color: green !important;
  min-height: 24px;
}
input:read-only {
  background-color: blue;
}
.description {
  color: lightseagreen;
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
