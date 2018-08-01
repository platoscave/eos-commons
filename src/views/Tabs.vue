<template>
    <div  v-if="tabs.length > 1">
        <v-tabs v-model="selectedTab">
            <v-tab v-for="(tab, n) in tabs" :key="n" ripple>{{ tab.name }}</v-tab>
            <v-tab-item v-for="(tab, n) in tabs" :key="n">
                <div v-if="tab.widgets">
                    <!-- This tab has widgets -->
                    <widgets v-bind:level="level" v-bind:widgets="tab.widgets"></widgets>
                </div>
                <div v-if="tab.pageId">
                    <!-- This tab has a sub-page -->
                    <layout v-bind:level="level+1"></layout>
                </div>
            </v-tab-item>
        </v-tabs>
    </div>
    <div v-else-if="tabs.length > 0">
        <div v-if="tabs[0].widgets">
            <!-- This tab has widgets -->
            <widgets v-bind:level="level" v-bind:widgets="tabs[0].widgets"></widgets>
        </div>
        <div v-if="tabs[0].pageId">
            <!-- This tab has a sub-page -->
            <layout v-bind:level="level+1"></layout>
        </div>
    </div>
</template>

<script>
import Layout from './Layout.vue'
import Widgets from './Widgets.vue'

export default {
  name: 'tabs',
  components: {
    layout: Layout,
    widgets: Widgets
  },
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
        const pageDesc = this.$store.state.pages[this.level];
        return this.$store.state.pageStates[pageDesc.pageId].selectedTab
      },
      set (value) {
        const levelsArr = this.$route.path.split('/');
        const levelArr = levelsArr[this.level + 1].split('.');
        levelArr[2] = value; // Set the tab for this level
        levelsArr[this.level + 1] = levelArr.join('.');
        const newPath = levelsArr.join('/');
        this.$router.push(newPath)
      }
    }
  }
}
</script>
