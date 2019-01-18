import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)
const IPFS = require('ipfs-api')
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' })

const updateRoute = (state) => {
  let newRoute = ''
  for (let level = 1; level < state.levelIdsArr.length; level++) {
    let levelId = state.levelIdsArr[level]
    let levelArr = []
    levelArr.push(levelId.selectedObjId)
    levelArr.push(levelId.pageId)
    levelArr.push(state.pageStates[levelId.pageId].selectedTab)
    newRoute = newRoute + '/' + levelArr.join('.')
  }
  window.location.hash = newRoute
}
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [createPersistedState()],

  state: {
    commons: {},
    classes: {},
    loading: false,
    statusCode: null,
    message: '',
    levelIdsArr: [],
    pageStates: {},
    isOpened: {}
  },
  getters: {
    getMessage: (state) => {
      return state.statusCode + ' ' + state.message
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

    SET_LEVEL_IDS (state, payload) {
      Vue.set(state.levelIdsArr, payload.level, payload.ids)
      updateRoute(state)
    },

    SET_PAGE_STATE (state, payload) {
      const defaultPageState = { paneWidth: '400px', selectedTab: 0, selectedWidget: 0 }
      state.pageStates = Vue._.merge(defaultPageState, state.pageStates, payload)
      // Vue.set(state.pageStates, Object.keys(payload)[0], pageState[Object.keys(payload)[0]])
      updateRoute(state)
    },

    SET_PAGE_STATE_FROM_ROUTE (state, payload) {
      let levelsArr = payload.split('/')
      levelsArr = levelsArr.slice(1)
      levelsArr.forEach((levelStr, level) => {
        let pageStateArr = levelStr.split('.')
        const pageId = pageStateArr[1]
        if (pageId) {
          Vue.set(state.levelIdsArr, level + 1, {
            selectedObjId: pageStateArr[0],
            pageId: pageId
          })
          const defaultPageState = { paneWidth: '400px', selectedTab: 0, selectedWidget: 0 }
          const newPageState = {
            selectedTab: pageStateArr[2] ? parseInt(pageStateArr[2]) : 0,
            selectedWidget: pageStateArr[3] ? parseInt(pageStateArr[3]) : 0
          }
          state.pageStates[pageId] = Vue._.merge(defaultPageState, state.pageStates[pageId], newPageState)
        }
      })
      // concatenate the original levelIdsArr
      state.levelIdsArr = state.levelIdsArr.splice(0, levelsArr.length + 1)
    },

    SET_NODE_TOGGLE (state, payload) {
      if (payload.opened) state.isOpened[payload.id] = true
      else delete state.isOpened[payload.id]
    },

    SAVE (state, payload) {
      const updateHash = (newVal, oldVal) => {
        for (let key in state.classes) {
          let obj = state.classes[key]
          if (obj.parentId === oldVal) {
            let newObj = Vue._.cloneDeep(obj)
            newObj.parentId = newVal
            let objStr = JSON.stringify(state.classes[key])
            ipfs.files.add(objStr, {'onlyHash': true}).then((response) => {
              let hash = response[0].hash
              console.log('Hash from IPFS: ' + hash)
              state.commons[hash] = rooObj
              this.updateHash(hash, key)
            })
          }
        }
      }
      let rooObj = JSON.stringify(state.classes['56f86c6a5dde184ccfb9fc6a'])
      console.log('rooObj', rooObj)
      let buf = Buffer.from(rooObj, 'utf8')
      ipfs.files.add(buf, {'onlyHash': true}).then((response) => {
        let hash = response[0].hash
        console.log('Hash from IPFS: ' + hash)
        state.commons[hash] = rooObj
        updateHash(hash, '56f86c6a5dde184ccfb9fc6a')
      })
    }
  },
  actions: {
    loadCommon (store, id) {
      return new Promise((resolve, reject) => {
        if (store.state.classes[id]) {
          let common = Vue._.cloneDeep(store.state.classes[id])
          common.id = id
          resolve(common)
        } else {
          this.$http('ipfs.io/ipfs/' + id).then(response => {
            this.store.state[id] = response.data
            resolve(Vue._.cloneDeep(response.data))
          }, error => {
            reject(error)
          })
        }
      })
    },
    queryArrObj (store, queryObj) {
      let promises = []
      queryObj.queryArr.forEach((query) => {
        promises.push(store.dispatch('query', {fk: queryObj.fk, query: query, queryNames: queryObj.queryNames, level: queryObj.level}))
      })
      return Promise.all(promises).then((values) => {
        return Vue._.union.apply(null, values)
      })
    },
    query: function (store, queryObj) {
      // Traverse class hierarchy, find nearest icon
      const getIconFromClassById = (classId) => {
        const classObj = store.state.classes[classId]
        if (classObj.icon) return classObj.icon
        else if (classObj.parentId) return getIconFromClassById(classObj.parentId)
        return ''
      }
      // Run the query, return a results object
      const getResultsObj = (queryObj) => {
        let resultsObj = {}
        const docProp = Vue._.get(queryObj, 'query.where.docProp')
        const operator = Vue._.get(queryObj, 'query.where.operator')
        let value = Vue._.get(queryObj, 'query.where.value')
        if (value === '$parentNode.$key') value = queryObj.fk
        if (docProp === '$key' && operator === 'eq') resultsObj[value] = store.state.classes[value]
        else {
          resultsObj = Vue._.pickBy(store.state.classes, function (item, key) {
            if (operator === 'eq') return item[docProp] === value
            if (operator === 'lt') return item[docProp] < value
            if (operator === 'gt') return item[docProp] > value
          })
        }
        return resultsObj
      }
      let resultsObj = getResultsObj(queryObj)

      // Normalize the results so that they are suited for the tree
      let resultsArr = []
      Object.keys(resultsObj).forEach(key => {
        let result
        const item = resultsObj[key]
        // Create a query array for the children, based on join predicate
        let queryArr = []
        if (queryObj.query.join) {
          queryObj.query.join.forEach((query) => {
            // Query referenced by name
            if (query.queryByName) queryArr.push(queryObj.queryNames[query.queryByName])
            // Query as object
            else queryArr.push(query)
          })
        }

        // The tree node result
        const ids = store.state.levelIdsArr[queryObj.level + 1]
        const selected = ids ? ids.selectedObjId === key : false
        let icon = queryObj.query.icon ? queryObj.query.icon : item.icon
        if (!icon) icon = getIconFromClassById(item.classId)
        result = {
          id: key,
          text: item.title ? item.title : item.name,
          data: {
            queryArr: queryArr,
            queryNames: queryObj.queryNames,
            level: queryObj.level,
            item: item,
            pageId: queryObj.query.pageId ? queryObj.query.pageId : item.pageId,
            icon: icon
          },
          isLeaf: false,
          opened: !!store.state.isOpened[key],
          selected: selected
        }

        // Find out if the node is a leaf by running the child queries
        result.isLeaf = !queryArr.some((query) => {
          let obj = getResultsObj({fk: key, query: query})
          return Object.keys(obj).length > 0
        })

        resultsArr.push(result)
      })

      // console.log('QUERY', queryObj)
      // console.log('RESULTS', resultsArr)

      return resultsArr
    },
    mergeAncestorClasses (store, classId) {
      return store.dispatch('loadCommon', classId).then((classObj) => {
        if (classObj.parentId) {
          return store.dispatch('mergeAncestorClasses', classObj.parentId).then((parentClassObj) => {
            return Vue._.merge(parentClassObj, classObj)
          })
        } else return classObj
      })
    },
    materializedView (store, viewId) {
      const smartMergeProperties = (viewObj, classObj) => {
        if (!viewObj.properties) return
        Object.keys(viewObj.properties).forEach(propName => {
          const classProp = classObj.properties[propName]
          if (classProp) {
            const viewProp = viewObj.properties[propName]
            if (classProp.type) viewProp.type = classProp.type
            if (classProp.additionalProperties) viewProp.additionalProperties = classProp.additionalProperties
            if (!viewProp.title && classProp.title) viewProp.title = classProp.title
            if (!viewProp.media && classProp.media) viewProp.media = classProp.media
            if (!viewProp.default && classProp.default) viewProp.default = classProp.default
            if (!viewProp.readOnly && classProp.readOnly) viewProp.readOnly = classProp.readOnly
            if (!viewProp.enum && classProp.enum) viewProp.enum = classProp.enum
            if (!viewProp.pattern && classProp.pattern) viewProp.pattern = classProp.pattern
            if (!viewProp.query && classProp.query) viewProp.query = classProp.query
            if (!viewProp.items && classProp.items) viewProp.items = classProp.items
            if (viewProp.maxLength && viewProp.maxLength > classProp.maxLength) viewProp.maxLength = classProp.maxLength
            if (viewProp.minLength && viewProp.minLength < classProp.minLength) viewProp.minLength = classProp.minLength
            if (viewProp.max && viewProp.max > classProp.max) viewProp.max = classProp.max
            if (viewProp.min && viewProp.min < classProp.min) viewProp.min = classProp.min
            // Smart merge sub-properties recursively, if needed
            if (viewProp.items && classProp.items) smartMergeProperties(viewProp.items, classProp.items)
            if (viewProp.properties && classProp.properties) smartMergeProperties(viewProp, classProp)
          }
        })
        viewObj.required = Vue._.union(viewObj.required, classObj.required)
        viewObj.classIcon = classObj.icon
      }
      return store.dispatch('loadCommon', viewId).then((viewObj) => {
        const classId = Vue._.get(viewObj, 'query.from')
        if (classId && classId !== 'classes') {
          return store.dispatch('mergeAncestorClasses', classId).then((classObj) => {
            smartMergeProperties(viewObj, classObj)
            return viewObj
          })
        } else return viewObj
      })
    },
    loadClasses (store) {
      store.commit('SET_CLASSES_LOADING', { loading: true })
      return axios('classes.json', {headers: {'Content-Type': 'application/json; charset=UTF-8'}, data: {}})
        .then(response => {
          store.commit('SET_CLASSES_SUCCESS', {
            statusCode: response.status,
            message: response.statusText,
            data: response.data
          })
          return true
        })
        .catch(error => {
          store.commit('SET_CLASSES_FAILURE', {
            statusCode: error.status,
            message: error.statusText
          })
          return false
        })
    }
  },
  methods: {

  }
})
store.watch(state => state.route, (newPath, oldPath) => {
  store.commit('SET_PAGE_STATE_FROM_ROUTE', newPath.hash)
})

// store.dispatch('loadClasses')

export default store
