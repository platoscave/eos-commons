<template>
  <div
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="editMode = true"
  >
    <div v-if="property.readOnly || !editMode" v-on:click="editMode = !editMode">{{ value ? value.toLocaleString() : 'null' }}</div>
    <v-text-field
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-on:focusout="editMode = false"
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
    property: Object
  },

  data () {
    return {
      editMode: false
    }
  }
}
</script>
