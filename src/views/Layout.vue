<template>
    <div  v-if="{{ hasDivider }}">
        <multipane class="vertical-panes" layout="vertical">
            <div class="pane" :style="{ width: '200px'}">
                <!-- Navigation content -->
                <tabs level="{{ level }}"></tabs>
            </div>
            <!-- Splitter -->
            <multipane-resizer></multipane-resizer>
            <div class="pane">
                <!-- Main content -->
                <tabs level="{{ level + 1 }}"></tabs>
            </div>
        </multipane>
    </div>
    <div v-else>
        <!-- Only header layout content -->
        <tabs level="{{ level }}"></tabs>
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
  data () {
    return {
      level: {
        type: Number
      }
    }
  },
  computed: {
    hasDivider () {
      // return this.$store.getters.getMessage;
      return true
    }
  }
}
</script>
<style>
    .vertical-panes {
        width: 100%;
        height: 100%;
    }

    .vertical-panes > .pane {
        text-align: left;
        padding: 15px;
        overflow: hidden;
    }

    .vertical-panes > .pane ~ .pane {
        border-left: 3px solid blue;
    }
</style>
