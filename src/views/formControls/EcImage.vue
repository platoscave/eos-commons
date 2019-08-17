<template>
  <div
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    @mouseover="isEditing = true"
    @mouseleave="isEditing = false"
  >
    <img v-bind:src="value"/>
    <v-text-field
      v-if="!property.readOnly && isEditing"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      single-line
    ></v-text-field>
  </div>
</template>
<script>
export default {
  name: 'ec-image',
  props: {
    value: String,
    property: Object
  },

  data () {
    return {
      isEditing: false
    }
  }
}
</script>
