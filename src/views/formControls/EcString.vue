<template>
  <div
    id="outputClass"
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="editMode = true"
    v-on:focusout="editMode = false"
  >
    <div v-if="property.readOnly || !editMode">{{ value }}</div>
    <v-text-field
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      autofocus
      flat
      hide-details
      single-line
      v-bind:placeholder="property.placeholder"
    ></v-text-field>
  </div>
</template>
<script>
export default {
  name: 'ec-string',
  props: {
    value: String,
    property: Object
  },
  data () {
    return {
      editMode: false
    }
  } /* ,
  mounted () {
    this.$el.addEventListener("focusout", (e) => {
        this.editMode = false
    }, true);
  } */
}
</script>
