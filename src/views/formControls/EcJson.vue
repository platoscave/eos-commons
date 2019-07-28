<template>
  <div
    id="outputClass"
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="editMode = true"
    v-on:focusout="editMode = false"
  >
  <div v-if="property.readOnly || !editMode" class="monoSpaced">{{ JSON.stringify(property, replacer, 2) }}></div>
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
  name: "ec-json",
  props: {
    value: String,
    property: Object
  },
  data() {
    return {
      editMode: false
    };
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
.monoSpaced {
  font-family: monospace, monospace;
  white-space: pre;
}
</style>
