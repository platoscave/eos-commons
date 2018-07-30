import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import VueLodash from 'vue-lodash'
import VJstree from 'vue-jstree'
import * as VueGL from 'vue-gl'
import { sync } from 'vuex-router-sync'

// Import WebGl component names dynamically since there are many
Object.keys(VueGL).forEach(name => {
  Vue.component(name, VueGL[name])
})
Vue.use(VueLodash)
Vue.config.productionTip = false

// allows us to watch the route in the store
sync(store, router)

new Vue({
  router,
  store,
  VJstree,
  render: h => h(App)
}).$mount('#app')
