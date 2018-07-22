<template>
    <div  v-if="page.divider === 'Vertical' || page.divider === 'Horizontal'">
        <multipane class="container" layout="vertical">
            <div class="left" :style="{ width: '300px'}">
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
      page: {},
    }
  },
  computed: {
    loaded () {
      return this.$store.state.pageStates['575d4c3f2cf3d6dc3ed83146']
    }
  },
  watch: {
    loaded (pageLoaded) {
      if (pageLoaded) this.page = this.$store.getters.getObjById('575d4c3f2cf3d6dc3ed83146')
      else this.$store.dispatch('loadPage', '575d4c3f2cf3d6dc3ed83146')
    }
  },
  created () {
    this.$store.dispatch('loadPage', '575d4c3f2cf3d6dc3ed83146').then( (page) => {
      this.page = page
    })
    /* this.$store.dispatch('materializedView', '575d4c3f2cf3d6dc3ed8314d').then( (view) => {
      console.log('view', view)
    }) */
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
