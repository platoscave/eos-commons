<template>
    <div  v-if="page.divider === 'Vertical' || page.divider === 'Horizontal'">
        <multipane class="container" layout="vertical" v-on:paneResizeStop="paneResizeStop">
            <div class="left" v-bind:style="{ width: paneWidth }">
                <!-- Navigation content -->
                <tabs v-bind:level="level"></tabs>
            </div>
            <!-- Splitter -->
            <multipane-resizer></multipane-resizer>
            <div class="right">
                <!-- Main content -->
                <tabs v-bind:level="level + 1"></tabs>
            </div>
        </multipane>
    </div>
    <div v-else>
        <!-- Only header layout content -->
        <tabs v-bind:level="level"></tabs>
    </div>
</template>

<script>
import { Multipane, MultipaneResizer } from 'vue-multipane'
import Tabs from './Tabs.vue'
import router from 'vue-router'

export default {
  components: {
    Multipane,
    MultipaneResizer,
    tabs: Tabs
  },
  props: {
    level: {
      type: Number
    }
  },
  data () {
    return {
      page: {}
    }
  },
  computed: {
    pageId: function () {
      const levelsArr = this.$route.path.split('/')
      const levelArr = levelsArr[this.level + 1].split('.')
      console.log('layout compute', levelArr[0])
      return levelArr[0]
    },
    paneWidth: function () {
      return this.$store.state.pageStates[this.pageId].paneWidth
    }
  },
  watch: {
    '$route'(to, from) {
      // this.loadPage(this.pageId)
    }
  },
  methods: {
    paneResizeStop(pane, resizer, size) {
      this.$store.commit('SET_PANE_WIDTH', {paneWidth: size, pageId: this.pageId})
    },
    loadPage(pageId) {
      debugger
      this.$store.dispatch('loadPage', pageId).then((page) => {
        this.page = page
      })
    }
  },
  created () {
    this.$store.dispatch('loadPage', this.pageId).then((page) => {
      this.page = page
    })
  }
}
</script>
<style scoped>
    .container {
        height: 100vh;
        width: 100%;
        padding: 0px;
    }
    .left {
        height: 100vh;
    }
    .right {
        flex-grow: 1;
        height: 100vh;
        border-left: 5px solid blue;
    }
</style>
