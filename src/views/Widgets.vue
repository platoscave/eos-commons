<template>
  <div class="full-height">
    <!--if there is just one widget then that widget gets the full height.
            If there is more than one widget, then they are placed underneath each other 
            and takeup whatever space they need. If you have a widget that needs the full height,
            make sure it's the only only one. Either way, this div gets overflow auto-->
    <div
      v-bind:class="['overflow-auto', widgets.length === 1 ? 'full-height' : '']"
      v-for="(widget, key) in widgets "
      v-bind:key="key"
    >
      <!-- Document-->
      <div class="full-height" v-if="widget.displayType === 'Document'">
        <ec-document v-bind:level="level"></ec-document>
      </div>

      <!-- HTML Page-->
      <div class="full-height" v-if="widget.displayType === 'HTML Page'">
        <ec-html-page v-bind:level="level"></ec-html-page>
      </div>

      <!-- Balance Sheet-->
      <div class="full-height" v-if="widget.displayType === 'Balance Sheet'">
        <ec-balance-sheet v-bind:level="level" v-bind:viewId="widget.viewId"></ec-balance-sheet>
      </div>

      <!-- Tree-->
      <div class="full-height" v-if="widget.displayType === 'Tree'">
        <ec-tree v-bind:level="level" v-bind:viewId="widget.viewId"></ec-tree>
      </div>

      <!-- Table -->
      <div class="full-height" v-if="widget.displayType === 'Table'">
        <ec-table v-bind:level="level" v-bind:viewId="widget.viewId"></ec-table>
      </div>

      <!-- 3dClassModel-->
      <div class="full-height" v-if="widget.displayType === '3D Class Model'">
        <ec-class-model v-bind:level="level" v-bind:viewId="widget.viewId"></ec-class-model>
      </div>

      <!-- ProcessModel-->
      <div class="full-height" v-if="widget.displayType === 'Process Model'">
        <ec-process-model v-bind:level="level" v-bind:viewId="widget.viewId"></ec-process-model>
      </div>

      <!-- WorkflowModel-->
      <div class="full-height" v-if="widget.displayType === 'Workflow Model'">
        <ec-workflow-model v-bind:level="level" v-bind:viewId="widget.viewId"></ec-workflow-model>
      </div>

      <!-- Form-->
      <div class="full-height" v-if="widget.displayType === 'Form'">
        <ec-form
          v-bind:level="level"
          v-bind:viewId="widget.viewId"
          v-bind:editMode="editMode"
        ></ec-form>
        <v-btn
          class="button-bottom"
          absolute
          dark
          fab
          bottom
          right
          color="pink"
          @click="editMode = !editMode"
        >
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
  data() {
    return {
      editMode: false
    };
  }
};
</script>
<style scoped>
.button-bottom {
  bottom: 10px;
  right: 30px;
}
.overflow-auto {
  overflow: auto;
}
</style>
