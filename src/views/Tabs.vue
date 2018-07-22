<template>
    <div  v-if="items.length">
        <v-tabs v-model="active">
            <v-tab v-for="(item, n) in items" :key="n" ripple>{{ item.title }}</v-tab>
            <v-tab-item v-for="(item, n) in items" :key="n">
                <div v-if="item.widgets">
                    <!-- This tab has widgets -->
                    {{ item.widgets }}
                    <widgets v-bind:level="level" v-bind:widgets="item.widgets"></widgets>
                </div>
                <div v-if="item.pageId">
                    <!-- This tab has a sub-page -->
                    {{ item.pageId }}
                    <layout v-bind:level="level+1"></layout>
                </div>
            </v-tab-item>
        </v-tabs>
    </div>
    <div v-else>
        <div v-if="items[0].widgets">
            <!-- This tab has widgets -->
            <widgets v-bind:level="level" v-bind:widgets="item.widgets"></widgets>
        </div>
        <div v-if="items[0].pageId">
            <!-- This tab has a sub-page -->
            <layout v-bind:level="level+1"></layout>
        </div>
    </div>

</template>

<script>
import Layout from './Layout.vue'
import Widgets from './Widgets.vue'

export default {
  name: 'tabs',
  components: {
    layout: Layout,
    widgets: Widgets
  },
  props: {
    level: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      items: [
        {
          title: 'First Item',
          text: 'This is the first text',
          id: 1,
          widgets: [ {
            displayType: 'HomePage',
            name: 'Home Page',
            viewId: '578921fe3c6d3cd598a5a3a4'
          } ]
        },
        {
          title: 'Second Item',
          text: 'This is the second text',
          id: 2,
          pageId: '575d4c3f2cf3d6dc3ed83150'
        },
        {
          title: 'Third Text',
          text: 'This is the third text',
          id: 3
        }
      ],
      active: null
    }
  },
  computed: {
    moreThanOneTab () {
      // return this.$store.getters.getMessage;
      return true
    },
    hasSubPage () {
      // return this.$store.getters.getMessage;
      return true
    }
  }
}
</script>
