<template>
  <div class="outputclass" :class="!property.readOnly ? 'updatable' :  ''">
    <div v-if="property.readOnly || !editMode" v-on:click="editMode = !editMode">{{ value.toLocaleDateString() }}</div>
    <v-date-picker
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-on:blur="editMode = !editMode"
      single-line
    ></v-date-picker>
  </div>
</template>
<script>
export default {
  name: "ec-date",
  props: {
    value: Date,
    property: Object
  },

  data() {
    return {
      editMode: false
    };
  }
};
</script>