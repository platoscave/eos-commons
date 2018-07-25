<template>
    <div>
        <div v-for="widget in widgets">

            <!-- Document-->
            <div v-if="widget.displayType === 'Document'">
                <div>Widget {{ widget.displayType }}</div>
            </div>

            <!-- Tree-->
            <div v-if="widget.displayType === 'Tree'">
                <tree v-bind:level="level" v-bind:widget="widget"></tree>
            </div>

            <!-- Table -->
            <div v-if="widget.displayType === 'Table'">
                <div>Widget {{ widget.displayType }}</div>
            </div>

            <!-- 3dClassModel-->
            <div v-if="widget.displayType === '3D Class Model'">
                <webgl v-bind:level="level" v-bind:widget="widget"></webgl>
            </div>

            <!-- ProcessModel-->
            <div v-if="widget.displayType === 'Process Model'">
                <div>Widget {{ widget.displayType }}</div>
            </div>

            <!-- Form-->
            <div v-if="widget.displayType === 'Form'">
                <form v-bind:level="level" v-bind:widget="widget"></form>
            </div>

            <!-- HomePage-->
            <div v-if="widget.displayType === 'HomePage'">
                <div>Widget {{ widget.displayType }}</div>
            </div>
        </div>
    </div>
</template>

<script>
  import Tree from './Tree.vue'
  import WebGl from './WebGl.vue'

export default {
  components: {
    tree: Tree,
    webgl: WebGl
  },
  props: {
    level: Number,
    widgets: {
      type: Array,
      default: () => []
    }
  }
}
</script>
