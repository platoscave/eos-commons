<template>
  <div v-if="view" class="tree">
    <v-jstree
      :data="asyncData"
      :async="loadData"
      :item-events="itemEvents"
      draggable
      sort
      @item-click="itemClick"
      @item-drag-start="itemDragStart"
      @item-drag-end="itemDragEnd"
      @item-drop-before="itemDropBefore"
      @item-drop="itemDrop"
      @item-toggle="itemToggle"
      ref="tree2"
    >
      <template slot-scope="_">
        <div style="display: inherit; width: 200px" @click.ctrl="customItemClickWithCtrl">
          <!-- <div>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div> -->
          <img
            class="tree-default tree-icon"
            :src="_.model.Xdata.icon"
            role="presentation"
            v-if="!_.model.loading"
          >
          {{_.model.text}}
          <button
            style="border: 0px; background-color: transparent; cursor: pointer;"
            @click="customItemClick(_.vm, _.model, $event)"
          >
            <i class="fa fa-remove"></i>
          </button>
        </div>
      </template>
    </v-jstree>
    <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute offset-y>
      <v-list>
        <v-list-tile v-for="(item, index) in menuItems" :key="index" @click="takeAction(item.action, item.parentNode, item.value)" >
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import VJstree from "vue-jstree";
export default {
  components: {
    VJstree
  },
  props: {
    level: Number,
    viewId: String
  },
  data() {
    return {
      view: null,
      asyncData: [],
      loadData: function(oriNode, resolve) {
        if (!oriNode || !oriNode.data.key) {
          let viewQueryObj = {
            currentObj: {},
            subqueryIds: this.$parent.view.subqueryIds
          };
          this.$store.dispatch("getTreeNodes", viewQueryObj).then(result => {
            resolve(result);
          });
        } else {
          this.$store
            .dispatch("getTreeNodes", oriNode.data.Xdata.queryArrObj)
            .then(result => {
              resolve(result);
            });
        }
      },
      itemEvents: {
        contextmenu: (vueComponent, node, event) => {
          console.log("contextmenu", node);
          this.showPopuupMenu(vueComponent, node, event);
        }
      },
      showMenu: false,
      x: 0,
      y: 0,
      menuItems: []
    };
  },
  methods: {
    itemClick(node) {
      if (node.model.Xdata.pageId) {
        this.$store.commit("SET_PAGE_STATE2", {
          level: this.level + 1,
          pageId: node.model.Xdata.pageId,
          selectedObjId: node.model.key
        });
      }
    },
    itemToggle(oriNode, oriItem, e) {
      this.$store.commit("SET_NODE_TOGGLE", {
        key: oriItem.key,
        opened: oriItem.opened
      });
    },
    itemDragStart(node) {
      console.log(node.model.text + " drag start !");
    },
    itemDragEnd(node) {
      console.log(node.model.text + " drag end !");
    },
    itemDropBefore(node, item, draggedItem, e) {
      if (!draggedItem) {
        item.addChild({
          text: "newNode",
          value: "newNode"
        });
      }
    },
    itemDrop(node, item, draggedItem, e) {
      let sortBy = function(attr, rev) {
        if (rev === undefined) {
          rev = 1;
        } else {
          rev = rev ? 1 : -1;
        }
        return function(a, b) {
          a = a[attr];
          b = b[attr];
          if (a < b) {
            return rev * -1;
          }
          if (a > b) {
            return rev * 1;
          }
          return 0;
        };
      };
      item.children.sort(sortBy("text", true));
      this.$refs.tree.handleRecursionNodeChildren(draggedItem, function(
        childrenItem
      ) {
        childrenItem.selected = item.selected;
      });
      console.log(node.model.text + " drop !");
    },
    inputKeyUp: function() {
      var text = this.searchText;
      const patt = new RegExp(text);
      this.$refs.tree.handleRecursionNodeChilds(this.$refs.tree, function(
        node
      ) {
        if (text !== "" && node.model !== undefined) {
          const str = node.model.text;
          if (patt.test(str)) {
            node.$el.querySelector(".tree-anchor").style.color = "red";
          } else {
            node.$el.querySelector(".tree-anchor").style.color = "#000";
          } // or other operations
        } else {
          node.$el.querySelector(".tree-anchor").style.color = "#000";
        }
      });
    },
    addChildNode: function() {
      if (this.editingItem.key !== undefined) {
        this.editingItem.addChild({
          text: "newNode",
          value: "newNode"
        });
      }
    },
    removeNode: function() {
      if (this.editingItem.key !== undefined) {
        let index = this.editingNode.parentItem.indexOf(this.editingItem);
        this.editingNode.parentItem.splice(index, 1);
      }
    },
    addBeforeNode: function() {
      if (this.editingItem.key !== undefined) {
        this.editingItem.addBefore(
          {
            text: "newNode",
            value: "newNode"
          },
          this.editingNode
        );
      }
    },
    addAfterNode: function() {
      if (this.editingItem.key !== undefined) {
        this.editingItem.addAfter(
          {
            text: "newNode",
            value: "newNode"
          },
          this.editingNode
        );
      }
    },
    openChildren: function() {
      if (this.editingItem.key !== undefined) {
        this.editingItem.openChildren();
      }
    },
    closeChildren: function() {
      if (this.editingItem.key !== undefined) {
        this.editingItem.closeChildren();
      }
    },
    refreshNode: function() {
      this.asyncData = [this.$refs.tree2.initializeLoading()];
      this.$refs.tree2.handleAsyncLoad(this.asyncData, this.$refs.tree2);
    },
    customItemClick: function(node, item, e) {
      e.stopPropagation();
      let index = node.parentItem.indexOf(item);
      node.parentItem.splice(index, 1);
    },
    customItemClickWithCtrl: function() {
      console.log("click + ctrl");
    },
    showPopuupMenu: async function(vueComponent, node, event) {
      event.preventDefault();
      this.showMenu = false;
      this.x = event.clientX;
      this.y = event.clientY;
      this.menuItems = [];

      let subqueryIds = _.get(node, "Xdata.queryArrObj.subqueryIds");
      if (subqueryIds) {
        // Make sure subqueryIds is an Array
        if (!Array.isArray(subqueryIds)) subqueryIds = [subqueryIds];

        let menuItemsArrPromisses = subqueryIds.map(async queryId => {
          // Get the query
          let query = await this.$store.dispatch("getCommonByKey", queryId);

          const docProp = _.get(query, "where.docProp");
          const value = _.get(query, "where.value");
          if (docProp === "classId")
            return {
              title: "Add a " + node.text + " Object",
              action: "addObject",
              parentNode: node
            };
          if (docProp === "parentId")
            return {
              title: "Add a Subclass to " + node.text,
              action: "addSubClass",
              parentNode: node
            };
          else if (value.startsWith("#"))
            return {
              title: "Add Sub to " + node.text,
              action: "addSubObject",
              parentNode: node,
              value: value
            };
          else return { title: "Dont Know" };
        });

        this.menuItems = await Promise.all(menuItemsArrPromisses);
      }
      this.menuItems.push({ title: "Delete " + node.text });

      this.$nextTick(() => {
        this.showMenu = true;
      });
    },
    takeAction: async function(action, parentNode, subIdsName) {
	  console.log("action", action, subIdsName);
	  
      if (action === "addObject") {
        const classId = _.get(
          parentNode,
          "Xdata.queryArrObj.currentObj.key"
        )
        let newObject = {
          classId: classId,
          name: "[new object]",
          docType: "object"
        }
        let key = await this.$store.dispatch("upsertCommon", newObject)
	  } 

	  else if (action === "addSubClass") {
        const parentId = _.get(
          parentNode,
          "Xdata.queryArrObj.currentObj.key"
        )
        let newObject = {
          parentId: parentId,
          name: "[new class]",
          docType: "class"
        }
        let key = await this.$store.dispatch("upsertCommon", newObject)
	  }

	  else if (action === "addSubObject") {
        const classId = _.get(
          parentNode,
          "Xdata.queryArrObj.currentObj.classId"
        );
        let newObject = {
          classId: classId,
          name: "[new document]",
          docType: "object"
        };
		let key = await this.$store.dispatch("upsertCommon", newObject)
		
        let currentObj = _.get(parentNode, "Xdata.queryArrObj.currentObj")
        const path = subIdsName.substr(1);
        let subIdsArr = _.get(currentObj, path);
		if(subIdsArr) subIdsArr.push(key)
		else _.set(currentObj, path, [key]) 
        let updatedObj = await this.$store.dispatch("upsertCommon", currentObj);
      }
    }
  },
  created() {
    this.$store.dispatch("materializedView", this.viewId).then(view => {
      this.view = view;
    });
  }
};
</script>
<style>
.tree-default .tree-selected {
  background: #616161 !important;
}
</style>
