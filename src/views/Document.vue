<template>
  <div>
    <div v-if="data">
      <div v-if="!editMode">
        <div v-html="data.description"></div>
      </div>
      <div v-else>
        <wysiwyg v-model="data.description"/>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'

export default {
  props: {
    level: Number,
    editMode: Boolean
  },
  data () {
    return {
      data: {}
    }
  },
  created () {
    this.$store.watch(
      state => state.levelIdsArr[this.level].selectedObjId,
      newVal => {
        // console.log('selectedObjId Changed!', newVal)
        if (!newVal) return
        this.$store.dispatch('getCommonByKey', newVal).then(data => {
          console.log('data', data)
          this.data = data
        })
      },
      { immediate: true }
    )
  }
}
</script>
<style scoped>
@import "~vue-wysiwyg/dist/vueWysiwyg.css";
</style>
