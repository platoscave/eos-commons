<template>
    <div class="tabs-container-div" v-if="tabs.length > 1">
        <v-tabs  v-model="selectedTab" show-arrows>
            <v-tab v-for="(tab, n) in tabs" :key="n" ripple>{{ tab.name ? tab.name : '[no name]' }}</v-tab>
            <v-tab-item class="tab-item-element" v-for="(tab, n) in tabs" :key="n">
                <div v-if="selectedTab === n">
                    <div v-if="tab.widgets">
                        <!-- This tab has widgets -->
                        <ec-widgets v-bind:level="level" v-bind:widgets="tab.widgets"></ec-widgets>
                    </div>
                    <div v-if="tab.pageId">
                        <!-- This tab has a sub-page -->
                        <ec-layout v-bind:level="level+1"></ec-layout>
                    </div>
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
    pageId: String,
    tabs: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    selectedTab: {
      get () {
        return this.$store.state.pageStates[this.pageId].selectedTab
      },
      set (value) {
        this.$store.commit('SET_PAGE_STATE2', {
          level: this.level,
          pageId: this.pageId,
          selectedTab: value,
          nextLevel: {
            pageId: this.tabs[value].pageId
          }
        })
      }
    }
  }
}
</script>
<style scoped>
    /* See https://codesandbox.io/s/w0r9po19kw */
    .tabs-container-div {
        position: relative;
        height: 100%;
    }
    .tab-item-element {
        /*position: absolute;*/
        top: 0;
        /*height: calc(100% - 48px) !important;*/
        height: 100%;
        overflow: auto;
    }
    .tab-item-element > div {
        position: relative;
        height: 100%;
    }
    .tab-item-element > div > div  {
        position: relative;
        height: 100%;
    }
    .tab-item-element > div > div > div {
        position: relative;
        height: 100%;
    }
    >>> .v-tabs__items {
        position: relative;
        height: calc(100% - 48px) !important;
    }
    .tabs-container-div .v-tabs  {
        position: relative;
        height: 100%;
    }
</style>
