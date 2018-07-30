<template>
    <div v-if="view" class="tree">
        <v-jstree
                :data="asyncData"
                :async="loadData"
                text-field-name="title"
                allow-batch
                whole-row
                draggable
                sort
                @item-click="itemClick"
                @item-drag-start="itemDragStart"
                @item-drag-end="itemDragEnd"
                @item-drop-before = "itemDropBefore"
                @item-drop="itemDrop"
                ref="tree2"></v-jstree>
    </div>
</template>

<script>
import VJstree from 'vue-jstree'
export default {
  name: 'Tree',
  components: {
    VJstree
  },
  props: {
    level: Number,
    widget: Object
  },
  data () {
    return {
      view: null,
      rootNode: {},
      itemEvents: {
        mouseover: function () {
          console.log('mouseover')
        },
        contextmenu: function () {
          console.log(arguments[2])
          arguments[2].preventDefault()
          console.log('contextmenu')
        }
      },
      asyncData: [],
      loadData: function (oriNode, resolve) {
        if (!oriNode || !oriNode.data.id) {
          let viewQueryObj = this.$parent.viewRootQueryObj()
          this.$store.dispatch('query', viewQueryObj).then((result) => {
            resolve(result)
          })
        } else {
          const queryArrObj = {
            fk: oriNode.data.id,
            queryArr: oriNode.data.data.queryArr,
            queryNames: oriNode.data.data.queryNames
          }
          this.$store.dispatch('queryArrObj', queryArrObj).then((result) => {
            resolve(result)
          })
        }
      }
    }
  },
  methods: {
    itemClick (node) {
      this.pageId = node.model.data.pageId ? node.model.data.pageId : node.model.data.item.pageId
      if (pageId) this.$router.push({path: '/' + pageId})
      console.log('clicked !', pageId)
    },
    itemDragStart (node) {
      console.log(node.model.text + ' drag start !')
    },
    itemDragEnd (node) {
      console.log(node.model.text + ' drag end !')
    },
    itemDropBefore (node, item, draggedItem, e) {
      if (!draggedItem) {
        item.addChild({
          text: 'newNode',
          value: 'newNode'
        })
      }
    },
    itemDrop (node, item, draggedItem, e) {
      var sortBy = function (attr, rev) {
        if (rev == undefined) {
          rev = 1
        } else {
          rev = (rev) ? 1 : -1
        }
        return function (a, b) {
          a = a[attr]
          b = b[attr]
          if (a < b) {
            return rev * -1
          }
          if (a > b) {
            return rev * 1
          }
          return 0
        }
      }
      item.children.sort(sortBy('text', true))
      this.$refs.tree.handleRecursionNodeChildren(draggedItem, function (childrenItem) {
        childrenItem.selected = item.selected
      })
      console.log(node.model.text + ' drop !')
    },
    inputKeyUp: function () {
      var text = this.searchText
      const patt = new RegExp(text)
      this.$refs.tree.handleRecursionNodeChilds(this.$refs.tree, function (node) {
        if (text !== '' && node.model !== undefined) {
          const str = node.model.text
          if (patt.test(str)) {
            node.$el.querySelector('.tree-anchor').style.color = 'red'
          } else {
            node.$el.querySelector('.tree-anchor').style.color = '#000'
          } // or other operations
        } else {
          node.$el.querySelector('.tree-anchor').style.color = '#000'
        }
      })
    },
    addChildNode: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.addChild({
          text: 'newNode',
          value: 'newNode'
        })
      }
    },
    removeNode: function () {
      if (this.editingItem.id !== undefined) {
        var index = this.editingNode.parentItem.indexOf(this.editingItem)
        this.editingNode.parentItem.splice(index, 1)
      }
    },
    addBeforeNode: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.addBefore({
          text: 'newNode',
          value: 'newNode'
        }, this.editingNode)
      }
    },
    addAfterNode: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.addAfter({
          text: 'newNode',
          value: 'newNode'
        }, this.editingNode)
      }
    },
    openChildren: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.openChildren()
      }
    },
    closeChildren: function () {
      if (this.editingItem.id !== undefined) {
        this.editingItem.closeChildren()
      }
    },
    refreshNode: function () {
      this.asyncData = [
        this.$refs.tree2.initializeLoading()
      ]
      this.$refs.tree2.handleAsyncLoad(this.asyncData, this.$refs.tree2)
    },
    customItemClick: function (node, item, e) {
      e.stopPropagation()
      var index = node.parentItem.indexOf(item)
      node.parentItem.splice(index, 1)
    },
    customItemClickWithCtrl: function () {
      console.log('click + ctrl')
    },
    viewRootQueryObj: function () {
      const getQueriesByName = (query) => {
        let queryNames = {}
        if (query.queryName) queryNames[query.queryName] = query
        if (query.join) {
          query.join.forEach((item) => {
            queryNames = Object.assign(queryNames, getQueriesByName(item))
          })
        }
        return queryNames
      }
      const queryNames = getQueriesByName(this.view.query)

      return { fk: null, query: this.view.query, queryNames: queryNames}
    }
  },
  created () {
    this.$store.dispatch('materializedView', this.widget.viewId).then((view) => {
      this.view = view
    })
  }
}
</script>
<style scoped>

</style>
