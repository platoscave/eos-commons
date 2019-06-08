<template>
  <div>
    <div v-if="items.length">
      <div class="readonlyoutput" v-if="readonly || items.length < 2">{{ selectedText }}</div>
      <div v-else>
        <v-select
          class="custom"
          v-bind:label="property.title"
          v-model="selected"
          :items="items"
          single-line
          outline
        ></v-select>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    readonly: Boolean,
    idx: String,
    property: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      items: [],
      selected: "",
      selectedText: ""
    };
  },
  watch: {
    property: {
      handler: "queryItems",
      immediate: true,
      deep: true
    }
  },
  methods: {
    // Don't use arrow function. Messes with this.
    queryItems: async function() {
      const results = await this.$store.dispatch("query", this.property);
      this.items = results.map(item => {
        let obj = {
          value: item.key,
          text: item.title ? item.title : item.name
        };
        return obj;
      });
      debugger
      this.selected = this.idx;
      const selectedObj = this.items.find(item => {
        return item.value === this.idx
      })
      this.selectedText = selectedObj ? selectedObj.text : '[Selected Item Not Found]'
    }
  }
};
</script>
<style>
.readonlyoutput {
  background-color: #ffffff0d;
  padding: 10px;
  font-size: 16px;
  line-height: 42px;
  border-radius: 5px;
  margin: 4px;
}
.custom.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none !important;
}
.custom.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none !important;
}
</style>
