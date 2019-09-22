<template>
  <div
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    @mouseover="isEditing = true"
    @mouseleave="isEditing = false"
  >
    <div v-if="property.readOnly || !isEditing" v-on:click="isEditing = !isEditing">{{ value ? value.toLocaleString() : '' }}</div>
    <v-text-field
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      type="number"
      single-line
    ></v-text-field>
  </div>
</template>
<script>
export default {
  name: 'ec-number',
  props: {
    value: Number,
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
