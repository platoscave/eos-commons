import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import VueLodash from 'vue-lodash'
import Layout from './views/Layout.vue'
import { Multipane, MultipaneResizer } from 'vue-multipane'
import Tabs from './views/Tabs.vue'
import Widgets from './views/Widgets.vue'
import Form from './views/Form.vue'
import Form2 from './views/Form2.vue'
import SubForm from './views/widgets/SubForm.vue'
import Select from './views/widgets/Select.vue'
import ClassModel from './views/ClassModel.vue'
import ProcessModel from './views/ProcessModel.vue'
import WorkflowModel from './views/WorkflowModel.vue'
import Document from './views/Document.vue'
import BalanceSheet from './views/BalanceSheet.vue'
import BalanceSheetItems from './views/widgets/BalanceSheetItems.vue'
import { sync } from 'vuex-router-sync'
import wysiwyg from "vue-wysiwyg"


Vue.component('ec-layout', Layout)
Vue.component('multipane', Multipane)
Vue.component('multipane-resizer', MultipaneResizer)
Vue.component('ec-tabs', Tabs)
Vue.component('ec-widgets', Widgets)
Vue.component('ec-select', Select)
Vue.component('ec-form', Form)
Vue.component('ec-form2', Form2)
Vue.component('ec-sub-form', SubForm)
Vue.component('ec-class-model', ClassModel)
Vue.component('ec-process-model', ProcessModel)
Vue.component('ec-workflow-model', WorkflowModel)
Vue.component('ec-document', Document)
Vue.component('ec-balance-sheet', BalanceSheet)
Vue.component('ec-bsitems', BalanceSheetItems)

global.THREE = require('../node_modules/three/three.js')
global.OrbitControls = require('../node_modules/three/examples/js/controls/OrbitControls.js')

Vue.use(VueLodash)
Vue.use(wysiwyg, {})
Vue.config.productionTip = false

// allows us to watch the route in the store
sync(store, router)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
