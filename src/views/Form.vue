<template>
    <div v-if="view">
        <v-container fluid grid-list-md>
            <v-layout row wrap>
                <v-flex
                        xs12
                        md6
                        lg3
                        v-for="n in 12"
                        :key="n"
                >
                    <v-card flat tile>
                        <v-card-media
                                :src="`https://api.adorable.io/avatars/285/abott@adorable.png`"
                                height="400px"
                        >
                        </v-card-media>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    </div>
</template>
<script>
  // import JsonEditor from 'vue-json-ui-editor'
  // JsonEditor.setComponent('form', 'v-form')
  export default {
    components: {
    },
    props: {
      level: Number,
      widget: Object
    },
    data() {
      return {
        view: null,
        // data
        model: {
          name: 'Yourtion',
        },
      }
    },
    methods: {
      submit(_e) {
        alert(JSON.stringify(this.model));
      },
      reset() {
        this.$refs.JsonEditor.reset();
      },
    },
    created() {
      this.$store.dispatch('materializedView', this.widget.viewId).then((view) => {
        console.log('view', view)
        this.view = view
      })
    }
  }
</script>
