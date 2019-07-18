<template>
  <div class="outputclass" :class="!property.readOnly ? 'updatable' :  ''">
    <div
      v-if="property.readOnly || !editMode || items.length < 2"
      v-on:click="editMode = !editMode"
    >{{ value }}</div>
    <div v-else >
      <v-radio-group row
        v-if="items.length < 4"
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
        v-on:blur="editMode = !editMode"
      >
        <div v-for="(item, idx) in items" v-bind:key="idx">
          <v-radio :label="item" :value="item"></v-radio>
        </div>
      </v-radio-group>
      <v-select
        v-else
        v-bind:value="value"
        v-bind:items="items"
        v-on:input="$emit('input', $event)"
        v-on:blur="editMode = !editMode"
      ></v-select>
    </div>
  </div>
</template>
<script>
export default {
  name: "ec-select",
  props: {
    value: String,
    property: Object,
    items: Array
  },

  data() {
    return {
      editMode: false
    };
  }
};
</script>