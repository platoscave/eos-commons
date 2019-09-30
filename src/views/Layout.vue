<template>
  <div
    class="full-height"
    v-if="pageObj.divider === 'Vertical' || pageObj.divider === 'Horizontal'"
  >
    <rs-panes
      split-to="columns"
      :allow-resize="true"
      v-on:update:size="paneResizeStop"
      :size="paneWidth"
      :min-size="40"
      resizerColor="#2196f3"
    >
      <!-- Navigation content -->
      <div slot="firstPane" class="full-height">
        <ec-tabs v-bind:level="level" v-bind:tabs="pageObj.tabs" v-bind:pageId="pageObj.key"></ec-tabs>
      </div>
      <!-- Main content -->
      <div slot="secondPane" class="full-height right">
        <ec-layout v-bind:level="level + 1"></ec-layout>
      </div>
    </rs-panes>
  </div>
  <div class="full-height" v-else>
    <!-- Only header layout content -->
    <ec-tabs v-bind:level="level" v-bind:tabs="pageObj.tabs" v-bind:pageId="pageObj.key"></ec-tabs>
  </div>
</template>

<script>
import ResSplitPane from "vue-resize-split-pane";
export default {
  components: {
    "rs-panes": ResSplitPane
  },
  props: {
    level: {
      type: Number
    }
  },
  data() {
    return {
      pageObj: {},
      pageId: null
    };
  },
  computed: {
    paneWidth: function() {
      return this.$store.state.pageStates[this.pageId].paneWidth;
    }
  },
  methods: {
    paneResizeStop(pane, resizer, size) {
      this.$store.commit("SET_PAGE_STATE2", {
        pageId: this.pageId,
        paneWidth: size
      });
    },
    handelNewPage(pageDesc) {
      if (!pageDesc || !pageDesc.pageId) return;
      this.pageId = pageDesc.pageId;
      this.$store.dispatch("getCommonByKey", pageDesc.pageId).then(pageObj => {
        this.pageObj = pageObj;
      });
    }
  },
  created() {
    this.$store.watch(
      state => this.$store.state.levelIdsArr[this.level],
      this.handelNewPage,
      {
        immediate: true
      }
    );
  }
};
</script>
<style scoped>
.pane-rs {
    position: unset;
}
</style>
