<template>
    <v-app dark>
        <ec-layout v-if="!loading" class="content-pane" v-bind:level="0"></ec-layout>
        <div class="footer">
            <div>{{message}}</div>
            <button @click="onSave()">Save</button>
            <div>eos-commons.io</div>
        </div>
    </v-app>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      loading: true
    }
  },
  computed: {
    message () {
      return this.$store.getters.getMessage
    }
  },
  methods: {
    onSave (e) {
      this.$store.commit('SAVE', {})
    }
  },
  created () {
    this.$store.dispatch('loadCommons').then(res => {
      if (!window.location.hash) window.location.hash = '#/.j4ichkhammzm' // Demo Page
      this.loading = false
      return this.$store.dispatch('loadEOS').then(res => {
        return res
      })
    })
  }
}
</script>
<style scoped>
    .content-pane {
        width: 100vw;
        height: calc(100vh - 35px);
    }
    .footer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 0px 10px 0px 10px;
        background: #212121;
        color: #fff;
        height: 35px;
        width: 100vw;
    }
</style>
<style>
    html {
        overflow-y: auto;
    }
</style>
