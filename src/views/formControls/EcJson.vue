<template>
  <div
    id="outputClass"
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="isEditing = true"
    v-on:focusout="isEditing = false"
  >
  <div v-if="property.readOnly || !isEditing" class="monoSpaced">{{ JSON.stringify(property, replacer, 2) }}></div>
    <v-text-field
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      autofocus
      single-line
    ></v-text-field>
  </div>
</template>
<script>
export default {
  name: 'ec-json',
  props: {
    value: String,
    property: Object,
    alwaysEditMode: Boolean
  },
  data () {
    return {
      isEditing: false
    }
  },
  methods: {
    replacer (name, val) {
      // we do this because icons are very long
      if (name === 'icon') return 'base64 icon string'
      else return val
    }
  }
}
</script>
<style>
.monoSpaced {
  font-family: monospace, monospace;
  white-space: pre;
}
</style>
