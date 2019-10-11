import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import createPersistedState from 'vuex-persistedstate'
// import ApiService from './services/EosApiService'
import ApiService from './services/IndexedDBApiService'
import IpfsApiService from './services/IpfsApiService'
import { tmpdir } from 'os';

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
        currentUserId: '[not selected]',
        network: '[not selected]',
        snackbar: false,
        text: '',
        color: '',
        levelIdsArr: [],
        pageStates: {},
        isOpened: {}
    },

    mutations: {
        SET_ACCOUNT(state, payload) {
            // state.currentUserId = payload
            Vue.set(state, 'currentUserId', payload); // must be set reactivly
        },
        SET_NETWORK(state, payload) {
            state.network = payload
        },
        SET_SNACKBAR(state, payload) {
            state.text = payload.text
            state.color = payload.color
            state.snackbar = payload.snackbar
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
                let newPageState = { paneWidth: 400, selectedTab: 0 }
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
                    const newPageState = { paneWidth: 400, selectedTab: 0 }
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
            state.pageStates[payload.pageId].openedArr = payload.openedArr
        }
    },
    actions: {
        getCommonByKey: async function (store, key) {
            return ApiService.getCommonByKey(store, key)
        },
        upsertCommon: async function (store, common) {
            return ApiService.upsertCommon(store, common)
        },
        eraseCommon: async function (store, key) {
            return ApiService.eraseCommon(key)
        },
        addAgreement: async function (store, agreementObj) {
            return ApiService.addAgreement(store, agreementObj)
        },
        takeAction: async function (store, actionObj) {
            return ApiService.takeAction(store, actionObj)
        },
        userMayAddHistory: async function (store, agreementId) {
            return ApiService.userMayAddHistory(store, agreementId)
        },

        query: async function (store, queryObj) {

            // Recursivly get an array of subclasses
            const getSubclasses = async (classKey) => {
                const subclasses = async (parentClassKey) => {
                    let classArr = await ApiService.queryByIndex(store, 'parentId', parentClassKey)
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
                let classObj = await ApiService.getCommonByKey(store, classKey)
                subClassesArr.push(classObj)
                // console.log('subClassesArr', subClassesArr)
                return subClassesArr // include the class we started out with
            }

            // Resolve where clause
            const resolveWhereClause = (queryObj, where) => {
                // if (value === '#nextstateIds') debugger
                // Replace value with foreign key
                if (where.value === '$fk') where.value = queryObj.currentObj.key

                // Replace value with currentObj.valuePath
                if (where.valuePath) {
                    if(!queryObj.currentObj) console.error('no currentObj')
                    where.value = Vue._.get(queryObj.currentObj, where.valuePath)
                }

                // If the value is an array of objects, we can use mapValue to pick one of the properies 
                // in the object and use those to populate the value array
                if (where.mapValue){
                    if(Array.isArray(where.value)) {
                        where.value = where.value.map(valueObj => {
                            return valueObj[where.mapValue]
                        })
                    }
                    else if(typeof where.value === 'object') where.value = where.value[where.mapValue]
                }
            }

            // Execute query
            const executeQuery = async where => {
                const docProp = where.docProp
                const operator = where.operator
                let value = where.value

                if (operator === 'eq') {
                    if (docProp === 'key') {
                        // Get single value based on key
                        let result = await ApiService.getCommonByKey(store, value)
                        return [result]
                    } else {
                        return await ApiService.queryByIndex(store, docProp, value)
                    }

                } else if (operator === 'in') {
                    let prommisesArr = []
                    if (!Array.isArray(value)) value = [value]
                    value.forEach(key => {
                        if (key) prommisesArr.push(ApiService.getCommonByKey(store, key))
                    })
                    return await Promise.all(prommisesArr)

                } else if (operator === 'litteral') {
                    return value.map( item => {
                        return { name: item, key: item }
                    })
                } else if (operator === 'instances') {
                    // The from clause always refers to a class.
                    // We need to get objects from classId class, and all of its subclasses
                    // First, get an array of all subclasses
                    let subClassArr = await getSubclasses(value)

                    // Collect all of the objects for these subclasses
                    let promisses = subClassArr.map(classObj => {
                        return ApiService.queryByIndex(store, 'classId', classObj.key)
                    })
                    let subClassObjectsArr = await Promise.all(promisses)
                    // Flatten array of arrays.
                    return Vue._.flatten(subClassObjectsArr)
                } else if (operator === 'subclasses') {
                    return await getSubclasses(value)
                } else if (operator === 'get_controlled_accounts') {
                    return ApiService.getControlledAccounts(store, value, 'owner')
                } else {
                    throw new Error('Cannot query with ' + operator + ' operator yet')
                }
            }

            // Filter results
            const filterResults = (resultsArr, where) => {
                const operator = where.operator
                let value = where.value

                if (operator === 'eq') {
                    return resultsArr.filter(item => {
                        return item[where.docProp] === where.value
                    })
                } else if (operator === 'in') {
                    if (!Array.isArray(value)) value = [value]
                    return resultsArr.filter(item => {
                        // Is the key in the value array?
                        return where.value.includes(item[where.docProp])
                    })
                } 
            }

            // queryId takes precidence over query
            if (queryObj.queryId) queryObj.query = await ApiService.getCommonByKey(store, queryObj.queryId)
            if(queryObj.query.where[0].stop) {
                debugger
                //console.log('before', whereArr[0])
            }
            // If currentObj is a string, assume it's a key
            if (queryObj.currentObj && typeof queryObj.currentObj === 'string') queryObj.currentObj = await ApiService.getCommonByKey(store, queryObj.currentObj)

            const whereArr = queryObj.query.where

            // The first where is executed againt the DB
            if(whereArr[0].stop) {
                debugger
                console.log('before', whereArr[0])
            }
            resolveWhereClause(queryObj, whereArr[0])
            let resultsArr = await executeQuery(whereArr[0])
            if(whereArr[0].stop) console.log('after', whereArr[0])

            // Subsequent wheres are used as filters
            for (let idx = 1; idx < whereArr.length; idx++) {
                if(whereArr[idx].stop) console.log('before', whereArr[idx])
                resolveWhereClause(queryObj, whereArr[idx])
                if(whereArr[idx].stop) console.log('after', whereArr[idx])
                resultsArr = filterResults(resultsArr, whereArr[idx])
            }

            // Sort the result, if needed
            const sortBy = queryObj.query.sortBy
            if (sortBy) {
                resultsArr.sort((a, b) => {
                    if (a[sortBy] && b[sortBy]) {
                        let aa = a[sortBy].toUpperCase()
                        let bb = b[sortBy].toUpperCase()
                        if (aa > bb) return 1
                        if (aa < bb) return -1
                    }
                    return 0
                })
            }

            return resultsArr
        },

        getMaterializedView: async function (store, viewId) {

            // Recusivly merge all the ancestor classes, starting with the root. Sub class properties take precedence over parent class
            const getMergeAncestorClasses = async classId => {
                let classObj = await ApiService.getCommonByKey(store, classId)
                if (classObj.parentId) {
                    let parentClassObj = await getMergeAncestorClasses(classObj.parentId)
                    return Vue._.mergeWith(parentClassObj, classObj, (a, b) => {
                        // if (_.isArray(a)) return a.concat(b) // Arrays must be concanated instead of merged
                    })
                } else return classObj
            }

            const smartMerge = (viewObj, classObj) => {
                if (viewObj.properties) {
                    // The the order of viewObj properties is leading
                    Object.keys(viewObj.properties).forEach(propName => {
                        if (propName === 'nextStateIds') debugger
                        const classProp = classObj.properties[propName]
                        if (classProp) {
                            let viewProp = viewObj.properties[propName]
                            viewObj.properties[propName] = Vue._.mergeWith(classProp, viewProp, (a, b) => {
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

            const viewObj = await ApiService.getCommonByKey(store, viewId)
            let classId = viewObj.baseClassId
            if (!classId) return viewObj
            const mergedAncestorClasses = await getMergeAncestorClasses(classId)
            //console.log('mergedAncestorClasses', mergedAncestorClasses)
            //if(viewId === '3ebxsw5pbk3r') debugger
            smartMerge(viewObj, mergedAncestorClasses)
            //console.log('smartMerge', viewObj)
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
