<template>
    <v-app dark>
        <v-content>
            <router-view/>
        </v-content>

        <v-footer app>
            <span>{{message}}</span>
            <v-spacer></v-spacer>
            <span>eos-commons.io</span>
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
    span {
        padding: 5px;
    }
</style>
