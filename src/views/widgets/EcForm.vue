<template>
  <!-- Wait for dataObj and viewObj to arrive -->
  <div v-if="viewObj && dataObj">
    <div>{{viewId}} {{viewObj.name}}</div>
    <ec-sub-form
      v-bind:showAllFields="true"
      v-model="dataObj"
      v-bind:properties="viewObj.properties"
      v-bind:definitions="viewObj.definitions"
      v-bind:currentObjId="dataObj.key"
    ></ec-sub-form>
  </div>
</template>
<script>
export default {
  props: {
    level: Number,
    viewId: String,
    showAllFields: Boolean
  },
  data: function() {
    return {
      viewObj: {},
      dataObj: {},
      disableStoreData: true
    };
  },
  methods: {
    storeData(newData) {
      if (this.disableStoreData) return;
      const removeEmpty = obj => {
        Object.keys(obj).forEach(key => {
          let value = obj[key];
          if (
            value == null ||
            value === "" ||
            (typeof value === "array" && value.length === 0)
          )
            console.log("delete: ", key, value);
          if (value && typeof value === "object") removeEmpty(value);
          else if (
            value == null ||
            value === "" ||
            (typeof value === "array" && value.length === 0)
          )
            delete obj[key]; // delete
        });
      };
      removeEmpty(newData);
      this.$store.dispatch("upsertCommon", newData);
    },

    async refresh() {
      let selectedObjId;
      if (
        this.$store.state.levelIdsArr[this.level] &&
        this.$store.state.levelIdsArr[this.level].selectedObjId
      )
        selectedObjId = this.$store.state.levelIdsArr[this.level].selectedObjId;
      if (!selectedObjId) return;
      this.disableStoreData = true;

      // get the selectedObj
      let newData = await this.$store.dispatch("getCommonByKey", selectedObjId);

      if (newData.classId === "pylvseoljret") {
        // Views
        this.$store
          .dispatch("getMaterializedView", selectedObjId)
          .then(materializedView => {
            this.dataObj = Object.assign({}, materializedView); // Force reactive update
          });
      } else {
        this.dataObj = Object.assign({}, newData); // Force reactive update
      }
      this.$nextTick(() => {
        // we must do this in nexttick because the watch comes afterward
        this.disableStoreData = false;
      });
    }
  },

  created: async function() {

    // Get the view for this component
    this.viewObj = await this.$store.dispatch(
      "getMaterializedView",
      this.viewId
    )

    this.refresh()

    // watch the selected obj change
    this.$store.watch(
      state => state.levelIdsArr[this.level].selectedObjId,
      this.refresh
    );

    const debounceRefresh = Vue._.debounce(this.refresh, 500);
  
    // watch for update
    this.$store.watch(
      state => state.snackbar, newValue => {
          if(newValue) debounceRefresh()
      }
    );

    // watch the current user
    this.$store.watch(state => state.currentUserId, this.refresh);

  },

  watch: {
    dataObj: {
      handler: "storeData",
      deep: true
    }
  }
};
</script>
<style>
/* Global form styles */
.label {
  padding: 10px;
  font-size: 16px;
  margin-top: 4px;
}
.outputclass {
  background-color: #ffffff0d;
  padding: 10px;
  font-size: 16px;
  /* line-height: 42px; */
  min-height: 46px;
  border-radius: 5px;
}
.updatable {
  border-style: solid;
  border-color: blue;
  border-width: 1px;
}
/* for some reason tab items got a background color in veutify 2.0 */
.v-tabs-items {
  background-color: transparent !important;
}
.v-text-field {
  padding-top: 0px;
  margin-top: 0px;
}
/* keep the menu from taking upspace when its not active */
.v-menu--inline {
  display: none;
}
.v-input__slot {
  margin-bottom: 0 !important;
}
/* get rid of message under input fields */
.v-messages {
  display: none;
}
/* for the radio buttons */
.v-input--selection-controls {
  margin-top: 0;
  padding-top: 0;
}
/* remove padding from text fields */
.v-text-field {
  padding: 0;
}
/*  */
.v-text-field > .v-input__control > .v-input__slot:before {
  border-style: none;
}
.v-text-field > .v-input__control > .v-input__slot:after {
  border-style: none;
}
</style>
