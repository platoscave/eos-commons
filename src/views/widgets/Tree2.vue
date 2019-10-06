<template>
  <div v-if="viewObj">
    <v-treeview
      :items="nodes"
      :load-children="loadChildren"
      :active="active"
      v-on:update:active="updateActiveArr"
      :open="open"
      v-on:update:open="updateOpenArr"
      activatable
      item-key="key"
      Xreturn-object
      transition
      hoverable
      dense
    >
      <template v-slot:prepend="{ item, active }">
        <!-- See https://www.freepik.com for icons -->
        <img style="color: yellow;" class="iconClass" :src="item.icon" />
      </template>
    </v-treeview>
    <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute offset-y>
      <v-list>
        <v-list-tile
          v-for="(item, index) in menuItems"
          :key="index"
          @click="takeAction(item.action, item.parentNode, item.valuePath)"
        >
          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import Vue from "vue"; // nneded for _

export default {
  name: "ec-tree2",

  props: {
    level: Number,
    viewId: String
  },
  data: () => ({
    avatar: null,
    users: [],
    viewObj: {},
    showMenu: false,
    x: 0,
    y: 0,
    nodes: [],
    open: [],
    active: [],
    menuItems: [],
    disableUpdateOpenArr: true
  }),

  methods: {
    updateOpenArr: function(openedArr) {
      if (this.disableUpdateOpenArr) return;
      const pageId = this.$store.state.levelIdsArr[this.level].pageId;
      this.$store.commit("SET_NODE_TOGGLE", {
        openedArr: openedArr,
        pageId: pageId
      });
    },
    updateActiveArr: function(activeArr) {
      if (this.disableUpdateOpenArr) return;
      const item = this.findTreeItem(this.nodes, activeArr[0]);
      this.$store.commit("SET_PAGE_STATE2", {
        level: this.level + 1,
        pageId: item.pageId,
        selectedObjId: activeArr[0]
      });
    },
    loadChildren: async function(node) {
      // Recusivly get the default icon, from the first ancestor class that has one
      const getIconFromClassById = async classId => {
        let classObj = await this.$store.dispatch("getCommonByKey", classId);
        if (classObj.icon) return classObj.icon;
        if (classObj.parentId)
          return await getIconFromClassById(classObj.parentId);
        return ""; // set to default icon
      };

      // Recusivly get the default pageId, from the first ancestor class that has one
      const getPageIdFromClassById = async classId => {
        let classObj = await this.$store.dispatch("getCommonByKey", classId);
        if (classObj.pageId) return classObj.pageId;
        if (classObj.parentId)
          return await getPageIdFromClassById(classObj.parentId);
        return ""; // set to default pageId
      };

      // Make node from item
      const makeNode = async (query, item, getGrandchildren) => {
        let icon = query.icon ? query.icon : item.icon;
        // Get the default icon from the class
        if (!icon)
          icon = await getIconFromClassById(
            item.classId ? item.classId : item.parentId
          );

        let pageId = query.pageId ? query.pageId : item.pageId;
        // Get the default icon from the class
        if (!pageId)
          pageId = await getPageIdFromClassById(
            item.classId ? item.classId : item.parentId
          );

        let node = {
          key: item.key,
          name: item.title ? item.title : item.name,
          subQueryIds: query.subQueryIds,
          loaded: false,
          icon: icon,
          pageId: pageId,
          classId: item.classId,
          parentId: item.parentId,
          children: []
        };

        //node.children = []
        return node;
      };

      // Get children for subQueryId
      const getChildrenForSubqueryId = async (
        subqueryId,
        currentObjId,
        getGrandchildren
      ) => {
        const query = await this.$store.dispatch("getCommonByKey", subqueryId);
        let results = await this.$store.dispatch("query", {
          query: query,
          currentObj: currentObjId
        });

        let resultsArrPromise = results.map(async subItem => {
          return makeNode(query, subItem, getGrandchildren);
        });
        let resultsArr = await Promise.all(resultsArrPromise);
        return resultsArr;
      };

      // returns an array of childnodes
      const getChildren = async (node, getGrandchildren) => {
        console.log('getGrandchildren node', getGrandchildren, node)

        if (node.subQueryIds) {
          let childrenPromises = node.subQueryIds.map(async subqueryId => {
            return getChildrenForSubqueryId(
              subqueryId,
              node.key,
              getGrandchildren
            );
          });
          let childrenArrArr = await Promise.all(childrenPromises);
          let childrenArr = Vue._.union.apply(null, childrenArrArr);
          //console.log("childrenArr", childrenArr);
          node.loaded = true;
          if (childrenArr.length) node.children = childrenArr;
        }
        // if (node.key === "be1ub1vtofjo") debugger;

        let grandchildrenPromisses = [];
        if (getGrandchildren && node.children) {
          grandchildrenPromisses = node.children.map(async childNode => {
            return getChildren(childNode, false);
          });
        }

        let grandchildren = await Promise.all(grandchildrenPromisses);
        console.log('node', node)
        // if (node.key === "eoscommonsio") debugger;
        //this.onOpenBtn()
        return true
      };

      console.log("node", node);
      if (!node.subQueryIds) return;
      if (!Array.isArray(node.subQueryIds))
        node.subQueryIds = [node.subQueryIds];

      return await getChildren(node, false);
    },

    findTreeItem(nodes, key) {
      if (!nodes) {
        return;
      }

      for (const item of nodes) {
        // Test current object
        if (item.key === key) {
          return item;
        }

        // Test children recursively
        const child = this.findTreeItem(item.children, key);
        if (child) {
          return child;
        }
      }
    },

    async refresh() {
      let queryObj = {
        currentObj: this.$store.state.levelIdsArr[this.level].selectedObjId
      };

      // get the query for this view
      queryObj.query = await this.$store.dispatch(
        "getCommonByKey",
        this.viewObj.subQueryIds
      );

      const results = await this.$store.dispatch("query", queryObj);
      const item = results[0];

      let icon = queryObj.query.icon ? queryObj.query.icon : item.icom;
      // Get the default icon from the class
      /* if (!icon)
        icon = await getIconFromClassById(
          item.classId ? item.classId : item.parentId
        ); */
      let pageId = queryObj.query.pageId ? queryObj.query.pageId : item.pageId;

      const node = {
        key: item.key,
        name: item.title ? item.title : item.name,
        children: [],
        subQueryIds: queryObj.query.subQueryIds,
        loaded: false,
        icon: icon,
        pageId: pageId,
        classId: item.classId,
        parentId: item.parentId
      };
      this.nodes = Object.assign([], [node]); // Force reactive update
      this.autoOpenTreeNodes();
    },
    autoOpenTreeNodes() {
      const pageId = this.$store.state.levelIdsArr[this.level].pageId;
      const openedArr = this.$store.state.pageStates[pageId].openedArr;
      const nextLevelsArr = this.$store.state.levelIdsArr[this.level + 1];
      const activeArr = nextLevelsArr ? [nextLevelsArr.selectedObjId] : [];

      let count = 0
      let myVar = setInterval(() => {
        if(count > 1) this.open = Object.assign([], openedArr); // Force reactive update
        if(count === 5) this.active = Object.assign([], activeArr); // Force reactive update
        if(count > 5) {
            clearInterval(myVar);
            this.disableUpdateOpenArr = false;
        }
        count ++
      }, 500);
    }
  },
  created() {
    this.$store.dispatch("getMaterializedView", this.viewId).then(viewObj => {
      this.viewObj = viewObj;
      this.refresh();
    });

    // watch the selected obj change
    this.$store.watch(
      state => state.levelIdsArr[this.level].selectedObjId,
      this.refresh
    );
  }
};
</script>
<style scoped>
.iconClass {
  block-size: 24px;
  border-radius: 5%;
}
</style>
