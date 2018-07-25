import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Ipfs from './views/Ipfs.vue'
import WebGl from './views/WebGl.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
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
