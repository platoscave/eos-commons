<template>
  <v-app>
    <div v-if="!loading" class="content-pane">
      <ec-layout v-bind:level="0"></ec-layout>
    </div>
    <div class="footer">
      <v-dialog v-model="dialog" width="350">
        <template v-slot:activator="{ on }">
          <v-icon class="left" v-on="on">settings</v-icon>
        </template>
        <v-card>
          <v-card-title>
            <span class="headline">Settings</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onEraseAllEos()">Erase all EOS</v-btn>
                </v-flex>
                <!-- <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onIndexedDBAllToEos()">IndexedDB all to EOS</v-btn>
                </v-flex> -->
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onStaticAllToEos()">Static all to EOS</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="addAccounts()">Add Test Accounts to EOS</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="addAgreement()">Add Test Agreement</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="bumpState()">Test Agreement Bump State</v-btn>
                </v-flex>
                <!-- <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onImportFromStatic()">Import From Static File</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onImportFromEos()">EOS to indexedDB</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onSaveDirtyToEos()">Save to EOS</v-btn>
                </v-flex> -->
                <v-flex xs12>
                  <v-btn
                    color="blue darken-1"
                    @click="onDownFromIndexeddb()"
                  >Download From IndexedDB</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onGenerateCpp()">Gennerate cpp</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="getAccountInfo()">Get Account Info</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="test()">Test</v-btn>
                </v-flex>
                <v-flex xs12>
                  <div>Random Key: {{ randomKey }}</div>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-select
        class="left toolbar-dropdown"
        single-line
        v-bind:items="networks"
        v-model="network"
        label="Network"
      ></v-select>
      <v-select
        class="left toolbar-dropdown"
        single-line
        v-bind:items="accounts"
        v-model="currentUserId"
        label="Account"
      ></v-select>
      <div class="right">eos-commons.io</div>
    </div>
    <v-snackbar v-model="snackbar" :color="color" :timeout="3000">
      {{ text }}
      <v-btn dark text @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import EcLayout from "./views/EcLayout.vue";

import IndexedDBApiService from "./services/IndexedDBApiService";
import GenerateCpp from "./services/GenerateCpp";
import EosApiService from "./services/EosApiService";
import testAccounts from "./config/testaccounts.js";
import networks from "./config/networks.js";

export default {
  components: {
    EcLayout
  },
  name: "App",
  data() {
    return {
      loading: true,
      dialog: false
    };
  },
  computed: {
    network: {
      get() {
        return this.$store.state.network;
      },
      set(value) {
        this.$store.commit("SET_NETWORK", value);
      }
    },
    currentUserId: {
      get() {
        return this.$store.state.currentUserId;
      },
      set(value) {
        this.$store.commit("SET_ACCOUNT", value);
      }
    },
    accounts: function() {
      return Object.keys(testAccounts);
    },
    networks: function() {
      return Object.keys(networks);
    },
    randomKey: function() {
      const characters = "abcdefghijklmnopqrstuvwxyz12345";
      let randomKey = "";
      for (let i = 0; i < 12; i++) {
        randomKey += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return randomKey;
    },
    snackbar: {
      get() {
        return this.$store.state.snackbar;
      },
      set(value) {
        this.$store.commit("SET_SNACKBAR", {
          snackbar: value,
          text: "",
          color: ""
        });
      }
    },
    text: function() {
      return this.$store.state.text;
    },
    color: function() {
      return this.$store.state.color;
    }
  },
  methods: {
    onImportFromStatic() {
      IndexedDBApiService.ImportFromStatic();
    },
    onImportFromEos() {
      EosApiService.ImportFromEos(this.$store);
    },
    onIndexedDBAllToEos() {
      EosApiService.IndexedDBAllToEos(this.$store);
    },
    onStaticAllToEos() {
      EosApiService.StaticAllToEos(this.$store);
    },
    onSaveDirtyToEos() {
      EosApiService.SaveDirtyToEos(this.$store);
    },
    onEraseAllEos() {
      EosApiService.EraseAllEos(this.$store);
    },
    async onDownFromIndexeddb() {
      // https://stackoverflow.com/questions/54793997/export-indexeddb-object-store-to-csv
      const data = await IndexedDBApiService.GetAll(this.$store);
      const jsonString = JSON.stringify(data, null, 2);
      const csv_mime_type = "text/json";
      const blob = new Blob([jsonString], { type: csv_mime_type });
      const anchor = document.createElement("a");
      anchor.setAttribute("download", "commons.json");
      const url = URL.createObjectURL(blob);
      anchor.setAttribute("href", url);
      anchor.click();
      URL.revokeObjectURL(url);
    },

    async onGenerateCpp() {
      const data = await GenerateCpp.GenerateCpp(this.$store);
      const csv_mime_type = "text/cpp";
      const blob = new Blob([data], { type: csv_mime_type });
      const anchor = document.createElement("a");
      anchor.setAttribute("download", "commons.cpp");
      const url = URL.createObjectURL(blob);
      anchor.setAttribute("href", url);
      anchor.click();
      URL.revokeObjectURL(url);
    },

    async addAccounts() {
      EosApiService.addAccounts(this.$store);
    },
    async getAccountInfo() {
      EosApiService.getAccountInfo(this.$store, "eoscommonsio");
    },
    async addAgreement() {
      EosApiService.addAgreement(this.$store);
    },
    async bumpState() {
      EosApiService.bumpAgreementState(this.$store);
    },
    async test() {
      EosApiService.test(this.$store);
    }
  },
  created() {
    IndexedDBApiService.ImportFromStatic(this.$store).then(res => {
      if (!this.$store.state.network) this.$store.commit("SET_NETWORK", "localhost");
      if (!this.$store.state.currentUserId) this.$store.commit("SET_ACCOUNT", "platoscave11");
      if (!window.location.hash) window.location.hash = "#/.kmghbh3qovtq"; // Demo Page
      this.loading = false;
    });
  }
};
</script>
<style scoped>
.content-pane {
  height: calc(100vh - 42px);
}
.footer {
  background: #212121;
  font-size: 16px;
  line-height: 42px;
  text-align: center;
}
.left {
  float: left;
  padding-left: 20px;
  line-height: 42px;
}
.right {
  float: right;
  padding-right: 20px;
}
.toolbar-dropdown {
  width: 120px;
}
.toolbar-dropdown >>> .v-text-field__details {
  display: none;
}
.toolbar-dropdown >>> .v-input__slot:before {
  display: none;
}
</style>
<style>
html {
  overflow-y: auto;
}
.full-height {
  height: 100%;
}
</style>
