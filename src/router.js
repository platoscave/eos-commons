import Vue from 'vue'
import Router from 'vue-router'
import Ipfs from './views/Ipfs.vue'
import WebGl from './views/WebGl.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/ipfs',
      name: 'ipfs',
      component: Ipfs
    },
    {
      path: '/webgl',
      name: 'WebGl',
      component: WebGl
    }
  ]
})
