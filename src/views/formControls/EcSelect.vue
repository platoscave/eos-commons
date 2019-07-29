<template>
  <div
    id="outputClass"
    class="outputclass"
    :class="!property.readOnly ? 'updatable' :  ''"
    v-on:click="editMode = true"
    v-on:focusout="editMode = false"
  >
    <div v-if="property.readOnly || !editMode || items.length < 2">{{ value }}</div>
    <div ref="focusoutNode" v-else>
      <v-radio-group
        row
        v-if="items.length < 4"
        v-bind:value="value"
        v-on:input="$emit('input', $event)"
    v-on:focusout="$emit('focusout', $event)"
        autofocus
      >
        <div v-for="(item, idx) in items" v-bind:key="idx">
          <v-radio :label="item" :value="item" v-on:focusout="$emit('focusout', $event)"></v-radio>
        </div>
      </v-radio-group>
      <v-select
        v-else
        v-bind:value="value"
        v-bind:items="items"
        v-on:input="$emit('input', $event)"
        autofocus
      ></v-select>
    </div>
  </div>
</template>
<script>
export default {
  name: 'ec-select',
  props: {
    value: String,
    property: Object,
    items: Array
  },
  data () {
    return {
      editMode: false
    }
  }/* ,
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
}
</script>
