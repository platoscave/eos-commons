<template>
    <v-app dark>
        <v-content class="noPadding">
            <router-view/>
        </v-content>

        <v-footer app>
            <div class="padding">{{message}}</div>
            <v-spacer></v-spacer>
            <div class="padding">eos-commons.io</div>
        </v-footer>
    </v-app>
</template>

<script>
export default {
  name: 'App',
  computed: {
    message () {
      return this.$store.getters.getMessage
    }
  }
}
</script>
<style scoped>
    .noPadding{
        padding: 0 !important;
    }
    .padding {
        padding: 10px
    }
</style>
<style>
    html {
        overflow-y: auto;
    }
</style>
