import '@babel/polyfill'
import Vue from 'vue'
import vuetify from '@/plugins/vuetify' // path to vuetify export
import App from './App.vue'
import router from './router'
import store from './store'
import VueLodash from 'vue-lodash'
import Layout from './views/Layout.vue'
import Tabs from './views/Tabs.vue'
import Widgets from './views/Widgets.vue'
import Form from './views/widgets/Form.vue'
import ClassModel from './views/widgets/ClassModel.vue'
import ProcessModel from './views/widgets/ProcessModel.vue'
import WorkflowModel from './views/widgets/WorkflowModel.vue'
import Document from './views/widgets/Document.vue'
import HTMLPage from './views/widgets/HTMLPage.vue'
import BalanceSheet from './views/widgets/BalanceSheet.vue'
import Tree from './views/widgets/Tree.vue'
import Table from './views/widgets/Table.vue'
import BsItems from './views/widgets/recursive/BsItems.vue'
import SubForm from './views/widgets/recursive/SubForm.vue'
import EcSelectControl from './views/formControls/EcSelectControl.vue'

import Paragraph from './views/widgets/recursive/Paragraph.vue'
import { sync } from 'vuex-router-sync'
import wysiwyg from 'vue-wysiwyg'

Vue.component('ec-layout', Layout)
Vue.component('ec-tabs', Tabs)
Vue.component('ec-widgets', Widgets)
Vue.component('ec-form', Form)
Vue.component('ec-bs-items', BsItems)
Vue.component('ec-sub-form', SubForm)
Vue.component('ec-select-control', EcSelectControl)

Vue.component('ec-class-model', ClassModel)
Vue.component('ec-process-model', ProcessModel)
Vue.component('ec-workflow-model', WorkflowModel)
Vue.component('ec-document', Document)
Vue.component('ec-html-page', HTMLPage)
Vue.component('ec-paragraph', Paragraph)
Vue.component('ec-balance-sheet', BalanceSheet)
Vue.component('ec-tree', Tree)
Vue.component('ec-table', Table)

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
