<template>
  <div>
    <div v-if="dataObj">
      <div v-if="!editMode">
		  <h1>{{ dataObj.name }}</h1>
        <div v-html="dataObj.description"></div>
      </div>
      <div v-else>
		  <h1>
                <v-text-field
                  class="outputclass"
                  v-model.trim="dataObj.name"
                  single-line
                  outline
                ></v-text-field>
			</h1>
        <wysiwyg v-model="dataObj.description"/>
      </div>
    </div>
  </div>
</template>
<script>

export default {
  props: {
    level: Number,
    editMode: Boolean
  },
  data () {
    return {
      dataObj: {}
    }
  },
  methods: {
    storeData (newData) {
		// if(_.isEqual(a, b)) return // returns false if different
	  console.log('Data Change: ', newData)
	  this.$store.dispatch('upsertCommon', newData)
    }
  },
  created () {
    this.$store.watch(
      state => state.levelIdsArr[this.level].selectedObjId,
      newVal => {
        // console.log('selectedObjId Changed!', newVal)
        if (!newVal) return
        this.$store.dispatch('getCommonByKey', newVal).then(newData => {
          console.log('data', newData)
          this.dataObj = Object.assign({}, newData) // Force reactive update
        })
      },
      { immediate: true }
    )
  },
  watch: {
    dataObj: {
      handler: 'storeData',
      deep: true
    }
  }
}
</script>
<style scoped>
@import "~vue-wysiwyg/dist/vueWysiwyg.css";
</style>
