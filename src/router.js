import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Tree from './views/Tree.vue'
import Ipfs from './views/Ipfs.vue'
import Classes from './views/Classes.vue'
import Page from './views/Page.vue'
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
      path: '/tree',
      name: 'tree',
      component: Tree
    },
    {
      path: '/ipfs',
      name: 'ipfs',
      component: Ipfs
    },
    {
      path: '/classes',
      name: 'Classes',
      component: Classes
    },
    {
      path: '/page',
      name: 'Page',
      component: Page
    },
    {
      path: '/webgl',
      name: 'WebGl',
      component: WebGl
    }
  ]
})
