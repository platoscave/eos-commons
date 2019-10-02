<template>
  <div v-if="viewObj">
    <v-treeview
      :active.sync="getSetActive"
      :items="items"
      :load-children="loadChildren"
      :open.sync="getSetOpen"
      activatable
      item-key="key"
      transition
      dense
    >
      <template v-slot:prepend="{ item, active }">
        <!-- See https://www.freepik.com for icons -->
        <img class="iconClass" :src="item.icon" />
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
    active: [],
    avatar: null,
    Xopen: [],
    users: [],
    viewObj: {},
    showMenu: false,
    x: 0,
    y: 0,
    items: [],
    menuItems: []
  }),

  computed: {
    getSetOpen: {
      get() {
        const pageId = this.$store.state.levelIdsArr[this.level].pageId;
        const openedArr = this.$store.state.pageStates[pageId].openedArr;
        return;
        if (!openedArr) return [];
        return [openedArr];
      },
      set(openedArr) {
        const pageId = this.$store.state.levelIdsArr[this.level].pageId;
        this.$store.commit("SET_NODE_TOGGLE", {
          openedArr: openedArr,
          pageId: pageId
        });
      }
    },

    getSetActive: {
      get() {
        const levelsArr = this.$store.state.levelIdsArr[this.level + 1];
        if (levelsArr) return [levelsArr.currentObjId];
        return [];
      },
      set(activeArr) {
        const pageId = this.$store.state.levelIdsArr[this.level].pageId;
        return;
        this.$store.commit("SET_PAGE_STATE2", {
          level: this.level + 1,
          pageId: pageId,
          selectedObjId: activeArr[0]
        });
      }
    }
  },

  methods: {
    loadChildren: async function(item) {
      // Recusivly get the default icon, from the first ancestor class that has one
      const getIconFromClassById = async classId => {
        let classObj = await this.$store.dispatch("getCommonByKey", classId);
        console.log("classObj", classObj);
        if (classObj.icon) return classObj.icon;
        else if (classObj.parentId)
          return await getIconFromClassById(classObj.parentId);
        return ""; // set to default icon
      };

      // Recusivly get the default pageId, from the first ancestor class that has one
      const getPageIdFromClassById = async classId => {
        let classObj = this.$store.dispatch("getCommonByKey", classId);
        if (classObj.pageId) return classObj.pageId;
        else if (classObj.parentId)
          return await getPageIdFromClassById(classObj.parentId);
        return ""; // set to default pageId
      };

      // returns an array of childnodes
      const getChildren = async (item, getGrandChildren) => {
        if (!item.loaded) {
          let resultsArr = [];
          let childrenPromises = item.subQueryIds.map(async subqueryId => {
            const query = await this.$store.dispatch(
              "getCommonByKey",
              subqueryId
            );
            let results = await this.$store.dispatch("query", {
              query: query,
              currentObj: item.key
            });

            let resultsArrPromise = results.map(async subItem => {
              let icon = query.icon ? query.icon : subItem.icon;
              if (subItem.icon) debugger;
              // Get the default icon from the class
              if (!icon)
                icon = await getIconFromClassById(
                  item.classId ? item.classId : item.parentId
                );
              let pageId = query.pageId ? query.pageId : item.pageId;
              return {
                key: subItem.key,
                name: subItem.title ? subItem.title : subItem.name,
                children: [],
                subQueryIds: query.subQueryIds,
                loaded: false,
                icon: icon,
                pageId: pageId,
                classId: item.classId,
                parentId: item.parentId
              };
            });
          let resultsArr = await Promise.all(resultsArrPromise);
            return resultsArr;
          });
          let childrenArrArr = await Promise.all(childrenPromises);
          let childrenArr = Vue._.union.apply(null, childrenArrArr);
          //item.children = childrenArr
          console.log("childrenArr", childrenArr);
          //if(childrenArr.length === 0) debugger
          if (childrenArr.length === 0) delete item.children;
          item.loaded = true;
          if (childrenArr.length > 0) item.children = childrenArr;
        }
        console.log("one", item);
        if (getGrandChildren && item.children) {
          item.children.forEach(subItem => {
            // getChildren(subItem, false);
            // if (subItem.children.length = 0) delete subItem.children
          });
          console.log("two", item);
        }
      };

      console.log("item", item);
      if (!item.subQueryIds) return;
      if (!Array.isArray(item.subQueryIds))
        item.subQueryIds = [item.subQueryIds];

      await getChildren(item, true);
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
      this.items = Object.assign([], [node]); // Force reactive update
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
