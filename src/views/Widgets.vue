<template>
    <div>
    <div v-for="widget in widgets">

        <!-- Document-->
        <div v-if="widget.displayType === 'Document'">
            <div>Widget {{ widget.displayType }}</div>
        </div>

        <!-- Tree-->
        <div v-if="widget.displayType === 'Tree'">
            <nq-tree v-bind:level="level" v-bind:view-id="widget.viewId""></nq-tree>
            <!-- <nq-tree2 level="level" view-id="widget.viewId" doc-id="computeDocId(level, route"></nq-tree2>-->
        </div>

        <!-- Table -->
        <div v-if="widget.displayType === 'Table'">
            <div>Widget {{ widget.displayType }}</div>
        </div>

        <!-- 3dClassModel-->
        <div v-if="widget.displayType === '3D Class Model'">
            <nq-threejs-viewport v-bind:level="level" v-bind:view-id="widget.viewId"></nq-threejs-viewport>
        </div>

        <!-- ProcessModel-->
        <div v-if="widget.displayType === 'Process Model'">
            <div>Widget {{ widget.displayType }}</div>
        </div>

        <!-- Form-->
        <div v-if="widget.displayType === 'Form'">
            <nq-form v-bind:level="level" v-bind:view-id="widget.viewId"></nq-form>
        </div>

        <!-- HomePage-->
        <div v-if="widget.displayType === 'HomePage'">
            <div>Widget {{ widget.displayType }}</div>
            <!--<nq-home v-bind:level="level" v-bind:view-id="widget.viewId"></nq-home>-->
        </div>
    </div>
    </div>
</template>

<script>
import Tree from './Tree.vue'

export default {
  components: {
    widgets: Document
  },
  props: {
    level: {
      type: Number,
      default: 0
    },
    widgets: {
      type: Array,
      default: []
    }
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
