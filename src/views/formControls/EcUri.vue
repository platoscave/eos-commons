<template>
  <div
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="editMode = true"
  >
    <div v-if="property.readOnly || !editMode">{{ value }}</div>
    <v-text-field
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-on:focusout="editMode = false"
      single-line
    ></v-text-field>
  </div>
</template>
<script>
export default {
  name: 'ec-uri',
  props: {
    value: String,
    property: Object
  },

  data () {
    return {
      editMode: false
    }
  }
}
</script>
