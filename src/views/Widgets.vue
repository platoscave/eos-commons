<template>
    <div>
        <div v-for="widget in widgets">

            <!-- Document-->
            <div v-if="widget.displayType === 'Document'">
                <div>Widget {{ widget.displayType }}</div>
            </div>

            <!-- Tree-->
            <div v-if="widget.displayType === 'Tree'">
                <ec-tree v-bind:level="level" v-bind:widget="widget"></ec-tree>
            </div>

            <!-- Table -->
            <div v-if="widget.displayType === 'Table'">
                <div>Widget {{ widget.displayType }}</div>
            </div>

            <!-- 3dClassModel-->
            <div v-if="widget.displayType === '3D Class Model'">
                <ec-webgl v-bind:level="level" v-bind:widget="widget"></ec-webgl>
            </div>

            <!-- ProcessModel-->
            <div v-if="widget.displayType === 'Process Model'">
                <div>Widget {{ widget.displayType }}</div>
            </div>

            <!-- Form-->
            <div v-if="widget.displayType === 'Form'">
                <ec-form v-bind:level="level" v-bind:widget="widget"></ec-form>
            </div>

            <!-- HomePage-->
            <div v-if="widget.displayType === 'HomePage'">
                <div>Widget {{ widget.displayType }}</div>
            </div>
        </div>
    </div>
</template>

<script>
  import WebGl from './WebGl.vue'
  import Tree from './Tree.vue'
  import Form from './Form.vue'

  export default {
    components: {
      'ec-webgl': WebGl,
      'ec-tree': Tree,
      'ec-form': Form
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
