import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import VueLodash from 'vue-lodash'
import VJstree from 'vue-jstree'
import * as VueGL from 'vue-gl'

Object.keys(VueGL).forEach(name => {
  Vue.component(name, VueGL[name])
})
Vue.use(VueLodash)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  VJstree,
  render: h => h(App)
}).$mount('#app')
