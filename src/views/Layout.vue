<template>
    <div class="full-height" v-if="pageObj.divider === 'Vertical' || pageObj.divider === 'Horizontal'">
        <multipane class="full-height" layout="vertical" v-on:paneResizeStop="paneResizeStop">
            <!-- Navigation content -->
            <div class="full-height" v-bind:style="{ width: paneWidth }">
                <ec-tabs v-bind:level="level" v-bind:tabs="pageObj.tabs" v-bind:pageId="pageObj.key"></ec-tabs>
            </div>
            <!-- Splitter -->
            <multipane-resizer></multipane-resizer>
            <!-- Main content -->
            <div class="full-height right">
                <ec-layout v-bind:level="level + 1"></ec-layout>
            </div>
        </multipane>
    </div>
    <div class="full-height" v-else>
        <!-- Only header layout content -->
        <ec-tabs v-bind:level="level" v-bind:tabs="pageObj.tabs" v-bind:pageId="pageObj.key"></ec-tabs>
    </div>
</template>

<script>
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
      this.$store.dispatch('getCommonByKey', pageDesc.pageId).then((pageObj) => {
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
    .right {
        flex-grow: 1;
        border-left: 8px solid blue;
    }
</style>
