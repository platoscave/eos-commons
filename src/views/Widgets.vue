<template>
    <div class="widget-container">
        <!--<v-container fluid>-->
            <!--<v-layout flex column>-->
        <template  class="widget-container" v-for="(widget) in widgets">
            <!-- Get rid of linting error
            <div v-bind:key="widget">-->
                <!-- Document-->
                <div v-if="widget.displayType === 'Document'">
                    <div>Widget {{ widget.displayType }}</div>
                </div>

                <!-- Tree-->
                <div v-if="widget.displayType === 'Tree'">
                    <ec-tree v-bind:level="level" v-bind:viewId="widget.viewId"></ec-tree>
                </div>

                <!-- Table -->
                <div v-if="widget.displayType === 'Table'">
                    <div>Widget {{ widget.displayType }}</div>
                </div>

                <!-- 3dClassModel-->
                <div  class="widget-container" v-if="widget.displayType === '3D Class Model'">
                    <ec-class-model class="widget-container" v-bind:level="level" v-bind:viewId="widget.viewId"></ec-class-model>
                </div>

                <!-- ProcessModel-->
                <div v-if="widget.displayType === 'Process Model'">
                    <ec-process-model class="widget-container" v-bind:level="level" v-bind:viewId="widget.viewId"></ec-process-model>
                </div>

                <!-- Form-->
                <div v-if="widget.displayType === 'Form'">
                    <ec-form v-bind:level="level" v-bind:viewId="widget.viewId" v-bind:editMode="editMode"></ec-form>
                    <v-btn absolute dark fab bottom right color="pink" @click="editMode = !editMode">
                        <template v-if="editMode">
                            <v-icon>done</v-icon>
                        </template>
                        <template v-else>
                            <v-icon>edit</v-icon>
                        </template>
                    </v-btn>
                </div>

                <!-- HomePage-->
                <div v-if="widget.displayType === 'HomePage'">
                    <div>Widget {{ widget.displayType }}</div>
                </div>
            <!--</div>-->
        </template>
            <!--</v-layout>-->
        <!--</v-container>-->
    </div>
</template>
<script src="../node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js"></script>
<script src="../node_modules/@ckeditor/ckeditor5-vue/dist/ckeditor.js"></script>
<script>
import Tree from './Tree.vue'
import Form from './Form.vue'

export default {
  components: {
    'ec-tree': Tree,
    'ec-form': Form
  },
  props: {
    level: Number,
    widgets: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      editMode: false
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
