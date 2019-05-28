<template>
  <div>
    <template v-if="items.length">
      <v-select class="custom"
        v-bind:label="property.title"
        v-model="selected"
        :disabled="readonly || items.length < 2"
        :items="items"
        append-outer-icon="property.description ? 'help_outline'"
      ></v-select>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    readonly: Boolean,
    cid: String,
    property: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      items: [],
      selected: ''
    }
  },
  watch: {
    property: {
      handler: 'queryItems',
      immediate: true,
      deep: true
    }
  },
  methods: {
    // Don't use arrow function. Messes with this.
    queryItems: async function () {
      const results = await this.$store.dispatch('query', this.property)
      this.items = results.map((item) => {
        let obj = { value: item.cid, text: item.title ? item.title : item.name }
        return obj
      })
      // this.selected = this.cid
    }
  }
}
</script>
<style>
  .custom.v-text-field>.v-input__control>.v-input__slot:before {
      border-style: none !important;
  }
  .custom.v-text-field>.v-input__control>.v-input__slot:after {
      border-style: none !important;
  }
</style>
