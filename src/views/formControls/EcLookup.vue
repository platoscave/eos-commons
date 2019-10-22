<template>
  <div class="outputclass">
    <div>{{ value }}</div>
  </div>
</template>
<script>
export default {
  name: "ec-lookup",
  props: {
    property: Object,
    currentObjId: String
  },
  data() {
    return {
      value: ""
    };
  },
  created: async function() {
    const results = await this.$store.dispatch("query", {
      currentObj: this.currentObjId,
      query: this.property.query
    });
    this.value = results[0].name
  }
};
</script>
