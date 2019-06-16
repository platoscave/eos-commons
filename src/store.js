import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'
// import ApiService from './services/EosApiService'
import ApiService from './services/IndexedDBApiService'

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
    SET_CLASSES_LOADING(state) {
      state.loading = true
      state.message = 'loading...'
    },
    SET_CLASSES_SUCCESS(state, payload) {
      state.statusCode = payload.statusCode
      state.message = payload.message
      state.classes = payload.data
      state.loading = false
    },
    SET_CLASSES_FAILURE(state, payload) {
      state.statusCode = payload.statusCode
      state.message = payload.message
    },

    SET_PAGE_STATE2(state, payload) {
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
        if (!payload.nextLevel.selectedObjId) {
          if (payload.selectedObjId) payload.nextLevel.selectedObjId = payload.selectedObjId
          else payload.nextLevel.selectedObjId = state.levelIdsArr[payload.level].selectedObjId
        }
        store.commit('SET_PAGE_STATE2', payload.nextLevel)
      } else updateRoute(state)
    },

    SET_PAGE_STATE_FROM_ROUTE(state, payload) {
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

    SET_NODE_TOGGLE(state, payload) {
      if (payload.opened) state.isOpened[payload.key] = true
      else delete state.isOpened[payload.key]
    },

    SAVE(state, payload) {
      const getRandomKey = () => {
        // base32 encoded 64-bit integers. This means they are limited to the characters a-z, 1-5, and '.' for the first 12 characters. 
        // If there is a 13th character then it is restricted to the first 16 characters ('.' and a-p).
        var characters = 'abcdefghijklmnopqrstuvwxyz12345'
        var randomKey = ''
        for (var i = 0; i < 12; i++) {
          randomKey += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        return randomKey
      }
      console.log('random', getRandomKey())
      /* EosApiService.getCommonByKey('gzthjuyjca4z').then(obj => {
        console.log('obj', obj ) 
      }) */
      // return EosApiService.loadEos()
      // return EosApiService.eraseallCommon()
    }
  },
  actions: {
    getCommonByKey(store, key) {
      return ApiService.getCommonByKey(key)
    },

    query: async function (store, queryObj) {
      // Recursivly get an array of subclass keys
      const getSubclassKeys = async (classKey) => {
        let subClassArr = await ApiService.queryByIndex('parentId', classKey)
        let promisses = subClassArr.map(classObj => {
          return getSubclassKeys(classObj.key)
        })
        let subClassKeysArr = await Promise.all(promisses)
        let flattend = Vue._.flatten(subClassKeysArr)
        flattend.push(classKey)
        return flattend
      }

      let query = query = queryObj.query
      const where = query.where
      const from = query.from
      let resultsArr = []
      // TODO right now the where and from clauses are treated sepparatly. The where clause takes prekeyence
      // The should be combined
      if (where) {
        const docProp = where.docProp
        const operator = where.operator
        let value = where.value

        // Replace value with foreigne key
        if (value === '$fk') value = queryObj.currentObj.key

        // Replace value with currentObj.path
        else if (value.startsWith('#')) {
          const path = value.substr(1)
          value = Vue._.get(queryObj.currentObj, path)
        }
        if (!value) return []

        if (operator === 'eq') {
          if (docProp === '$key') {
            // Get single value based on key
            let result = await ApiService.getCommonByKey(value)
            return [result]
          } else resultsArr = await ApiService.queryByIndex(docProp, value)
        }

        else if (operator === 'in') {
          let prommisesArr = []
          if (!Array.isArray(value)) value = [value]
          value.forEach(key => {
            prommisesArr.push(ApiService.getCommonByKey(key))
          })
          resultsArr = await Promise.all(prommisesArr)
        }

        else throw new Error('Cannot query with ' + operator + ' operator yet')
      }
      else if (from) {
        // The from claus always refers to a class.
        // We need to get objects from classId class, and all of its subclasses
        // First, get an array of all subclasses
        let subClassKeysArr = await getSubclassKeys(from)
        // Collect all of the objects for these subclasses
        let promisses = subClassKeysArr.map(classKey => {
          return ApiService.queryByIndex('classId', classKey)
        })
        let subClassObjectsArr = await Promise.all(promisses)
        // Flatten array of arrays.
        resultsArr = Vue._.flatten(subClassObjectsArr)
      }

      // Sort the result, if needed
      if (queryObj.query.sortBy) {
        resultsArr.sort((a, b) => {
          if (a[queryObj.query.sortBy] && b[queryObj.query.sortBy]) {
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

    treeQueryArr(store, queryObj) {
      let promises = []
      queryObj.subqueryIds.forEach((subqueryId) => {
        promises.push(store.dispatch('treeQuery', {
          currentObj: queryObj.currentObj,
          subqueryIds: subqueryId,
          level: queryObj.level
        }))
      })
      return Promise.all(promises).then((values) => {
        return Vue._.union.apply(null, values)
      })
    },

    treeQuery: async function (store, queryObj) {

      // Get the default icon from the first ancestor class that has one
      const getIconFromClassById = async classId => {
        let classObj = await ApiService.getCommonByKey(classId)
        if (classObj.icon) return classObj.icon
        else if (classObj.parentId) return await getIconFromClassById(classObj.parentId)
        return '' // set to default icon
      }

      // Get the default pageId from the first ancestor class that has one
      const getPageIdFromClassById = async classId => {
        let classObj = await ApiService.getCommonByKey(classId)
        if (classObj.pageId) return classObj.pageId
        else if (classObj.parentId) return await getPageIdFromClassById(classObj.parentId)
        return '' // set to default pageId
      }

      // Execute the queryObj to see if there are any grandchildren
      // This feels a bit waistful 
      const getGrandChildrenLength = async queryObj => {
        let subqueryIdsArr = queryObj.subqueryIds
        if(!subqueryIdsArr) return true
        if(!Array.isArray(subqueryIdsArr)) subqueryIdsArr = [subqueryIdsArr]
        let grandChildrenPromises = subqueryIdsArr.map(async subqueryId => {
          let query = await ApiService.getCommonByKey(subqueryId)
          return await store.dispatch('query', { currentObj: queryObj.currentObj, query: query })
        })
        let grandChildrenArrArr =  await Promise.all(grandChildrenPromises)
        let grandChildrenArr = Vue._.union.apply(null, grandChildrenArrArr)
        return grandChildrenArr.length === 0
      }

      // Normalize the results so that they are suited for the tree
      const makeNodesFromResults = async (resultsArr, queryObj) => {

        let treeNodePromissesArr = resultsArr.map(async item => {
          let icon = queryObj.query.icon ? queryObj.query.icon : item.icon
          // Get the default icon from the class
          if (!icon) icon = await getIconFromClassById(item.classId ? item.classId : item.parentId)

          let pageId = queryObj.query.pageId ? queryObj.query.pageId : item.pageId
          // Get the default icon from the class          
          if (!pageId && item.classId) pageId = await getPageIdFromClassById(item.classId)

          const ids = store.state.levelIdsArr[queryObj.level + 1]
          const selected = ids ? ids.selectedObjId === item.key : false
          const grandChildrenQueryObj = { currentObj: item, subqueryIds: queryObj.query.subqueryIds }
          const opened = !!store.state.isOpened[item.key]
          const isLeaf = await getGrandChildrenLength(grandChildrenQueryObj)

          return {
            key: item.key,
            text: item.title ? item.title : item.name,
            Xdata: {
              queryArrObj: grandChildrenQueryObj,
              pageId: pageId,
              icon: icon
            },
            children: [{
              text: 'loading...',
              icon: '',
              value: 'Loading...',
              icon: '',
              opened: false,
              selected: false,
              disabled: true,
              loading: true,
              children: []
            }],
            isLeaf: isLeaf,
            opened: opened,
            // opened: false,
            selected: selected,
            loading: false
          }
        })

        let treeNodeArr = await Promise.all(treeNodePromissesArr)
        return treeNodeArr
      }
      // if (queryObj.fk === 'vzhw2vpaflmw') debugger

      // Get the query
      let query = await ApiService.getCommonByKey(queryObj.subqueryIds)

      // Execute the query
      let queryObj2 = { currentObj: queryObj.currentObj, query: query }
      let resultsArr = await store.dispatch('query', queryObj2)

      // Normalize the results
      let treeNodeArr = await makeNodesFromResults(resultsArr, queryObj2)

      return treeNodeArr

/*       // Prepoulate the grandchildren, so that we know if this is a leaf node.
      let grandchildrenPromises = treeNodeArr.map(async item => {
        // debugger
        if (!item.Xdata.queryArrObj.subqueryIds) return []
        let queryPromises = item.Xdata.queryArrObj.subqueryIds.map(async queryId => {
          // Get the query
          let query = await ApiService.getCommonByKey(queryId)
          // Get the nodes
          return await getTreeNodes({ currentObj: item.Xdata.queryArrObj.currentObj, query: query })
        })

        let grandchildrenNodesArrs = await Promise.all(queryPromises)
        let grandchildrenNodes = Vue._.union.apply(null, grandchildrenNodesArrs)

        item.children = grandchildrenNodes
        item.isLeaf = grandchildrenNodes.length === 0
        item.loading = false
        return item
      })

      let treeNodesWithGrandChildrem = await Promise.all(grandchildrenPromises)
      debugger
      return treeNodesWithGrandChildrem */
    },
    mergeAncestorClasses(store, classId) {
      return ApiService.getCommonByKey(classId).then((classObj) => {
        if (classObj.parentId) {
          return store.dispatch('mergeAncestorClasses', classObj.parentId).then((parentClassObj) => {
            return Vue._.merge(parentClassObj, classObj)
          })
        } else return classObj
      })
    },
    materializedView(store, viewId) {
      const smartMerge = (viewObj, classObj) => {
        if (!viewObj.properties) return
        Object.keys(viewObj.properties).forEach(propName => {
          // if(propName === 'query') debugger
          const classProp = classObj.properties[propName]
          if (classProp) {
            const viewProp = viewObj.properties[propName]
            Vue._.merge(viewProp, classProp, function (a, b) {
              if (_.isArray(a)) {
                return a.concat(b);
              }
              /*
              if (viewProp.maxLength && viewProp.maxLength > classProp.maxLength) viewProp.maxLength = classProp.maxLength
              if (viewProp.minLength && viewProp.minLength < classProp.minLength) viewProp.minLength = classProp.minLength
              if (viewProp.max && viewProp.max > classProp.max) viewProp.max = classProp.max
              if (viewProp.min && viewProp.min < classProp.min) viewProp.min = classProp.min
            */
            })
          }
        })
        if (classObj.definitions) viewObj.definitions = classObj.definitions
      }

      return ApiService.getCommonByKey(viewId).then((viewObj) => {
        const classId = Vue._.get(viewObj, 'query.from')
        if (classId && classId !== 'classes') {
          return store.dispatch('mergeAncestorClasses', classId).then((classObj) => {
            smartMerge(viewObj, classObj)
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
