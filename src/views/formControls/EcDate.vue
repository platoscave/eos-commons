<template>
  <div
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    @mouseover="isEditing = true"
    @mouseleave="isEditing = false"
  >
    <div v-if="property.readOnly || !isEditing" v-on:click="isEditing = !isEditing">{{ localeDateString }}</div>
    <v-date-picker
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      single-line
    ></v-date-picker>
  </div>
</template>
<script>
export default {
  name: 'ec-date',
  props: {
    value: String,
    property: Object,
    alwaysEditMode: Boolean
  },
  computed: {
    localeDateString: {
      get () {
        return new Date(this.value).toLocaleDateString()
      },
      set (value) {

      }
    }
  },
  data () {
    return {
      isEditing: false
    }
  }
}
</script>
