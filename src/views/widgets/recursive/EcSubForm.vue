<template>
  <div>
    <v-container>
      <!-- For each of the properties in schema -->
      <div v-for="(property, propName) in properties" v-bind:key="propName">
        <!-- Start owr layout. v-flex must be immidiate child! Why doen't anyone tell you these things?-->
        <v-layout justify-start row wrap>
          <!-- Label: If we are in edit mode or, there is data for this property -->
          <v-flex class="label" xs12 md2 v-if="showAllFields || value[propName]">
            <div v-if="property.type !== 'button'">{{ property.title }}</div>
          </v-flex>

          <!-- Value: If we are in edit mode or, there is data for this property -->
          <!-- ec-query-select needs currentObjId -->
          <v-flex xs12 md10 v-if="showAllFields || value[propName]">
            <ec-select-control  class="rowPadding"
              v-model="value[propName]"
              v-bind:alwaysEditMode="alwaysEditMode"
              v-bind:showAllFields="showAllFields"
              v-bind:property="property"
              v-bind:definitions="definitions"
              v-bind:currentObjId="currentObjId ? currentObjId : value.key"
              v-on:button-click="$emit('button-click', $event)"
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
      showAllFields: Boolean,
    alwaysEditMode: Boolean,
    properties: Object,
    definitions: Object,
    required: Array,
    value: Object,
    currentObjId: String
  },
  computed: {
      showRow: function() {
          //showAllFields || value[propName]
          return true
      }
  }
}
</script>
<style scoped>
.rowPadding {
  padding-bottom: 16px;
}
.container {
    padding: 12px
}
</style>
