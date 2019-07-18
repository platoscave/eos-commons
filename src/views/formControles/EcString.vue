<template>
  <div class="outputclass" :class="!property.readOnly ? 'updatable' :  ''">
    <div v-if="property.readOnly || !editMode" v-on:click="editMode = !editMode">{{ value }}</div>
    <v-text-field
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-on:blur="editMode = !editMode"
      single-line
    ></v-text-field>
  </div>
</template>
<script>
export default {
  name: "ec-string",
  props: {
    value: String,
    property: Object
  },

  data() {
    return {
      editMode: false
    };
  }
};
</script>