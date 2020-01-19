<template>
  <div>
    <!-- Dialog to add new record -->
    <v-dialog v-if="addDialogViewObj && addRecordAllowed" v-model="dialog" width="500">
      <template v-slot:activator="{ on }">
        <v-btn v-on="on" color="blue darken-1" single-line>{{property.title}}</v-btn>
      </template>
      <v-card>
        <v-card-title>{{this.addDialogViewObj.name}}</v-card-title>
        <ec-sub-form
          v-bind:showAllFields="true"
          v-model="newObj"
          v-bind:properties="addDialogViewObj.properties"
          v-bind:currentObjId="currentObjId"
          v-bind:alwaysEditMode="true"
        ></ec-sub-form>
        <div class="buttonPadding">
          <v-btn v-on:click="takeAction" color="blue darken-1" single-line>Send Transaction</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
export default {
  name: "ec-button",
  props: {
    property: Object,
    currentObjId: String
  },

  data() {
    return {
      dialog: false,
      newObj: {},
      addRecordAllowed: true,
      addDialogViewObj: {}
    };
  },
  methods: {
    takeAction: async function(action) {
      this.dialog = false;
      if (this.property.action === "addAgreement") {

        const key = await this.$store.dispatch("addAgreement", this.newObj);

      } else if (this.property.action === "sendTransaction") {

        this.newObj.agreementId = this.currentObjId;
        const key = await this.$store.dispatch("takeAction", this.newObj);
        
      }
    }
  },
  created: async function() {
    if (this.property.addDialogViewId) {
      this.addDialogViewObj = await this.$store.dispatch(
        "getMaterializedView",
        this.property.addDialogViewId
      );
      // Prep processId
      // TODO
        this.newObj.agreementProcessId = this.property.agreementProcessId;
        this.newObj.sellerProcessId = this.property.sellerProcessId;
      
    }
  }
};
</script>
<style scoped>
.buttonPadding {
  padding: 12px;
}
</style>
