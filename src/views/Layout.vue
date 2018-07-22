<template>
    <div  v-if="pageObj.divider === 'Vertical' || pageObj.divider === 'Horizontal'">
        <multipane class="vertical-panes" layout="vertical">
            <div class="pane" :style="{ width: '200px'}">
                <!-- Navigation content -->
                <tabs v-bind:level="level"></tabs>
            </div>
            <!-- Splitter -->
            <multipane-resizer></multipane-resizer>
            <div class="pane">
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
      pageObj: {},
      xloaded: false
    }
  },
  computed: {
    loaded () {
      // return this.$store.getters.getPageLoaded('575d4c3f2cf3d6dc3ed83146')
      // return Vue._.get('this.$store.state.pageStates["575d4c3f2cf3d6dc3ed83146"]')
      return this.$store.state.pageStates['575d4c3f2cf3d6dc3ed83146']
    }
  },
  watch: {
    loaded (pageLoaded) {
      if (pageLoaded) this.pageObj = this.$store.getters.getObjById('575d4c3f2cf3d6dc3ed83146')
      else this.$store.dispatch('loadPage', '575d4c3f2cf3d6dc3ed83146')
    }
  },
  created () {
    this.$store.dispatch('loadPage', '575d4c3f2cf3d6dc3ed83146')
  }
}
</script>
<style scoped>
    .vertical-panes {
        height: 100%;
    }
    .vertical-panes > .pane {
        padding: 0px;
    }

</style>
