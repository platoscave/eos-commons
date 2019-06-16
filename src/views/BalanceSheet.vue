<template>
  <div>
    <v-container v-if="data">
      <v-layout row>
        <v-flex class="readonlyoutput">{{data[0].title}}</v-flex>
        <v-flex class="readonlyoutput">{{data[1].title}}</v-flex>
      </v-layout>
    </v-container>
  </div>
</template>
<script>
import Vue from "vue";

export default {
  props: {
    level: Number
  },
  data() {
    return {
      data: {}
    };
  },
  created() {
    let queryObj = {
      query: {
        sortBy: 'title',
        where: {
          docProp: 'parentId',
          operator: 'eq',
          value: '5jdnjqxsqmgn'
        }
      }
    }
    return this.$store.dispatch('query', queryObj).then((resultsArr) => {
      this.data = resultsArr
    })
    /* this.$store.watch(
      state => state.levelIdsArr[this.level].selectedObjId,
      newVal => {
        // console.log('selectedObjId Changed!', newVal)
        if (!newVal) return;
        this.$store.dispatch("getCommonByKey", newVal).then(data => {
          console.log("data", data);
          this.data = data;
        });
      },
      { immediate: true }
    ); */
  }
};
</script>
<style scoped>
.readonlyoutput {
  background-color: #ffffff0d;
  padding: 10px;
  font-size: 16px;
  line-height: 42px;
  border-radius: 5px;
  margin: 4px;
}
</style>
