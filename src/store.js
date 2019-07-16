import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'
// import ApiService from './services/EosApiService'
import ApiService from './services/IndexedDBApiService'
import IpfsApiService from './services/IpfsApiService'

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
    account: '[not selected]',
    network: '[not selected]',
    levelIdsArr: [],
    pageStates: {},
    isOpened: {}
  },

  mutations: {
    SET_ACCOUNT (state, payload) {
		  state.account = payload
    },
    SET_NETWORK (state, payload) {
      state.network = payload
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
        if (!payload.nextLevel.selectedObjId) {
          if (payload.selectedObjId) payload.nextLevel.selectedObjId = payload.selectedObjId
          else payload.nextLevel.selectedObjId = state.levelIdsArr[payload.level].selectedObjId
        }
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
    }
  },
  actions: {
    getCommonByKey: async function (store, key) {
      return ApiService.getCommonByKey(key)
    },
    upsertCommon: async function (store, common) {
      return ApiService.upsertCommon(common)
    },
    eraseCommon: async function (store, key) {
      return ApiService.eraseCommon(key)
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
      // Recursivly get an array of subclasses
      const getSubclasses = async (classKey) => {
        const subclasses = async (parentClassKey) => {
          let classArr = await ApiService.queryByIndex('parentId', parentClassKey)
          let promisses = classArr.map(classObj => {
            return subclasses(classObj.key)
          })
          let subClassesArrArr = await Promise.all(promisses)
          // Flatten array of arrays.
          let subClassesArr = Vue._.flatten(subClassesArrArr)
          classArr = classArr.concat(subClassesArr)
          // console.log('classArr', parentClassKey, classArr)
          return classArr
        }
        let subClassesArr = await subclasses(classKey)
        let classObj = await ApiService.getCommonByKey(classKey)
        subClassesArr.push(classObj)
        // console.log('subClassesArr', subClassesArr)
        return subClassesArr // include the class we started out with
      }

      let query = queryObj.query
      // queryId takes precidence over query
      if (queryObj.queryId) query = await ApiService.getCommonByKey(queryObj.queryId)

      const where = query.where
      const from = query.from

      let resultsArr = []
      // TODO right now the where and from clauses are treated sepparatly. The where clause takes precedence
      // They should be combined
      if (where) {
        const docProp = where.docProp
        const operator = where.operator
        const mapValue = where.mapValue
        const valuePath = where.valuePath
        let value = where.value

        // if (value === '#nextstateIds') debugger
        // Replace value with foreigne key
        if (value === '$fk') value = queryObj.currentObj.key

        // Replace value with currentObj.valuePath
        if (valuePath) {
          let currentObj = queryObj.currentObj
          // If currentObj is a string, assume it's a key
          if (typeof currentObj === 'string') query = await ApiService.getCommonByKey(currentObj)
          value = Vue._.get(currentObj, valuePath)
        }

        if (mapValue && Array.isArray(value)) {
          value = value.map(valueObj => {
            return valueObj[mapValue]
          })
        }

        if (!value) {
          // console.error('Invalid value in: ', queryObj)
          return []
        }

        if (operator === 'eq') {
          if (docProp === 'key') {
            // Get single value based on key
            let result = await ApiService.getCommonByKey(value)
            return [result]
		  } else {
			  resultsArr = await ApiService.queryByIndex(docProp, value)
		  }
        } else if (operator === 'in') {
          let prommisesArr = []
          if (!Array.isArray(value)) value = [value]
          value.forEach(key => {
            if (key) prommisesArr.push(ApiService.getCommonByKey(key))
          })
          resultsArr = await Promise.all(prommisesArr)
        } else throw new Error('Cannot query with ' + operator + ' operator yet')
      } else if (from) {
        if (from === 'classes') {
          const rootClassId = 'gzthjuyjca4s'
          resultsArr = await getSubclasses(rootClassId)
        } else {
          // The from clause always refers to a class.
          // We need to get objects from classId class, and all of its subclasses
          // First, get an array of all subclasses
          let subClassArr = await getSubclasses(from)

          // let subClassKeysArr = await getSubclassKeys(from)
          // Collect all of the objects for these subclasses
          let promisses = subClassArr.map(classObj => {
            return ApiService.queryByIndex('classId', classObj.key)
          })
          let subClassObjectsArr = await Promise.all(promisses)
          // Flatten array of arrays.
          resultsArr = Vue._.flatten(subClassObjectsArr)
        }
      }

      // Sort the result, if needed
      if (query.sortBy) {
        resultsArr.sort((a, b) => {
          if (a[query.sortBy] && b[query.sortBy]) {
            let aa = a[query.sortBy].toUpperCase()
            let bb = b[query.sortBy].toUpperCase()
            if (aa > bb) return 1
            if (aa < bb) return -1
          }
          return 0
        })
      }

      return resultsArr
    },

    getTreeNodes: async function (store, queryObj) {
      // Recusivly get the default icon, from the first ancestor class that has one
      const getIconFromClassById = async classId => {
        let classObj = await ApiService.getCommonByKey(classId)
        if (classObj.icon) return classObj.icon
        else if (classObj.parentId) return await getIconFromClassById(classObj.parentId)
        return '' // set to default icon
      }

      // Recusivly get the default pageId, from the first ancestor class that has one
      const getPageIdFromClassById = async classId => {
        let classObj = await ApiService.getCommonByKey(classId)
        if (classObj.pageId) return classObj.pageId
        else if (classObj.parentId) return await getPageIdFromClassById(classObj.parentId)
        return '' // set to default pageId
      }

      // Execute the queryObj to see if there are any grandchildren
      // This feels a bit wasteful
      const getGrandChildrenLength = async queryObj => {
        let subQueryIdsArr = queryObj.subQueryIds
        if (!subQueryIdsArr) return true
        if (!Array.isArray(subQueryIdsArr)) subQueryIdsArr = [subQueryIdsArr]
        let grandChildrenPromises = subQueryIdsArr.map(async subqueryId => {
          let query = await ApiService.getCommonByKey(subqueryId)
          return await store.dispatch('query', { currentObj: queryObj.currentObj, query: query })
        })
        let grandChildrenArrArr = await Promise.all(grandChildrenPromises)
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
          // Get the default pageId from the class
          if (queryObj.query.name === 'Queries Query') debugger
          if (!pageId && item.classId) pageId = await getPageIdFromClassById(item.classId)
          const ids = store.state.levelIdsArr[queryObj.level + 1]
          const selected = ids ? ids.selectedObjId === item.key : false
          const grandChildrenQueryObj = { currentObj: item, subQueryIds: queryObj.query.subQueryIds }
          const opened = !!store.state.isOpened[item.key]
          const isLeaf = await getGrandChildrenLength(grandChildrenQueryObj)
          const children = [{
            text: 'loading...',
            icon: '',
            value: 'Loading...',
            icon: '',
            opened: false,
            selected: false,
            disabled: true,
            loading: true,
            children: []
          }]

          return {
            key: item.key,
            text: item.title ? item.title : item.name,
            Xdata: {
              queryArrObj: grandChildrenQueryObj,
              pageId: pageId,
              icon: icon
            },
            children: isLeaf ? [] : children,
            isLeaf: isLeaf,
            opened: opened,
            selected: selected,
            loading: false
          }
        })

        return await Promise.all(treeNodePromissesArr)
      }

      let subQueryIds = queryObj.subQueryIds
      // Make sure subQueryIds is an Array
      if (!Array.isArray(subQueryIds)) subQueryIds = [subQueryIds]

      let subQueryPromisses = subQueryIds.map(async queryId => {
        // Get the query
        let query = await ApiService.getCommonByKey(queryId)

        // Execute the query.
        let queryObj2 = { currentObj: queryObj.currentObj, query: query }
        let resultsArr = await store.dispatch('query', queryObj2)

        // Normalize the results
        let treeNodeArr = await makeNodesFromResults(resultsArr, queryObj2)

        return treeNodeArr
      })

      let resultsArrArr = await Promise.all(subQueryPromisses)
      return Vue._.union.apply(null, resultsArrArr)
    },

    materializedView: async function (store, viewId) {
      // Recusivly merge all the ancestor classes, starting with the root. Sub class properties take precedence over parent class
      const getMergeAncestorClasses = async classId => {
        let classObj = await ApiService.getCommonByKey(classId)
        if (classObj.parentId) {
          let parentClassObj = await getMergeAncestorClasses(classObj.parentId)
          return Vue._.merge(parentClassObj, classObj, (a, b) => {
            if (_.isArray(a)) return a.concat(b) // Arrays must be concanated instead of merged
          })
        } else return classObj
      }

      const smartMerge = (viewObj, classObj) => {
        if (viewObj.properties) {
          // The the order of viewObj properties is leading
          Object.keys(viewObj.properties).forEach(propName => {
            const classProp = classObj.properties[propName]
            if (classProp) {
              const viewProp = viewObj.properties[propName]
              Vue._.merge(viewProp, classProp, (a, b) => {
                if (_.isArray(a)) return a.concat(b) // Arrays must be concanated instead of merged
                /*
								if (viewProp.maxLength && viewProp.maxLength > classProp.maxLength) viewProp.maxLength = classProp.maxLength
								if (viewProp.minLength && viewProp.minLength < classProp.minLength) viewProp.minLength = classProp.minLength
								if (viewProp.max && viewProp.max > classProp.max) viewProp.max = classProp.max
								if (viewProp.min && viewProp.min < classProp.min) viewProp.min = classProp.min
								*/
              })
            }
          })
        }
        if (classObj.requrired) {
          if (viewObj.requrired) viewObj.required = viewObj.required.concat(classObj.requrired)
          else viewObj.required = classObj.requrired
        }
        if (classObj.definitions) viewObj.definitions = classObj.definitions
      }

      const viewObj = await ApiService.getCommonByKey(viewId)
      let classId = viewObj.baseClassId
      if (!classId) return viewObj
      const mergedAncestorClasses = await getMergeAncestorClasses(classId)
      // console.log('mergedAncestorClasses', mergedAncestorClasses)
      smartMerge(viewObj, mergedAncestorClasses)
      // console.log('smartMerge', viewObj)
      // if(viewId === 'sudhaobvgvq3') debugger
      return viewObj
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
