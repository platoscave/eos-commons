<template>
    <div  v-if="{{moreThanOneTab}}">
        <v-tabs fixed centered>
            <v-tabs-bar class="cyan" dark>
                <v-tabs-slider class="yellow"></v-tabs-slider>
                <v-tabs-item
                        v-for="item in items"
                        :key="item.id"
                        :href="'#tab-' + item.id">
                    {{ item.title }}
                </v-tabs-item>
            </v-tabs-bar>
            <v-tabs-items>
                <v-tabs-content
                        v-for="item in items"
                        :key="item"
                        :id="'tab-' + item.id">
                    <v-card flat>
                        <v-card-text>{{ item.text }}</v-card-text>
                    </v-card>
                </v-tabs-content>
            </v-tabs-items>
        </v-tabs>
    </div>
    <div v-else>
        <div v-if="{{hasSubPage}}">
            <!-- This tab has a sub-page -->
            <layout level="[[level]]" page-id="[[tabs.0.pageId]]"></layout>
        </div>
        <div v-else>
            <!-- This tab has widgets -->
            <widgets level="[[level]]" widgets="[[tabs.0.widgets]]"></widgets>
        </div>
    </div>

</template>

<script>
import Layout from './Layout.vue'
import Widgets from './Widgets.vue'

export default {
  components: {
    widgets: Widgets
  },
  data () {
    return {
      items: [
        {
          title: 'First Item',
          text: 'This is the first text',
          id: 1
        },
        {
          title: 'Second Item',
          text: 'This is the second text',
          id: 2
        },
        {
          title: 'Third Text',
          text: 'This is the third text',
          id: 3
        }
      ]
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
