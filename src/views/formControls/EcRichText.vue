<template>
  <div
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="editMode = true"
  >
    <div class="nomargin" v-if="property.readOnly || !editMode" v-html="value"></div>
    <wysiwyg
      v-else
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-on:focusout="editMode = false"
      single-line
    ></wysiwyg>
  </div>
</template>
<script>
export default {
  name: "ec-rich-text",
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
<style scoped>
    .nomargin >>> p {
        margin-bottom: 0;
        text-align: justify;
    }
</style>