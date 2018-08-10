import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import VueLodash from 'vue-lodash'
import Layout from './views/Layout.vue'
import {Multipane, MultipaneResizer} from 'vue-multipane'
import Tabs from './views/Tabs.vue'
import Widgets from './views/Widgets.vue'
import Form from './views/Form.vue'
import * as VueGL from 'vue-gl'
import { sync } from 'vuex-router-sync'

Vue.component('ec-layout', Layout)
Vue.component('multipane', Multipane)
Vue.component('multipane-resizer', MultipaneResizer)
Vue.component('ec-tabs', Tabs)
Vue.component('ec-widgets', Widgets)
Vue.component('ec-form', Form)

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
  render: h => h(App)
}).$mount('#app')
