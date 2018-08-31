<template>
    <div class="widget-container">
        <!--<v-container fluid>-->
            <!--<v-layout flex column>-->
        <template  class="widget-container" v-for="(widget, n) in widgets">

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
            <div  class="widget-container" v-if="widget.displayType === '3D Class Model'">
                <ec-classmodel class="widget-container" v-bind:level="level" v-bind:widget="widget"></ec-classmodel>
            </div>

            <!-- ProcessModel-->
            <div v-if="widget.displayType === 'Process Model'">
                <div>Widget {{ widget.displayType }}</div>
            </div>

            <!-- Form-->
            <div v-if="widget.displayType === 'Form'">
                <ec-form v-bind:level="level" v-bind:viewId="widget.viewId"></ec-form>
            </div>

            <!-- HomePage-->
            <div v-if="widget.displayType === 'HomePage'">
                <div>Widget {{ widget.displayType }}</div>
            </div>

        </template>
            <!--</v-layout>-->
        <!--</v-container>-->
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
<style scoped>
    .widget-container {
        /*position: absolute;*/
        height: 100%;
        width: 100%;
    }
    .xcontainer {
        padding: 0;
        margin: 0;
        max-width: none;
        overflow-y: auto
    }
</style>
