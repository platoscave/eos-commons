<template>
    <div v-if="tabs.length > 1">
        <v-tabs class="full-height" v-model="selectedTab" show-arrows>
            <v-tab v-for="(tab, n) in tabs" :key="n" ripple>{{ tab.name ? tab.name : '[no name]' }}</v-tab>
            <v-tab-item class="tab-item-element" v-for="(tab, n) in tabs" :key="n">
                <div class="full-height" v-if="selectedTab === n">
                    <div class="full-height" v-if="tab.widgets">
                        <!-- This tab has widgets -->
                        <keep-alive>  <!-- https://vuejs.org/v2/guide/components-dynamic-async.html#keep-alive-with-Dynamic-Components -->
                          <ec-widgets class="contents-full-height" v-bind:level="level" v-bind:widgets="tab.widgets"></ec-widgets>
                        </keep-alive>
                    </div>
                    <div class="full-height" v-if="tab.pageId">
                        <!-- This tab has a sub-page -->
                        <ec-layout class="contents-full-height" v-bind:level="level+1"></ec-layout>
                    </div>
                </div>
            </v-tab-item>
        </v-tabs>
    </div>
    <div v-else-if="tabs.length > 0">
        <div v-if="tabs[0].widgets">
            <!-- This tab has widgets -->
            <ec-widgets class="contents-full-height" v-bind:level="level" v-bind:widgets="tabs[0].widgets"></ec-widgets>
        </div>
        <div v-if="tabs[0].pageId">
            <!-- This tab has a sub-page -->
            <ec-layout class="contents-full-height" v-bind:level="level+1"></ec-layout>
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
  >>> .v-window {
    height: calc(100% - 48px);
  }
  >>> .v-window__container {
    height: 100%;
  }
  .full-height {
    height: 100%
  }
  .tab-item-element {
    height: 100%
  }
  .contents-full-height {
    height: 100%
  }
  .contents-full-height > div {
    height: 100%
  }
</style>
