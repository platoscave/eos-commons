<template>
  <!-- Wait for dataObj and viewObj to arrive -->
  <div v-if="viewObj && dataObj">
    <div>{{viewId}} {{viewObj.name}}</div>
    <ec-sub-form
      v-bind:showAllFields="true"
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
    showAllFields: Boolean
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
      if (!this.showAllFields) return
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
            this.$store.dispatch('getMaterializedView', selectedObjId).then(materializedView => {
              this.dataObj = Object.assign({}, materializedView) // Force reactive update
            })
          } else this.dataObj = Object.assign({}, newData) // Force reactive update
        })
      },
      { immediate: true }
    )

    this.viewObj = await this.$store.dispatch('getMaterializedView', this.viewId)
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
    /* for some reason tab items got a background color in veutify 2.0 */
    .v-tabs-items {
        background-color: transparent !important;
    }
    .v-text-field {
        padding-top: 0px;
        margin-top: 0px;
    }
    /* keep the menu from taking upspace when its not active */
    .v-menu--inline {
        display: none;
    }
    .v-input__slot {
        margin-bottom: 0 !important;
    }
    /* get rid of message under input fields */
.v-messages {
    display: none;
}
/* for the radio buttons */
.v-input--selection-controls{
    margin-top: 0;
    padding-top: 0;
}
/* remove padding from text fields */
.v-text-field {
    padding: 0;
}
/*  */
.v-text-field>.v-input__control>.v-input__slot:before {
    border-style: none;
}
.v-text-field>.v-input__control>.v-input__slot:after {
    border-style: none;
}
</style>
