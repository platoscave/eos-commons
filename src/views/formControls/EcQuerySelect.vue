<template>
  <div
    v-if="items.length && value"
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="editMode = true"

  >
    <div v-if="property.readOnly || !editMode || items.length < 2">{{ selectedText }}</div>
    <v-select
      v-else
      class="custom"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      v-on:focusout="editMode = false"
      :items="items"
      single-line
    ></v-select>
  </div>
</template>
<script>
export default {
  name: "ec-query-select",
  props: {
    value: String,
    property: Object
  },
  data() {
    return {
		editMode: false,
      	items: [],
      	selectedText: ''
    };
  },
  mounted: async function() {
    const results = await this.$store.dispatch("query", {
      query: this.property.query
    });
    this.items = results.map(item => {
      let obj = {
        value: item.key,
        text: item.title ? item.title : item.name
      };
      return obj;
    });
    this.items.push({
      value: "[not selected]",
      text: "[not selected]"
    });
    // How do we return [not selected] ?
    // Should remove property!
    // if(!this.value) this.value = '[not selected]'
    this.updateSelectedText();
  },
  methods: {
    // Update the selected text in case of readonly output
    updateSelectedText() {
      // console.log('this.value', this.value)
      const selectedObj = this.items.find(item => {
        return item.value === this.value;
      });
      if (selectedObj) this.selectedText = selectedObj.text;
      else this.selectedText = "[Selected item not found: " + this.value + "]";
    }
  },
  watch: {
    value: "updateSelectedText"
  }
};
</script>
<style>
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none !important;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none !important;
}
</style>
