<template>
  	<div>
		<ec-paragraph v-bind:headerLevel="1" v-bind:subParagraphId="subParagraphId"></ec-paragraph>
  	</div>
</template>
<script>
export default {
  props: {
    level: Number,
    editMode: Boolean
  },
  computed: {
    subParagraphId: function () {
      return this.$store.state.levelIdsArr[this.level].selectedObjId
    }
  }
}
</script>
<style scoped>
</style>
