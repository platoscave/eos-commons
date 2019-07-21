<template>
  <div
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="editMode = true"
  >
    <img v-on:click="editMode = true" v-bind:src="value"/>
    <v-text-field
      v-if="!property.readOnly && editMode" 
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-on:focusout="editMode = false"
      single-line
    ></v-text-field>
  </div>
</template>
<script>
export default {
  name: "ec-image",
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