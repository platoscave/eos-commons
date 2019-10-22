<template>
  <div>
    <!-- Richtext -->
    <ec-rich-text
      v-if="property.media && property.media.mediaType === 'text/html' "
      v-bind:value="computedValue"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:alwaysEditMode="alwaysEditMode"
    ></ec-rich-text>

    <!-- image -->
    <ec-image
      v-else-if="property.media && property.media.type === 'image/png' "
      v-bind:value="computedValue"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:alwaysEditMode="alwaysEditMode"
    ></ec-image>

    <!-- Date -->
    <ec-date
      v-else-if="property.type === 'date'"
      v-bind:value="computedValue"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:alwaysEditMode="alwaysEditMode"
    ></ec-date>

    <!-- Uri -->
    <ec-uri
      v-else-if="property.media && property.media.format === 'uri' "
      v-bind:value="computedValue"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:alwaysEditMode="alwaysEditMode"
    ></ec-uri>

    <!-- Enum -->
    <ec-select
      v-else-if="property.enum"
      v-bind:value="computedValue"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:items="property.enum"
      v-bind:alwaysEditMode="alwaysEditMode"
    ></ec-select>

    <!-- Lookup from Query Results -->
    <!-- ec-lookup needs currentObJ -->
    <ec-lookup
      v-else-if="property.query && property.lookup"
      v-bind:property="property"
      v-bind:currentObjId="currentObjId"
    ></ec-lookup>

    <!-- Select from Query Results -->
    <!-- ec-query-select needs currentObJ TODO replace with level-->
    <ec-query-select
      v-else-if="property.query"
      v-bind:value="computedValue"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:currentObjId="currentObjId"
      v-bind:alwaysEditMode="alwaysEditMode"
    ></ec-query-select>

    <!--String-->
    <ec-string
      v-else-if="property.type === 'string'"
      v-bind:value="computedValue"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:alwaysEditMode="alwaysEditMode"
    ></ec-string>

    <!--Number-->
    <ec-number
      v-else-if="property.type === 'number'"
      v-bind:value="computedValue"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:alwaysEditMode="alwaysEditMode"
    ></ec-number>

    <!-- Boolean -->
    <ec-boolean
      v-else-if="property.type === 'boolean'"
      v-bind:value="computedValue"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:alwaysEditMode="alwaysEditMode"
    ></ec-boolean>

    <!-- Array -->
    <div v-else-if="property.type === 'array'">
      <div class="outputclass">
        <div v-if="property.items.type === 'object'">
          <div v-for="(childData, idx) in computedValue" v-bind:key="idx">
            <ec-sub-form
              class="outputclass"
              v-bind:value="value[idx]"
              v-on:input="$emit('input', $event)"
              v-bind:properties="property.items.properties"
              v-bind:definitions="definitions"
              v-bind:alwaysEditMode="alwaysEditMode"
            ></ec-sub-form>
            <br />
          </div>
        </div>
        <div v-else>
          <div v-for="(childData, idx) in computedValue" v-bind:key="idx">
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
            v-bind:value="computedValue"
            v-on:input="$emit('input', $event)"
            v-bind:properties="property.properties"
            v-bind:definitions="definitions"
            v-bind:alwaysEditMode="alwaysEditMode"
          ></ec-sub-form>
        </div>
        <div v-else-if="property.additionalProperties">
          <div v-for="(childData, subPropName) in computedValue" v-bind:key="subPropName">
            <div class="outputclass">{{ subPropName }}</div>
            <!-- We're cheating here, We assume additionProperties can be found in definitions, instead of resolving $ref -->
            <!-- {{value[subPropName]}} -->
            <ec-sub-form
              class="outputclass"
              v-bind:value="value[subPropName]"
              v-on:input="$emit('input', $event)"
              v-bind:properties="definitions.additionalProperties"
              v-bind:definitions="definitions"
              v-bind:alwaysEditMode="alwaysEditMode"
            ></ec-sub-form>
            <br />
          </div>
        </div>
        <div v-else>
          <ec-json
            v-bind:value="computedValue"
            v-on:input="$emit('input', $event)"
            v-bind:property="property"
            v-bind:alwaysEditMode="alwaysEditMode"
          ></ec-json>
        </div>
      </div>
    </div>

    <!-- button -->
    <ec-button
      v-else-if="property.type === 'button'"            
      v-bind:property="property"
      v-bind:currentObjId="currentObjId"
    >{{property.title}}</ec-button>

    <!--Json-->
    <div v-else>
      <div>
        Unknown property: {{ property.title }}
        <br />
        <ec-json
          v-bind:value="computedValue"
          v-on:input="$emit('input', $event)"
          v-bind:property="property"
        ></ec-json>
      </div>
    </div>
  </div>
</template>
<script>
import EcString from "./EcString.vue";
import EcQuerySelect from "./EcQuerySelect.vue";
import EcLookup from "./EcLookup.vue";
import EcSelect from "./EcSelect.vue";
import EcNumber from "./EcNumber.vue";
import EcBoolean from "./EcBoolean.vue";
import EcDate from "./EcDate.vue";
import EcRichText from "./EcRichText.vue";
import EcImage from "./EcImage.vue";
import EcUri from "./EcUri.vue";
import EcJson from "./EcJson.vue";
import EcButton from "./EcButton.vue";
import EcSubForm from "../widgets/recursive/EcSubForm.vue";
export default {
  name: "ec-select-control",
  components: {
    EcString,
    EcQuerySelect,
    EcLookup,
    EcSelect,
    EcNumber,
    EcBoolean,
    EcDate,
    EcRichText,
    EcImage,
    EcUri,
    EcJson,
    EcButton,
    EcSubForm
  },
  props: {
    value: [Number, String, Array, Object, Boolean],
    property: Object,
    showAllFields: Boolean,
    definitions: Object,
    required: Array,
    currentObjId: String,
    alwaysEditMode: Boolean
  },
  data: function() {
    return {
      queryValue: null
    };
  },
  computed: {
      computedValue: function() {
          return this.queryValue ? this.queryValue : this.value
      } 
  },
  created: async function() {
      // TODO something strange happens to this.currentObjId
      console.log('ecselectcontrol currentObjId', this.currentObjId)

    // On rare occasions we want to take data from a property query, hense computedValue
    if (this.property.dataFromQuery) {
      const queryObj = {
        currentObj: this.currentObjId,
        query: this.property.dataFromQuery
      };
      let resultsArr = await this.$store.dispatch("query", queryObj);
      this.queryValue = resultsArr;
    }
  }
};
</script>
