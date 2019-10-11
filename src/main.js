import '@babel/polyfill'
import Vue from 'vue'
import vuetify from '@/plugins/vuetify' // path to vuetify export
import App from './App.vue'
import router from './router'
import store from './store'
import VueLodash from 'vue-lodash'
import EcBsItems from './views/widgets/recursive/EcBsItems.vue'
import EcSubForm from './views/widgets/recursive/EcSubForm.vue'
import EcSelectControl from './views/formControls/EcSelectControl.vue'
import EcParagraph from './views/widgets/recursive/EcParagraph.vue'
import EcLayout from './views/EcLayout.vue'
import { sync } from 'vuex-router-sync'
import wysiwyg from 'vue-wysiwyg'


Vue.component('ec-bs-itemsx', EcBsItems)
Vue.component('ec-sub-form', EcSubForm)
Vue.component('ec-select-control', EcSelectControl)
Vue.component('ec-paragraph', EcParagraph)
Vue.component('ec-layout', EcLayout)

global.THREE = require('../node_modules/three/three.js')
global.OrbitControls = require('../node_modules/three/examples/js/controls/OrbitControls.js')

Vue.use(VueLodash)
Vue.use(wysiwyg, {})
Vue.config.productionTip = false

// allows us to watch the route in the store
sync(store, router)

new Vue({
    vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
