import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'
import EosApiService from './services/EosApiService'
import IndexedDBApiService from './services/IndexedDBApiService'

Vue.use(Vuex)

const updateRoute = (state) => {
  let newHash = ''
  for (let level = 0; level < state.levelIdsArr.length; level++) {
    let levelId = state.levelIdsArr[level]
    let levelArr = []
    levelArr.push(levelId.selectedObjId)
    levelArr.push(levelId.pageId)
    let selectedTab = Vue._.get(state, 'pageStates.' + levelId.pageId + '.selectedTab', 0)
    // if (state.pageStates[levelId.pageId].selectedTab) selectedTab = state.pageStates[levelId.pageId].selectedTab
    if (selectedTab) levelArr.push(selectedTab)
    else levelArr.push('')
    newHash = newHash + '/' + levelArr.join('.')
  }
  window.location.hash = newHash
}
const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [createPersistedState()],

  state: {
    commons: {}, // REMOVE
    classes: {}, // REMOVE
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

    SET_PAGE_STATE2 (state, payload) {
      /* let example = {
        level: 0,
        pageId: '',
        paneWidth: 400,
        selectedTab: 0,
        selectedObjId: '',
        nextLevel: {}
      } */
      if (payload.pageId) {
        let newPageState = { paneWidth: '400px', selectedTab: 0 }
        let pageState = {}
        if (payload.paneWidth) pageState.paneWidth = payload.paneWidth
        if (payload.selectedTab !== undefined) pageState.selectedTab = payload.selectedTab
        Vue._.merge(newPageState, state.pageStates[payload.pageId], pageState)
        Vue.set(state.pageStates, payload.pageId, newPageState)
      }

      if (payload.selectedTab) {
        const newLevelIdsArr = state.levelIdsArr.slice(0, payload.level + 1)
        Vue.set(state, 'levelIdsArr', newLevelIdsArr)
      }

      if (payload.level !== undefined) {
        let newIds = {}
        let ids = {}
        if (payload.pageId) ids.pageId = payload.pageId
        if (payload.selectedObjId) ids.selectedObjId = payload.selectedObjId
        Vue._.merge(newIds, state.levelIdsArr[payload.level], ids)
        Vue.set(state.levelIdsArr, payload.level, newIds)
      }

      if (payload.nextLevel) {
        payload.nextLevel.level = payload.level + 1
        store.commit('SET_PAGE_STATE2', payload.nextLevel)
      } else updateRoute(state)
    },

    SET_PAGE_STATE_FROM_ROUTE (state, payload) {
      let levelsArr = payload.split('/')
      levelsArr = levelsArr.slice(1)
      levelsArr.forEach((levelStr, level) => {
        let pageStateArr = levelStr.split('.')
        const pageId = pageStateArr[1]
        if (pageId) {
          Vue.set(state.levelIdsArr, level, {
            selectedObjId: pageStateArr[0],
            pageId: pageId
          })
          const newPageState = { paneWidth: '400px', selectedTab: 0 }
          const pageState = {
            selectedTab: pageStateArr[2] ? parseInt(pageStateArr[2]) : 0
          }
          state.pageStates[pageId] = Vue._.merge(newPageState, state.pageStates[pageId], pageState)
          Vue.set(state.pageStates, pageId, newPageState)
        }
      })
      // concatenate the original levelIdsArr
      state.levelIdsArr = state.levelIdsArr.splice(0, levelsArr.length)
    },

    SET_NODE_TOGGLE (state, payload) {
      if (payload.opened) state.isOpened[payload.key] = true
      else delete state.isOpened[payload.key]
    },

    SAVE (state, payload) {
      EosApiService.getCommonByKey('gzthjuyjca4z').then(obj => {
        console.log('obj', obj ) 
      })
      // return EosApiService.loadEos()
      // return EosApiService.eraseallCommon()
    }
  },
  actions: {
    getCommonByKey (store, key) {
      return EosApiService.getCommonByKey(key)
    },

    query: async function (store, queryObj) {
      // Recursivly get an array of subclass keys
      const getSubclassKeys = async (classKey) => {
        let subClassArr = await EosApiService.queryByIndex('parentId', classKey)
        let promisses = subClassArr.map(classObj => {
          return getSubclassKeys(classObj.key)
        })
        let subClassKeysArr = await Promise.all(promisses)
        let flattend = Vue._.flatten(subClassKeysArr)
        flattend.push(classKey)
        return flattend
      }

      const where = Vue._.get(queryObj, 'query.where')
      const from = Vue._.get(queryObj, 'query.from')
      let docProp, operator, value
      let resultsArr = []
      // TODO right now the where and from clauses are treated sepparatly. The where clause takes prekeyence
      // The should be combined
      if (where) {
        docProp = where.docProp
        operator = where.operator
        value = where.value
        // Replace vlaue with forigne key
        if (value === '$fk') value = queryObj.fk
        if (operator === 'eq') {
          if (docProp === '$key') {
            // Get single value based on key
            let result = await store.dispatch('getCommonByKey', value)
            return [result]
          } else {
            resultsArr = await EosApiService.queryByIndex(docProp, value)
          }
        } else throw new Error('Cannot query with ' + operator + 'operator yet')
      } else if (from) {
        // The from claus always refers to a class.
        // We need to get objects from classId class, and all of its subclasses
        // First, get an array of all subclasses
        let subClassKeysArr = await getSubclassKeys(from)
        // Collect all of the objects for these subclasses
        let promisses = subClassKeysArr.map(classKey => {
          return EosApiService.queryByIndex('classId', classKey)
        })
        let subClassObjectsArr = await Promise.all(promisses)
        // Flatten array of arrays.
        resultsArr = Vue._.flatten(subClassObjectsArr)
      }
      // Sort the result, if needed
      if (queryObj.query.sortBy) {
        resultsArr.sort((a, b) => {
          if(a[queryObj.query.sortBy] && b[queryObj.query.sortBy]) {
            let aa = a[queryObj.query.sortBy].toUpperCase()
            let bb = b[queryObj.query.sortBy].toUpperCase()
            if (aa > bb) return 1
            if (aa < bb) return -1
          }
          return 0
        })
      }
      return resultsArr
    },
    treeQueryArr (store, queryObj) {
      let promises = []
      queryObj.queryArr.forEach((query) => {
        promises.push(store.dispatch('treeQuery', {
          fk: queryObj.fk,
          query: query,
          queryNames: queryObj.queryNames,
          level: queryObj.level
        }))
      })
      return Promise.all(promises).then((values) => {
        return Vue._.union.apply(null, values)
      })
    },
    treeQuery: async function (store, queryObj) {
      const getIconFromClassById = (classId) => {
        return store.dispatch('getCommonByKey', classId).then(classObj => {
          if (classObj.icon) return classObj.icon
          else if (classObj.parentId) return getIconFromClassById(classObj.parentId)
          return '' // set to default icon
        })
      }
      const getChildQueryObj = (fk) => {
        let queryArr = []
        if (queryObj.query.join) {
          queryObj.query.join.forEach((query) => {
            // Query referenced by name
            if (query.queryByName) queryArr.push(queryObj.queryNames[query.queryByName])
            // Query as object
            else queryArr.push(query)
          })
        }
        return { fk: fk, queryArr: queryArr, queryNames: queryObj.queryNames, level: queryObj.level }
      }

      let resultsArr = await store.dispatch('query', queryObj)

      // Normalize the results so that they are suited for the tree
      let treeNodePromissesArr = resultsArr.map(async item => {
        let icon = queryObj.query.icon ? queryObj.query.icon : item.icon
        if (!icon) icon = await getIconFromClassById(item.classId)

        // Prepoulate the grandchildren, so that we know if this is a leaf node.
        // TODO find a way to do this async from the tree
        let childQueryArrObj = getChildQueryObj(item.key)
        let grandchildren = await store.dispatch('treeQueryArr', childQueryArrObj)

        const ids = store.state.levelIdsArr[queryObj.level + 1]
        const selected = ids ? ids.selectedObjId === item.key : false

        return {
          key: item.key,
          key: item.key,
          text: item.title ? item.title : item.name,
          data: {
            queryArrObj: childQueryArrObj,
            pageId: queryObj.query.pageId ? queryObj.query.pageId : item.pageId,
            icon: icon
          },
          children: grandchildren,
          isLeaf: grandchildren.length === 0,
          opened: !!store.state.isOpened[item.key],
          selected: selected
        }
      })

      let treeNodeArr = await Promise.all(treeNodePromissesArr)
      // console.log('done', queryObj.query, treeNodeArr)
      return treeNodeArr
    },
    mergeAncestorClasses (store, classId) {
      return store.dispatch('getCommonByKey', classId).then((classObj) => {
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
      return store.dispatch('getCommonByKey', viewId).then((viewObj) => {
        const classId = Vue._.get(viewObj, 'query.from')
        if (classId && classId !== 'classes') {
          return store.dispatch('mergeAncestorClasses', classId).then((classObj) => {
            smartMergeProperties(viewObj, classObj)
            return viewObj
          })
        } else return viewObj
      })
    }
  }
})
store.watch(state => state.route, (newPath, oldPath) => {
  store.commit('SET_PAGE_STATE_FROM_ROUTE', newPath.hash)
})
/*
        let keyMap = {}
        Object.keys(response.data).forEach(key => {
          let result = response.data[key]
          var characters = 'abcdefghijklmnopqrstuvwxyz12345'
          var randomKey = ''
          for ( var i = 0; i < 12; i++ ) {
            randomKey += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          keyMap[key] = randomKey
        })
        let stringData = JSON.stringify(response.data, null, 4)

        Object.keys(keyMap).forEach(key => {
          stringData = stringData.replace(new RegExp(key, 'g'), keyMap[key]);
        })
        console.log('keyMap', JSON.stringify(keyMap, null, 4))
        console.log('stringData', stringData)
 */
export default store
