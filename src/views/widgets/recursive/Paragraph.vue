<template>
  <div>
    <div v-if="paragraphObj">
      <h1 v-if="headerLevel === 1">{{ paragraphObj.name }}</h1>
      <h2 v-else-if="headerLevel === 2">{{ paragraphObj.name }}</h2>
      <h3 v-else-if="headerLevel === 3">{{ paragraphObj.name }}</h3>
      <h4 v-else-if="headerLevel === 4">{{ paragraphObj.name }}</h4>
      <h5 v-else-if="headerLevel === 5">{{ paragraphObj.name }}</h5>
      <h6 v-else>{{ paragraphObj.name }}</h6>

      <div v-on:dblclick="editMode = true" v-if="!editMode" v-html="paragraphObj.description"></div>
	  <wysiwyg v-on:dblclick="editMode = false" v-if="editMode" v-model="paragraphObj.description"/>

      <div v-for="(subParId, key) in paragraphObj.subParagraphIds" v-bind:key="key">
        <ec-paragraph v-bind:headerLevel="headerLevel + 1" v-bind:subParagraphId="subParId"></ec-paragraph>
      </div>

    </div>
  </div>
</template>
<script>
export default {
  props: {
    headerLevel: Number,
    subParagraphId: String
  },
  data() {
    return {
	  paragraphObj: {},
	  editMode: false
    };
  },
  methods: {
    updateParagraph() {
      this.$store
        .dispatch("getCommonByKey", this.subParagraphId)
        .then(newData => {
          // console.log("data", newData);
          this.paragraphObj = Object.assign({}, newData); // Force reactive update
        });
    }
  },
  watch: {
	subParagraphId: {
		handler: "updateParagraph",
      	immediate: true
    }
  }
};
</script>
<style scoped>
@import "~vue-wysiwyg/dist/vueWysiwyg.css";
</style>