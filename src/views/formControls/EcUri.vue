<template>
  <div
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="isEditing = true"
  >
    <div v-if="property.readOnly || !isEditing">{{ value }}</div>
    <v-text-field
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-on:focusout="isEditing = false"
      single-line
    ></v-text-field>
  </div>
</template>
<script>
export default {
  name: 'ec-uri',
  props: {
    value: String,
    property: Object,
    alwaysEditMode: Boolean
  },

  data () {
    return {
      isEditing: false
    }
  }
}
</script>
