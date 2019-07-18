<template>
  <div class="outputclass" :class="!property.readOnly ? 'updatable' :  ''">
    <div
      v-if="property.readOnly || !editMode"
      v-on:click="editMode = !editMode"
    >{{ value ? 'true' : 'false' }}</div>
    <v-checkbox
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-on:blur="editMode = !editMode"
      single-line
    ></v-checkbox>
  </div>
</template>
<script>
export default {
  name: "ec-boolean",
  props: {
    value: Boolean,
    property: Object
  },

  data() {
    return {
      editMode: false
    };
  }
};
</script>