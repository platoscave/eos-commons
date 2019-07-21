<template>
  <v-app dark>
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
                  <v-select v-bind:items="networks" v-model="network" label="Network"></v-select>
                </v-flex>
                <v-flex xs12>
                  <v-select v-bind:items="accounts" v-model="account" label="Account*"></v-select>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onImportFromStatic()">Import From Static File</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onImportFromEos()">Import From EOS</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onSaveDirtyToEos()">Save to EOS</v-btn>
                </v-flex>
                <v-flex xs12>
                  <v-btn color="blue darken-1" @click="onEraseAllEos()">Erase all EOS</v-btn>
                </v-flex>
                <v-flex xs12>
					<!-- https://stackoverflow.com/questions/54793997/export-indexeddb-object-store-to-csv -->
                  <v-btn
                    color="blue darken-1"
                    @click="onDownFromIndexeddb()"
                  >Download From IndexedDB</v-btn>
                </v-flex>
                <v-flex xs12>
                  <div>Random Key: {{ randomKey }}</div>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="dialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- <v-select class="left" single-line v-bind:items="networks" v-model="network" label="Network"></v-select> -->
      <div class="left">{{network}}</div>
      <div class="left">{{account}}</div>
      <div class="right">eos-commons.io</div>
    </div>
    <v-snackbar v-model="snackbar" :color="color" :timeout="3000">
      {{ text }}
      <v-btn dark flat @click="snackbar = false">Close</v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import IndexedDBApiService from './services/IndexedDBApiService'
import EosApiService from './services/EosApiService'
import testAccounts from './config/testaccounts.js'
import networks from './config/networks.js'

export default {
  name: 'App',
  data () {
    return {
      loading: true,
      dialog: false,
      snackbar: false,
      text: '',
      color: ''
    }
  },
  computed: {
    network: {
      get () {
        return this.$store.state.network
      },
      set (value) {
        this.$store.commit('SET_NETWORK', value)
      }
    },
    account: {
      get () {
        return this.$store.state.account
      },
      set (value) {
        this.$store.commit('SET_ACCOUNT', value)
      }
    },
    accounts: function () {
      return Object.keys(testAccounts)
    },
    networks: function () {
      return Object.keys(networks)
    },
    randomKey: function () {
      var characters = 'abcdefghijklmnopqrstuvwxyz12345'
      var randomKey = ''
      for (var i = 0; i < 12; i++) {
        randomKey += characters.charAt(
          Math.floor(Math.random() * characters.length)
        )
      }
      return randomKey
    }
  },
  methods: {
    onImportFromStatic () {
      IndexedDBApiService.ImportFromIndexedDB()
        .then(result => {
          this.dialog = false
          this.color = 'success'
          this.text = 'Loaded from static file'
          this.snackbar = true
        })
        .catch(error => {
          this.dialog = false
          this.color = 'error'
          this.text = error
          this.snackbar = true
        })
    },
    onImportFromEos () {
      EosApiService.ImportFromEos()
        .then(result => {
          this.dialog = false
          this.color = 'success'
          this.text = 'Loaded from EOS'
          this.snackbar = true
        })
        .catch(error => {
          this.dialog = false
          this.color = 'error'
          this.text = error
          this.snackbar = true
        })
    },
    onSaveDirtyToEos () {
      EosApiService.SaveDirtyToEos()
        .then(result => {
          this.dialog = false
          this.color = 'success'
          this.text = 'Updates have been saved to EOS'
          this.snackbar = true
        })
        .catch(error => {
          this.dialog = false
          this.color = 'error'
          this.text = error
          this.snackbar = true
        })
    },
    onEraseAllEos () {
      EosApiService.EraseAllEos()
        .then(result => {
          this.dialog = false
          this.color = 'success'
          this.text = 'Erased all EOS'
          this.snackbar = true
        })
        .catch(error => {
          this.dialog = false
          this.color = 'error'
          this.text = error
          this.snackbar = true
        })
    },
    onDownFromIndexeddb () {}
  },
  created () {
    IndexedDBApiService.ImportFromIndexedDB().then(res => {
      this.$store.commit('SET_NETWORK', 'localhost')
      this.$store.commit('SET_ACCOUNT', 'platoscave11')
      if (!window.location.hash) window.location.hash = '#/.kmghbh3qovtq' // Demo Page
      this.loading = false
    })
  }
}
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
</style>
<style>
html {
  overflow-y: auto;
}
</style>
