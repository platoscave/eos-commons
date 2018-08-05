<template>
    <div  v-if="pageObj.divider === 'Vertical' || pageObj.divider === 'Horizontal'">
        <multipane class="container" layout="vertical" v-on:paneResizeStop="paneResizeStop">
            <!-- Navigation content -->
            <div class="left" v-bind:style="{ width: paneWidth }">
                <ec-tabs v-bind:level="level" v-bind:tabs="pageObj.tabs"></ec-tabs>
            </div>
            <!-- Splitter -->
            <multipane-resizer></multipane-resizer>
            <!-- Main content -->
            <div class="right">
                <ec-layout v-bind:level="level + 1"></ec-layout>
            </div>
        </multipane>
    </div>
    <div v-else>
        <!-- Only header layout content -->
        <ec-tabs v-bind:level="level" v-bind:tabs="pageObj.tabs"></ec-tabs>
    </div>
</template>

<script>
import router from 'vue-router'

export default {
  props: {
    level: {
      type: Number
    }
  },
  data () {
    return {
      pageObj: {},
      pageId: null
    }
  },
  computed: {
    paneWidth: function () {
      return this.$store.state.pageStates[this.pageId].paneWidth
    }
  },
  methods: {
    paneResizeStop (pane, resizer, size) {
      this.$store.commit('SET_PAGE_STATE', {[this.pageId]: {paneWidth: size}})
    },
    handelNewPage (pageDesc) {
      if (!pageDesc || !pageDesc.pageId) return
      this.pageId = pageDesc.pageId
      this.$store.dispatch('loadCommon', pageDesc.pageId).then((pageObj) => {
        this.pageObj = pageObj
      })
    }
  },
  created () {
    this.$store.watch((state) => (this.$store.state.levelIdsArr[this.level]), this.handelNewPage, {
      immediate: true
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
