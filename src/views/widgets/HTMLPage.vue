<template>
  <div>
    <v-container>
      <div v-html="dataObj.description"></div>
    </v-container>
  </div>
</template>
<script>
export default {
  props: {
    level: Number,
    editMode: Boolean
  },
  data() {
    return {
      dataObj: {}
    };
  },
  created: async function() {
    this.$store.watch(
      state => state.levelIdsArr[this.level].selectedObjId,
      selectedObjId => {
        if (!selectedObjId) return;
        this.$store.dispatch("getCommonByKey", selectedObjId).then(newData => {
          // console.log('dataObj', newData)
          this.dataObj = Object.assign({}, newData); // Force reactive update
        });
      },
      { immediate: true }
    );
  }
};
</script>
<style >
.container {
  padding: 0px;
}
</style>
