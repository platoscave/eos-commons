<template>
  <div v-if="viewObj">
    <v-treeview
      :active.sync="active"
      :items="items"
      :load-children="loadChildren"
      :open.sync="open"
      activatable
      :multiple-active="false"
      item-key="key"
      transition
    >
      <template v-slot:prepend="{ item, active }">
        <v-icon v-if="!item.children">mdi-account</v-icon>
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
    open: [],
    users: [],
    viewObj: {},
    showMenu: false,
    x: 0,
    y: 0,
    items: [],
    menuItems: []
  }),

  computed: {
    Xitems() {
      return [
        {
          name: "Users",
          children: this.users
        }
      ];
    }
  },

  methods: {
    loadChildren: async function(item) {
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
            resultsArr = results.map(subItem => {
              return {
                key: subItem.key,
                name: subItem.title ? subItem.title : subItem.name,
                children: [],
                subQueryIds: query.subQueryIds,
                loaded: false
              };
            });
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

      let results = await this.$store.dispatch("query", queryObj);
      let icon;
      if (queryObj.query.icon) icon = queryObj.query.icon;
      let resultsArr = results.map(item => {
        return {
          key: item.key,
          name: item.title ? item.title : item.name,
          children: [],
          subQueryIds: queryObj.query.subQueryIds,
          loaded: false,
          icon: icon
        };
      });
      this.items = Object.assign([], resultsArr); // Force reactive update
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