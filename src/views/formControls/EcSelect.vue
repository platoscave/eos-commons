<template>
  <div
    id="outputClass"
    class="outputclass"
    :class="!property.readOnly && items.length > 1 ? 'updatable' :  ''"
    @mouseover="isEditing = true"
    @Xmouseleave="isEditing = false"
  >
    <!-- Read only-->
    <div v-if="property.readOnly || !isEditing || items.length < 2">{{ value }}</div>
  <div v-else>

    <!-- Less than 4, radio buttons-->
    <v-radio-group
      v-if="items.length < 4"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      autofocus
      row
    >
      <div v-for="(item, idx) in items" v-bind:key="idx">
        <v-radio :label="item" :value="item"></v-radio>
      </div>
    </v-radio-group>

    <!-- Otherwise, popup menu-->
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
  } /* ,
  mounted() {
      //let element = document.body.getElementById('focusoutNode')
      console.log(this.$refs.focusoutNode);

    this.$nextTick( () => {
      console.log(this.$refs.focusoutNode);
      this.$el.addEventListener("focusout", e => {
        this.editMode = false;
      });
    });
  } */
};
</script>
