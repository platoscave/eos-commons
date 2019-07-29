<template>
  <div>
    <v-container>
      <!-- For each of the properties in schema -->
      <div class="rowPadding" v-for="(property, propName) in properties" v-bind:key="propName">
        <!-- Start owr layout. v-flex must be immidiate child-->
        <v-layout justify-start row wrap>
          <!-- Label: If we are in edit mode or, there is data for this property -->
          <v-flex class="label" xs12 md2 v-if="editMode || value[propName]">
            <div>{{ property.title }}</div>
          </v-flex>

          <!-- Value: If we are in edit mode or, there is data for this property -->
          <v-flex xs12 md10 v-if="editMode || value[propName]">
            <ec-select-control
              v-model="value[propName]"
              v-bind:property="property"
              v-on:button-click="$parent.$emit('button-click', $event)"
            ></ec-select-control>
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </div>
</template>
<script>
/* Must be global */
/* import EcSelectControl from '../../formControls/EcSelectControl.vue' */

export default {
  name: 'ec-sub-form',
  props: {
    editMode: Boolean,
    properties: Object,
    definitions: Object,
    required: Array,
    value: Object
  }
}
</script>
<style scoped>
.rowPadding {
  padding-bottom: 16px;
}
</style>
