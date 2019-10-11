<template>
  <div class="full-height" v-if="tabs.length > 1">
    <v-tabs class="full-height" v-model="selectedTab" show-arrows>
      <v-tab v-for="(tab, n) in tabs" :key="n" ripple>{{ tab.name ? tab.name : '[no name]' }}</v-tab>
      <v-tab-item class="full-height" v-for="(tab, n) in tabs" :key="n">
        <div class="full-height" v-if="tab.widgets">
          <!-- This tab has widgets -->
          <ec-widgets v-bind:level="level" v-bind:widgets="tab.widgets"></ec-widgets>
        </div>
        <div class="full-height" v-if="tab.pageId">
          <!-- This tab has a sub-page -->
          <ec-layout v-bind:level="level+1"></ec-layout>
        </div>
      </v-tab-item>
    </v-tabs>
  </div>
  <div class="full-height" v-else-if="tabs.length > 0">
    <div v-if="tabs[0].widgets" class="full-height">
      <!-- This tab has widgets -->
      <ec-widgets v-bind:level="level" v-bind:widgets="tabs[0].widgets"></ec-widgets>
    </div>
    <div class="full-height" v-if="tabs[0].pageId">
      <!-- This tab has a sub-page -->
      <ec-layout v-bind:level="level+1"></ec-layout>
    </div>
  </div>
</template>

<script>
//must be declared globally
// import EcLayout from "./EcLayout.vue";
import EcWidgets from "./EcWidgets.vue";

export default {
  components: {
    EcWidgets
  },
  name: "ec-tabs",
  props: {
    level: Number,
    pageId: String,
    tabs: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    selectedTab: {
      get() {
        let pageStates = this.$store.state.pageStates[this.pageId];
        if (pageStates && pageStates.selectedTab) return pageStates.selectedTab;
        return 0;
      },
      set(value) {
        this.$store.commit("SET_PAGE_STATE2", {
          level: this.level,
          pageId: this.pageId,
          selectedTab: value,
          nextLevel: {
            pageId: this.tabs[value].pageId
          }
        });
      }
    }
  }
};
</script>
<style scoped>
>>> .v-window {
  height: calc(100% - 48px);
}
>>> .v-window__container {
  height: 100%;
}
</style>
