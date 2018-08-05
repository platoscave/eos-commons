<template>
    <div  v-if="tabs.length > 1">
        <v-tabs v-model="selectedTab">
            <v-tab v-for="(tab, n) in tabs" :key="n" ripple>{{ tab.name }}</v-tab>
            <v-tab-item v-for="(tab, n) in tabs" :key="n">
                <div v-if="tab.widgets">
                    <!-- This tab has widgets -->
                    <ec-widgets v-bind:level="level" v-bind:widgets="tab.widgets"></ec-widgets>
                </div>
                <div v-if="tab.pageId">
                    <!-- This tab has a sub-page -->
                    <ec-layout v-bind:level="level+1"></ec-layout>
                </div>
            </v-tab-item>
        </v-tabs>
    </div>
    <div v-else-if="tabs.length > 0">
        <div v-if="tabs[0].widgets">
            <!-- This tab has widgets -->
            <ec-widgets v-bind:level="level" v-bind:widgets="tabs[0].widgets"></ec-widgets>
        </div>
        <div v-if="tabs[0].pageId">
            <!-- This tab has a sub-page -->
            <ec-layout v-bind:level="level+1"></ec-layout>
        </div>
    </div>
</template>

<script>
export default {
  props: {
    level: Number,
    tabs: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    selectedTab: {
      get () {
        const pageDesc = this.$store.state.levelIdsArr[this.level]
        return this.$store.state.pageStates[pageDesc.pageId].selectedTab
      },
      set (value) {
        const pageDesc = this.$store.state.levelIdsArr[this.level]

        this.$store.commit('SET_PAGE_STATE', {[pageDesc.pageId]: {selectedTab: value}})

        if (this.tabs[value].pageId) {
          // Create the pageState, if there isn't one already
          this.$store.commit('SET_PAGE_STATE', {[this.tabs[value].pageId]: {}})
          this.$store.commit('SET_LEVEL_IDS', {
            level: this.level + 1,
            ids: {
              selectedObjId: pageDesc.selectedObjId,
              pageId: this.tabs[value].pageId
            }
          })
        }
      }
    }
  }
}
</script>
