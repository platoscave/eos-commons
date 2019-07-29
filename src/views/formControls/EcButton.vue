<template>
  <div>
    <v-btn
      v-on:input="$emit('input', $event)"
      single-line
    >{{property.title}}</v-btn>
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
      editMode: false
    }
  }
}
</script>
