<template>
    <div class="full-height">
        <!--<v-container fluid>-->
            <!--<v-layout flex column>-->
        <div  class="full-height" v-for="(widget, key) in widgets " v-bind:key="key"  >
                <!-- Document-->
                <div class="full-height" v-if="widget.displayType === 'Document'">
                    <ec-document class="ec-container" v-bind:level="level"></ec-document>
                </div>

                <!-- HTML Page-->
                <div class="full-height" v-if="widget.displayType === 'HTMLPage'">
                    <ec-html-page class="ec-container" v-bind:level="level"></ec-html-page>
                </div>

                <!-- Balance Sheet-->
                <div class="full-height" v-if="widget.displayType === 'Balance Sheet'">
                    <ec-balance-sheet class="ec-container" v-bind:level="level" v-bind:viewId="widget.viewId"></ec-balance-sheet>
                </div>

                <!-- Tree-->
                <div class="full-height" v-if="widget.displayType === 'Tree'">
                    <ec-tree class="ec-container" v-bind:level="level" v-bind:viewId="widget.viewId"></ec-tree>
                </div>

                <!-- Table -->
                <div class="full-height" v-if="widget.displayType === 'Table'">
                     <ec-table class="ec-container" v-bind:level="level" v-bind:viewId="widget.viewId"></ec-table>
               </div>

                <!-- 3dClassModel-->
                <div class="full-height" v-if="widget.displayType === '3D Class Model'">
                    <ec-class-model class="ec-container" v-bind:level="level" v-bind:viewId="widget.viewId"></ec-class-model>
                </div>

                <!-- ProcessModel-->
                <div class="full-height" v-if="widget.displayType === 'Process Model'">
                    <ec-process-model class="ec-container" v-bind:level="level" v-bind:viewId="widget.viewId"></ec-process-model>
                </div>

                <!-- WorkflowModel-->
                <div class="full-height" v-if="widget.displayType === 'Workflow Model'">
                    <ec-workflow-model class="ec-container" v-bind:level="level" v-bind:viewId="widget.viewId"></ec-workflow-model>
                </div>

                <!-- Form-->
                <div class="full-height" v-if="widget.displayType === 'Form'">
                    <ec-form class="ec-container" v-bind:level="level" v-bind:viewId="widget.viewId" v-bind:editMode="editMode"></ec-form>
                    <v-btn class="button-bottom" absolute dark fab bottom right color="pink" @click="editMode = !editMode">
                        <v-icon v-if="editMode">done</v-icon>
                        <v-icon v-else>edit</v-icon>
                    </v-btn>
                </div>

                <!-- HomePage-->
                <div v-if="widget.displayType === 'HomePage'">
                    <div>Widget {{ widget.displayType }}</div>
                </div>
        </div>
            <!--</v-layout>-->
        <!--</v-container>-->
    </div>
</template>

<script>

export default {
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
    .full-height {
        width: 100%;
    }
    .button-bottom {
        bottom: 10px;
        right: 30px;
    }
    .ec-container {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: 0;
        border: 0;
        padding: 0;
        overflow: auto;
    }
</style>
