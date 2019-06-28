<template>
  <div>
    <div v-if='items.length && value'>
      <div class="readonlyoutput" v-if="readonly || items.length < 2">{{ selectedText }}</div>
      <div v-else>
        <v-select
          class="custom readonlyoutput"
          v-bind:value="value"
          v-on:input="$emit('input', $event)"
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
    value: String,
    query: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      items: [],
      selectedText: ""
    };
  },
  mounted: async function() {
    const results = await this.$store.dispatch("query", {
      query: this.query
    });
    this.items = results.map(item => {
      let obj = {
        value: item.key,
        text: item.title ? item.title : item.name
      };
      return obj;
    });
    this.items.push({
      value: '[not selected]',
      text: '[not selected]'
	})
	// How do we return [not selected] ?
	// Should remove property 
	// if(!this.value) this.value = '[not selected]'
	this.updateSelectedText()
  },
  methods: {
    // Update the selected text in case of readonly output
    updateSelectedText() {
		// console.log('this.value', this.value)
      const selectedObj = this.items.find(item => {
        return item.value === this.value;
	  })
	  if(selectedObj) this.selectedText = selectedObj.text
	  else this.selectedText = '[Selected item not found: ' + this.value + ']'
    }
  },
  watch: {
    value: 'updateSelectedText'
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
