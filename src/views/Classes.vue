<template>
    <v-container fluid>
        <v-slide-y-transition mode="out-in">
            <v-layout column align-center>
                <td>
                    <v-edit-dialog
                            :return-value="props.item.title"
                            lazy
                    >
                        {{ props.item.title }}
                        <v-text-field
                                slot="input"
                                label="Enter New Course Title"
                                :value="props.item.title"
                                @input="onUpdateCourse({ id: props.item.id, title: props.item.title})"
                                single-line
                                counter
                                @keyup.enter="onUpdateCourse({ id: props.item.id, title: props.item.title})"
                        ></v-text-field>
                    </v-edit-dialog>
                </td>
            </v-layout>
        </v-slide-y-transition>
    </v-container>
</template>
<script>
export default {
  data () {
    return {
      headers: '',
      props: 'props'
    }
  },
  computed: {
    classes () {
      return this.$store.getters.classes
    }
  },
  methods: {
    onUpdateClasses (itemToUpdate) {
      this.$store.dispatch('updateClasses', itemToUpdate)
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h1, h2 {
        font-weight: normal;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        display: inline-block;
        margin: 0 10px;
    }

    a {
        color: #42b983;
    }
</style>
