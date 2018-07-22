<template>
    <div  v-if="!computeLoading">
        <layout class="pane" v-bind:level="0"></layout>
    </div>
</template>
<script>
import Layout from './Layout.vue'

export default {
  name: 'Home',
  components: {
    layout: Layout
  },
  computed: {
    computeLoading () {
      return this.$store.state.loading
    }
  },
  created () {
    this.$store.dispatch('loadClasses')
  }
}
</script>
<style scoped>
    .pane {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
</style>
