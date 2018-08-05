<template>
    <div  v-if="!computeLoading">
        <ec-layout class="pane" v-bind:level="1"></ec-layout>
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
