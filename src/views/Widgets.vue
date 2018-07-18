<template>
    <div is="dom-repeat" items="{{widgets}}" as="widget">

        <!-- Document-->
        <div v-if="{{displayType === 'Document'}}">
            <div>Widget {{widget.displayType}}</div>
        </div>

        <!-- Tree-->
        <div v-if="{{displayType === 'Tree'}}">
            <nq-tree level="{{level}}" view-id="{{widget.viewId}}" doc-id="{{computeDocId(level, route}}"></nq-tree>
            <!-- <nq-tree2 level="{{level}}" view-id="{{widget.viewId}}" doc-id="{{computeDocId(level, route}}"></nq-tree2>-->
        </div>

        <!-- Table -->
        <div v-if="{{displayType === 'Table'}}">
            <div>Widget {{widget.displayType}}</div>
        </div>

        <!-- 3dClassModel-->
        <div v-if="{{displayType === '3D Class Model'}}">
            <nq-threejs-viewport level="{{level}}" view-id="{{widget.viewId}}" doc-id="{{computeDocId(level, route}}"></nq-threejs-viewport>
        </div>

        <!-- ProcessModel-->
        <div v-if="{{displayType === 'Process Model'}}">
            <div>Widget {{widget.displayType}}</div>
        </div>

        <!-- Form-->
        <div v-if="{{displayType === 'Form'}}">
            <nq-form level="{{level}}" view-id="{{widget.viewId}}" doc-id="{{computeDocId(level, route}}"></nq-form>
        </div>

        <!-- HomePage-->
        <div v-if="{{displayType === 'HomePage'}}">
            <nq-home level="{{level}}" view-id="{{widget.viewId}}" doc-id="{{computeDocId(level, route}}"></nq-home>
        </div>
    </div>
</template>

<script>
import Document from './Document.vue'
import Tree from './Tree.vue'

export default {
  components: {
    widgets: Document
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
