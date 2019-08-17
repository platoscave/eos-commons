<template>
  <div
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    @mouseover="isEditing = true"
    @mouseleave="isEditing = false"
  >
    <div v-if="property.readOnly || !isEditing">{{ value ? 'true' : 'false' }}</div>
    <v-checkbox
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      single-line
    ></v-checkbox>
  </div>
</template>
<script>
export default {
  name: 'ec-boolean',
  props: {
    value: Boolean,
    property: Object
  },

  data () {
    return {
      isEditing: false
    }
  }
}
</script>
