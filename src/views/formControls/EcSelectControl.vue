<template>
  <div>
    <!-- Richtext -->
    <ec-rich-text
      v-if="property.media && property.media.mediaType === 'text/html' "
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
    ></ec-rich-text>

    <!-- image -->
    <ec-image
      v-else-if="property.media && property.media.type === 'image/png' "
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
    ></ec-image>

    <!-- Date -->
    <ec-date
      v-else-if="property.type === 'date'"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
    ></ec-date>

    <!-- Uri -->
    <ec-uri
      v-else-if="property.media && property.media.format === 'uri' "
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
    ></ec-uri>

    <!-- Enum -->
    <ec-select
      v-else-if="property.enum"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
      v-bind:items="property.enum"
    ></ec-select>

    <!-- Select from Query Results -->
    <ec-query-select
      v-else-if="property.query"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
    ></ec-query-select>

    <!--String-->
    <ec-string
      v-else-if="property.type === 'string'"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
    ></ec-string>

    <!--Number-->
    <ec-number
      v-else-if="property.type === 'number'"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
    ></ec-number>

    <!-- Boolean -->
    <ec-boolean
      v-else-if="property.type === 'boolean'"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-bind:property="property"
    ></ec-boolean>

    <!-- Array -->
    <div v-else-if="property.type === 'array'">
      <div class="outputclass">
        <div v-if="property.items.type === 'object'">
          <div v-for="(childData, idx) in value" v-bind:key="idx">
            <ec-sub-form
              class="outputclass"
              v-bind:value="value[idx]"
              v-on:input="$emit('input', $event)"
              v-bind:properties="property.items.properties"
              v-bind:definitions="definitions"
            ></ec-sub-form>
            <br />
          </div>
        </div>
        <div v-else>
          <div v-for="(childData, idx) in value" v-bind:key="idx">
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
            v-bind:value="value"
            v-on:input="$emit('input', $event)"
            v-bind:properties="property.properties"
            v-bind:definitions="definitions"
          ></ec-sub-form>
        </div>
        <div v-else-if="property.additionalProperties">
          <div v-for="(childData, subPropName) in value" v-bind:key="subPropName">
            <div class="outputclass">{{ subPropName }}</div>
            <!-- We're cheating here, We assume additionProperties can be found in definitions, instead of resolving $ref -->
            <!-- {{value[subPropName]}} -->
            <ec-sub-form
              class="outputclass"
              v-bind:value="value[subPropName]"
              v-on:input="$emit('input', $event)"
              v-bind:properties="definitions.additionalProperties"
              v-bind:definitions="definitions"
            ></ec-sub-form>
            <br />
          </div>
        </div>
        <div v-else>
          <ec-json
            v-bind:value="value"
            v-on:input="$emit('input', $event)"
            v-bind:property="property"
          ></ec-json>
        </div>
      </div>
    </div>

    <!-- button -->
    <v-btn
      color="blue darken-1"
      v-else-if="property.type === 'button'"
      v-on:click="$emit('button-click', property.action)"
    >{{property.title}}</v-btn>

    <!--Json-->
    <div v-else>
      <div>
        Unknown property: {{ property.title }}
        <br />
        <ec-json
          v-bind:value="value"
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
import EcSelect from "./EcSelect.vue";
import EcNumber from "./EcNumber.vue";
import EcBoolean from "./EcBoolean.vue";
import EcDate from "./EcDate.vue";
import EcRichText from "./EcRichText.vue";
import EcImage from "./EcImage.vue";
import EcUri from "./EcUri.vue";
import EcJson from "./EcJson.vue";
import EcButton from "./EcButton.vue";
import SubForm from "../widgets/recursive/SubForm.vue";
export default {
  name: "ec-select-control",
  components: {
    EcString,
    EcQuerySelect,
    EcSelect,
    EcNumber,
    EcBoolean,
    EcDate,
    EcRichText,
    EcImage,
    EcUri,
    EcJson,
    EcButton,
    SubForm
  },
  props: {
    value: [Number, String, Array, Object],
    property: Object,
      showAllFields: Boolean,
    definitions: Object,
    required: Array
  }
};
</script>
