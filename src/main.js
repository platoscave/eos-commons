import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import VueLodash from 'vue-lodash'
import VJstree from 'vue-jstree'
import Layout from './views/Layout.vue'
import {Multipane, MultipaneResizer} from 'vue-multipane'
import Tabs from './views/Tabs.vue'
import Widgets from './views/Widgets.vue'
import WebGl from './views/WebGl.vue'
import Tree from './views/Tree.vue'
import * as VueGL from 'vue-gl'
import { sync } from 'vuex-router-sync'

Vue.component('layout', Layout);
Vue.component('multipane', Multipane);
Vue.component('multipane-resizer', MultipaneResizer);
Vue.component('tabs', Tabs);
Vue.component('widgets', Widgets);
Vue.component('tree', Tree);
Vue.component('v-jstree', VJstree);
Vue.component('webgl', WebGl);

// Import WebGl component names dynamically since there are many
Object.keys(VueGL).forEach(name => {
  Vue.component(name, VueGL[name])
});

Vue.use(VueLodash);
Vue.config.productionTip = false;

// allows us to watch the route in the store
sync(store, router);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
