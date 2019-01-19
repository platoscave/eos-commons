<template>
    <div  v-if="pageObj.divider === 'Vertical' || pageObj.divider === 'Horizontal'">
        <multipane class="container" layout="vertical" v-on:paneResizeStop="paneResizeStop">
            <!-- Navigation content -->
            <div class="left" v-bind:style="{ width: paneWidth }">
                <ec-tabs class="xpane" v-bind:level="level" v-bind:tabs="pageObj.tabs" v-bind:pageId="pageObj.id"></ec-tabs>
            </div>
            <!-- Splitter -->
            <multipane-resizer></multipane-resizer>
            <!-- Main content -->
            <div class="right">
                <ec-layout class="pane" v-bind:level="level + 1"></ec-layout>
            </div>
        </multipane>
    </div>
    <div v-else>
        <!-- Only header layout content -->
        <ec-tabs class="xpane" v-bind:level="level" v-bind:tabs="pageObj.tabs" v-bind:pageId="pageObj.id"></ec-tabs>
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
      this.$store.commit('SET_PAGE_STATE2', {
        pageId: this.pageId,
        paneWidth: size
      })
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
        /*position: relative;*/
        height: 100%;
        width: 100%;
        padding: 0px;
        margin: 0px;
        max-width: none;
    }
    .left {
        height: 100%;
    }
    .right {
        flex-grow: 1;
        height: 100%;
        border-left: 8px solid blue;
    }
    .pane {
        /*position: absolute;*/
        /*position: relative;*/
        /*top: 0;*/
        width: 100%;
        height: 100%;
        overflow: auto;
    }
    .pane > div {
        height: 100%;
    }
    .pane > div > div {
        height: 100%;
    }
    .pane > div > div > div {
        height: 100%;
    }
    .xtabs-container-div {
        position: relative;
        height: 100%;
    }
    .xtab-item-element {
        position: absolute;
        top: 0;
        /*height: calc(100% - 48px) !important;*/
        height: 100%;
        overflow: auto;
    }
</style>
