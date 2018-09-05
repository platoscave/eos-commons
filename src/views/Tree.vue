<template>
    <div v-if="view" class="tree">
        <v-jstree
                :data="asyncData"
                :async="loadData"
                draggable
                sort
                @item-click="itemClick"
                @item-drag-start="itemDragStart"
                @item-drag-end="itemDragEnd"
                @item-drop-before = "itemDropBefore"
                @item-drop="itemDrop"
                @item-toggle="itemToggle"
                ref="tree2">
            <template slot-scope="_">
                <div style="display: inherit; width: 200px" @click.ctrl="customItemClickWithCtrl">
                    <img class="tree-default tree-icon" :src="_.model.data.icon" role="presentation" v-if="!_.model.loading">
                    {{_.model.text}}
                    <button style="border: 0px; background-color: transparent; cursor: pointer;" @click="customItemClick(_.vm, _.model, $event)"><i class="fa fa-remove"></i></button>
                </div>
            </template>
        </v-jstree>
    </div>
</template>

<script>
import VJstree from 'vue-jstree'
export default {
  components: {
    VJstree
  },
  props: {
    level: Number,
    viewId: String
  },
  data () {
    return {
      view: null,
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
            level: this.$parent.level,
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
      if (node.model.data.pageId) {
        // Create the next level pageState, if there isn't one already
        this.$store.commit('SET_PAGE_STATE', {[node.model.data.pageId]: {}})
        this.$store.commit('SET_LEVEL_IDS', {
          level: this.level + 1,
          ids: {
            selectedObjId: node.model.id,
            pageId: node.model.data.pageId
          }
        })
      }
      // pageId is destroyed. wrong kind of merg?
      /*this.$store.commit('SET_LEVEL_IDS', {
        level: this.level,
        ids: {
          selectedObjId: node.model.id
        }
      })*/
    },
    itemToggle (oriNode, oriItem, e) {
      this.$store.commit('SET_NODE_TOGGLE', {
        id: oriItem.id,
        opened: oriItem.opened
      })
      /*  Send all expanded nodes to page state
      this.selectedItems = []
        this.$refs.tree.handleRecursionNodeChilds(this.$refs.tree, node => {
          if (node.model.selected) {
            this.selectedItems.push(node.model.id)
          }
        })
       */
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
      let sortBy = function (attr, rev) {
        if (rev === undefined) {
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
        let index = this.editingNode.parentItem.indexOf(this.editingItem)
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
      let index = node.parentItem.indexOf(item)
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

      return {fk: null, query: this.view.query, queryNames: queryNames, level: this.level}
    }
  },
  created () {
    this.$store.dispatch('materializedView', this.viewId).then((view) => {
      this.view = view
    })
  }
}
</script>
<style>
    .tree-default .tree-selected {
        background: #616161 !important;
    }
</style>
