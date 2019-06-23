<template>
  <div>
    <div>{{viewId}}</div>
    <!-- Wait for data and schema to arrive -->
    <v-sub-form v-if="schema && data"></v-sub-form>
  </div>
</template>
<script>
import EosApiService from "../services/EosApiService";

export default {
  props: {
    level: Number,
    viewId: String,
    editMode: Boolean,
  },
  data() {
    return {
      schema: {},
      data: {}
	  }
  },
  methods: {
    storeData(newData) {
      console.log("Data Change: ", newData);
    }
  },
  created() {
      this.$store.watch(
        state => state.levelIdsArr[this.level].selectedObjId,
        newVal => {
          // console.log('selectedObjId Changed!', newVal)
          if (!newVal) return;
          this.$store.dispatch("getCommonByKey", newVal).then(data => {
            console.log("data", data);
            this.data = Object.assign({}, data); // Force reactive update
          })
        },
        { immediate: true }
      )

    if (!this.parentSchema && this.viewId) {
      this.$store.dispatch("materializedView", this.viewId).then(view => {
        console.log("view", view)
        this.schema = view
        if (view.rpc) {
          EosApiService.getAccountInfo("eoscommonsio").then(info => {
            this.data = info;
          })
        }
      });
    }
  },
  watch: {
    data: {
      handler: "storeData",
      immediate: true,
      deep: true
    }
  }
};
</script>
<style scoped>
.label {
  padding: 10px;
  font-size: 16px;
  line-height: 42px;
}
.readonlyoutput {
  background-color: #ffffff0d;
  padding: 10px;
  font-size: 16px;
  line-height: 42px;
  border-radius: 5px;
  margin: 4px;
}

.v-input__slot {
  background-color: green !important;
  min-height: 24px;
}

input:read-only {
  background-color: blue;
}

.p {
  margin-bottom: 0;
}

.description {
  color: lightseagreen;
}

.monoSpaced {
  font-family: monospace, monospace;
  white-space: pre;
}

.input-alpha input {
  border: solid 1px #e6e6ea;
  /* height: 48px; */
  width: 100%;
  padding: 16px;
  border-radius: 2px;
  box-shadow: inset 0px 0px 0px 0px #f00;
  -webkit-appearance: none;
  -moz-appearance: none;
  font-size: 14px;
  transition: all 0.1s ease-in-out;
}

.input-alpha input:focus {
  outline: 0;
  border: 1px solid #00f;
}

.input-alpha input:focus + label {
  color: blue;
}

.input-alpha input:valid,
.input-alpha input:-webkit-autofill {
  padding: 26px 32px 10px 16px;
}

.input-alpha input:valid + label,
.input-alpha input:-webkit-autofill + label {
  top: 7px;
  transform: scale(0.8);
}
.input-alpha > .v-input__control {
  min-height: 24px;
}
.v-input__slot {
  border-width: 1px;
  border-color: darkblue;
}
.theme--dark .v-text-field--outline > .v-input__control > .v-input__slot {
  border-width: 1px;
  border-color: red;
}
</style>
