<template>
  <div v-if="bsItemArr.length > 0">
    <v-container>
      <div v-if="bottomClass">
        <v-layout v-for="(bsItem, idx) in bsItemArr" v-bind:key="idx">
          <v-flex>
            <v-layout row>
              <v-flex xs9 offset-xs1>{{bsItem.title}}</v-flex>
              <v-flex xs2 class="value">{{bsItem.value.toLocaleString()}}</v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </div>
      <div v-else>
        <v-layout v-for="(bsItem, idx) in bsItemArr" v-bind:key="idx">
          <v-flex class="outputclass">
            <div class="larger"> {{bsItem.title}}</div>
            <ec-bs-items v-bind:parent-id="bsItem.key"></ec-bs-items>
            <v-layout row class="larger">
              <v-flex xs9>Total {{bsItem.title}}</v-flex>
              <v-flex xs3 class="value sumTotal">{{bsItem.value.toLocaleString()}}</v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </div>
</template>
<script>
// Recursive componets must be defined globally
// import BsItems from './BsItems.vue'

export default {
  name: 'ec-bs-items',
  props: {
    parentId: String
  },
  data () {
    return {
      bsItemArr: [],
      bottomClass: true
    }
  },
  created () {
    let queryObj = {
      query: {
        sortBy: 'title',
        where: [{
          docProp: 'parentId',
          operator: 'eq',
          value: this.parentId
        }]
      }
    }
    this.$store.dispatch('query', queryObj).then(resultsArr => {
      let enrichedBsItemsPromissesArr = resultsArr.map(async bsItem => {
        queryObj.query.where[0].value = bsItem.key
        const subBsItemsArray = await this.$store.dispatch('query', queryObj)
        if (subBsItemsArray.length > 0) this.bottomClass = false
        bsItem.value = Math.floor(Math.random() * (100000 - 10)) + 10
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
