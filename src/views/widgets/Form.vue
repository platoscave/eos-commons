<template>
  <!-- Wait for dataObj and viewObj to arrive -->
  <div v-if="viewObj && dataObj">
    <div>{{viewId}} {{viewObj.name}}</div>
    <ec-sub-form
      v-bind:editMode="editMode"
      v-model="dataObj"
      v-bind:properties="viewObj.properties"
      v-bind:definitions="viewObj.definitions"
    ></ec-sub-form>
  </div>
</template>
<script>
import EosApiService from '../../services/EosApiService'

export default {
  props: {
    level: Number,
    viewId: String,
    editMode: Boolean
  },
  data () {
    return {
      viewObj: {},
      dataObj: {}
    }
  },
  methods: {
    storeData (newData) {
      // if(_.isEqual(a, b)) return // returns false if different
      if (!this.editMode) return
      console.log('Data Change: ', newData)
      this.$store.dispatch('upsertCommon', newData)
    }
  },
  created: async function () {
    this.$store.watch(
      state => state.levelIdsArr[this.level].selectedObjId, selectedObjId => {
        if (!selectedObjId) return
        this.$store.dispatch('getCommonByKey', selectedObjId).then(newData => {
          // console.log('dataObj', newData)
          if (newData.classId === 'pylvseoljret') {
            this.$store.dispatch('materializedView', selectedObjId).then(materializedView => {
              this.dataObj = Object.assign({}, materializedView) // Force reactive update
            })
          } else this.dataObj = Object.assign({}, newData) // Force reactive update
        })
      },
      { immediate: true }
    )

    this.viewObj = await this.$store.dispatch('materializedView', this.viewId)
    // console.log('view', this.viewObj)
    if (this.viewObj.rpc) {
      EosApiService.getAccountInfo('eoscommonsio').then(info => {
        this.dataObj = info
      })
    }
  },
  watch: {
    dataObj: {
      handler: 'storeData',
      deep: true
    }
  }
}
</script>
/* Global form styles */
<style>
	.label {
		padding: 10px;
        font-size: 16px;
        margin-top: 4px;        
	}
	.outputclass {
		background-color: #ffffff0d;
		padding: 10px;
		font-size: 16px;
		/* line-height: 42px; */
		min-height: 46px;
        border-radius: 5px;
	}
	.updatable {
		border-style: solid;
		border-color: blue;
		border-width: 1px;
    }
</style>
