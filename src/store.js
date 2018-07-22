import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',

  state: {
    classes: {},
    objects: {},
    loading: false,
    statusCode: null,
    message: '',
    pageStates: {},
    pageStateExp: {
      'xxxxxxxxxxxxxxxxx': {
        pageLoaded: false,
        selectedTab: 0,
        tabs: [
          [
            {
              viewId: '',
              viewLoaded: false,
              selectedObjId: '',
              selectedObjLoaded: false,
              selectedTab: 0
            }
          ]
        ]
      }
    }
  },
  getters: {
    getMessage: (state) => {
      return state.statusCode + ' ' + state.message
    },
    getClasses: state => {
      // return state.todos.filter(todo => todo.done)
      return state.classes
    },
    getObjByIdx: (state) => (id) => {
      return state.classes.find(obj => obj.id === id)
    },
    getObjById: (state) => (id) => {
      return state.classes[id]
    },
    getPageLoaded: (state) => (id) => {
      return Vue._.get('state.pageStates[id].pageLoaded')
    },
    getMaterializedView: (store) => (id) => {
      return this.materializedView(id)
    }
  },
  mutations: {
    SET_CLASSES_LOADING (state) {
      state.loading = true
      state.message = 'loading...'
    },
    SET_CLASSES_SUCCESS (state, payload) {
      state.statusCode = payload.statusCode
      state.message = payload.message
      state.classes = payload.data
      state.loading = false
    },
    SET_CLASSES_FAILURE (state, payload) {
      state.statusCode = payload.statusCode
      state.message = payload.message
    },

    SET_PAGE_LOADING (state, payload) {
      state.message = 'loading...'
      state.pageStates = Vue._.merge(state.pageStates, payload)
    },
    SET_PAGE_SUCCESS (state, payload) {
      state.message = 'ok'
      state.pageStates = Vue._.merge(state.pageStates, payload)
    },
    SET_STATE_FAILURE (state, payload) {
      state.message = 'Failed to load page'
    }
  },
  actions: {
    loadClasses (store) {
      store.commit('SET_CLASSES_LOADING', { loading: true })
      return axios('classes.json')
        .then(response => {
          store.commit('SET_CLASSES_SUCCESS', {
            statusCode: response.status,
            message: response.statusText,
            data: response.data
          })
        })
        .catch(error => {
          store.commit('SET_CLASSES_FAILURE', {
            statusCode: error.status,
            message: error.statusText
          })
        })
    },
    loadPage (store, id) {
      return new Promise((resolve, reject) => {
        let pageState = store.state.pageStates[id]
        if (!pageState) {
          store.commit('SET_PAGE_LOADING', {
            [id]: {
              pageLoaded: false,
              selectedTab: 0,
              tabs: []
            }
          })
        }

        let page = store.state.classes[id]
        if (page) {
          store.commit('SET_PAGE_SUCCESS', {[id]: {pageLoaded: true}})
          resolve(page)
        } else {
          store.dispatch('loadCommon').then((response) => {
            store.commit('SET_PAGE_SUCCESS', {[id]: {pageLoaded: true}})
            resolve(response.data)
          }).error((error) => {
            store.commit('SET_PAGE_ERROR')
            reject(error)
          })
        }
      })
    },
    loadCommon (store, id) {
      return new Promise((resolve, reject) => {
        if (store.state.classes[id]) resolve(store.state.classes[id])
        else {
          this.$http('ipfs.io/ipfs/' + id).then(response => {
            this.store.state[id] = response.data
            resolve(response.data)
          }, error => {
            reject(error)
          })
        }
      })
    },
    materializedView (store, viewId) {
      return store.dispatch('loadCommon', viewId).then((viewObj) => {
        if (viewObj.classId) {
          return store.dispatch('mergeAncestorClasses', viewObj.classId).then((classObj) => {
            const mergedView = Vue._.merge({}, viewObj, classObj)
            Object.keys(mergedView.properties).forEach(propName => {
              if (!viewObj.properties[propName]) delete mergedView.properties[propName]
            })
            return mergedView
          })
        } else return viewObj
      })
    },
    mergeAncestorClasses (store, classId) {
      return store.dispatch('loadCommon', classId).then((classObj) => {
        if (classObj.parentId) {
          return store.dispatch('mergeAncestorClasses', classObj.parentId).then((parentClassObj) => {
            return Vue._.merge({}, parentClassObj, classObj)
          })
        } else return classObj
      })
    }
  }
})

// store.dispatch('loadClasses')

export default store
