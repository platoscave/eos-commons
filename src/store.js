import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    classes: {},
    objects: {},
    loading: false,
    statusCode: null,
    message: ''
  },
  getters: {
    getMessage: (state) => {
      return state.statusCode + ' ' + state.message
    },
    getClasses: state => {
      // return state.todos.filter(todo => todo.done)
      return state.classes
    },
    getClassById: (state) => (id) => {
      return state.classes.find(classObj => classObj.id === id)
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
    }
  }
})

store.dispatch('loadClasses')

export default store
