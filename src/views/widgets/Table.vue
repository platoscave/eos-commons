<template>
  	<div v-if="headers && dataArr">
		<v-data-table 
		  	:headers="headers"
			:items="dataArr"
		>
		    <template v-slot:items="props">
				<td>{{ props.item.key }}</td>
				<td class="text-xs-right">{{ props.item.value }}</td>
				<td v-html="props.item.description"></td>
			</template>
		</v-data-table>
  	</div>
</template>
<script>
export default {
  props: {
	level: Number,
	viewId: String,
    editMode: Boolean
  },
  data () {
    return {
	  dataArr: [],
	  headers: []
    }
  },
  created: async function () {
    /* this.$store.watch( state => state.levelIdsArr[this.level].selectedObjId, selectedObjId => {
        if (!selectedObjId) return
        this.$store.dispatch('getCommonByKey', selectedObjId).then(newData => {
          // console.log('dataObj', newData)
          this.dataObj = Object.assign({}, newData) // Force reactive update
        })
      },
      { immediate: true }
    ) */

   

    let viewObj = await this.$store.dispatch('materializedView', this.viewId)
	// console.log('view', this.viewObj)
	const arr = Object.keys(viewObj.properties).map(key => ({ 
		text: viewObj.properties[key].title,
		value: key
	}));
	this.headers = arr

  	const queryObj = {
        queryId: viewObj.queryId
    }
	let resultsArr = await this.$store.dispatch('query', queryObj)
	console.log('newData', resultsArr)

    // this.dataArr = Object.assign({}, resultsArr) // Force reactive update
    this.dataArr = resultsArr

  },
}
</script>
<style >
</style>
