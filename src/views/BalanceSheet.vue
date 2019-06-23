<template>
  <div>
    <v-container v-if="bsItemArr.length">
      <v-layout row>
        <v-flex class="outputclass largest">
          {{bsItemArr[0].title}}
          <ec-bsitems v-bind:parent-id="bsItemArr[0].key"></ec-bsitems>
          <v-layout row>
            <v-flex xs9>Total {{bsItemArr[0].title}}</v-flex>
            <v-flex xs3 class="sumTotal value">{{bsItemArr[0].value.toLocaleString()}}</v-flex>
          </v-layout>
        </v-flex>
        <v-flex class="outputclass largest">
          {{bsItemArr[1].title}}
          <ec-bsitems v-bind:parent-id="bsItemArr[1].key"></ec-bsitems>
          <v-layout row>
            <v-flex xs9>Total {{bsItemArr[1].title}}</v-flex>
            <v-flex xs3 class="sumTotal value">{{bsItemArr[1].value.toLocaleString()}}</v-flex>
          </v-layout>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>
<script>
export default {
  props: {
    level: Number
  },
  data () {
    return {
      bsItemArr: {}
    }
  },
  created () {
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
    return this.$store.dispatch('query', queryObj).then(resultsArr => {
      let enrichedBsItemsPromissesArr = resultsArr.map(async bsItem => {
        bsItem.value = Math.floor(Math.random() * (10000 - 100)) + 100
        return bsItem
      })
      Promise.all(enrichedBsItemsPromissesArr).then(enrichedBsItems => {
        this.bsItemArr = enrichedBsItems
      })
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
}
</script>
<style>
.outputclass {
  background-color: #ffffff0d;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  margin: 4px;
}
.sumTotal {
  border-top-style: solid;
}
.value {
  text-align: right;
}
.larger {
  font-size: 20px;
}
.largest {
  font-size: 24px;
}
</style>
