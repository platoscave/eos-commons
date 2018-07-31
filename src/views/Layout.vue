<template>
    <div  v-if="pageObj.divider === 'Vertical' || pageObj.divider === 'Horizontal'">
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
      pageObj: {}
    }
  },
  computed: {
    pageId: function () {
      return this.$store.state.pages[this.level].pageId
    },
    paneWidth: function () {
      return this.$store.state.pageStates[this.pageId].paneWidth
    }
  },
  watch: {
    pageId (pageId, from) {
      if(pageId) this.$store.dispatch('loadCommon', pageId).then((pageObj) => {
        this.pageObj = pageObj
      })
    }
  },
  methods: {
    paneResizeStop(pane, resizer, size) {
      this.$store.commit('SET_PANE_WIDTH', {paneWidth: size, pageId: this.pageId})
    },
/*    loadPage(pageId) {
      debugger
      this.$store.dispatch('loadPage', pageId).then((pageObj) => {
        this.pageObj = pageObj
      })
    }*/
  },
/*  created () {
    this.$store.dispatch('loadPage', this.pageId).then((pageObj) => {
      this.pageObj = pageObj
    })
  }*/
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
