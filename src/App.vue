<template>
    <v-app dark>
        <v-navigation-drawer
                persistent
                :clipped="clipped"
                v-model="drawer"
                enable-resize-watcher
                fixed
                app
        >
            <v-list>
                <v-list-tile
                        value="true"
                        :to="item.link"
                        v-for="(item, i) in items"
                        :key="i"
                >
                    <v-list-tile-action>
                        <v-icon v-html="item.icon"></v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                        <v-list-tile-title v-text="item.title"></v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </v-navigation-drawer>
        <v-toolbar
                app
                :clipped-left="clipped"
        >
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
        </v-toolbar>
        <v-content>
            <router-view/>
        </v-content>

        <v-footer :fixed="fixed" app>
            <span>{{message}}</span>
            <v-spacer></v-spacer>
            <span>eos-commons.io</span>
        </v-footer>
    </v-app>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      clipped: true,
      drawer: true,
      fixed: false,
      items: [{
        icon: 'bubble_chart',
        title: 'Home',
        link: 'home'
      }, {
        icon: 'bubble_chart',
        title: 'Classes',
        link: 'classes'
      }, {
        icon: 'bubble_chart',
        title: 'Tree',
        link: 'tree'
      }, {
        icon: 'bubble_chart',
        title: 'Ipfs',
        link: 'ipfs'
      }, {
        icon: 'bubble_chart',
        title: 'Page',
        link: 'page'
      }]
    }
  },
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
