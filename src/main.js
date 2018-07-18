import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import VJstree from 'vue-jstree'
/* import Multipane from 'vue-multipane'
import MultipaneResizer from 'vue-multipaneresizer'
import { Multipane, MultipaneResizer } from 'vue-multipane' */

Vue.config.productionTip = false

new Vue({
  router,
  store,
  VJstree,
  render: h => h(App)
}).$mount('#app')
