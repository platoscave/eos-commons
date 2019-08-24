<template>
  <div
    class="outputclass"
    :class="!property.readOnly && items.length > 1 ? 'updatable' :  ''"
    @mouseenter="isEditing = true"
    @mouseleave="mouseLeave"
  >
    <!-- Read only-->
    <div v-if="property.readOnly || !isEditing || items.length < 2">{{ value }}</div>

    <!-- Less than 4: radio buttons-->
    <div v-else-if="items.length < 4">
      <v-radio-group v-bind:value="value" v-on:input="$emit('input', $event)" autofocus row>
        <div v-for="(item, idx) in items" v-bind:key="idx">
          <v-radio :label="item" :value="item" @click="$emit('input', item)"></v-radio>
        </div>
      </v-radio-group>
    </div>

    <!-- Otherwise: popup menu-->
    <v-menu v-else closeOnClick closeOnContentClick open-on-hover>
      <template v-slot:activator="{ on }">
        <div v-on="on">{{ value }}</div>
      </template>
      <v-list dense>
        <v-list-item-group v-on:update="$emit('input', $event)" v-bind:value="value">
          <v-list-item v-for="(value, i) in items" v-bind:key="i">
            <v-list-item-content @click="$emit('input', value)">
              <v-list-item-title v-html="value"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>

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
      isEditing: false
    };
  },
  methods: {
    mouseLeave: function(e) {
        // The popup menu does it's own mouseLeave. We must not interfere.
        if (this.property.readOnly || !this.isEditing || this.items.length < 4) this.isEditing = false;
    }
  }
};
</script>
