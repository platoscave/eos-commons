
import axios from 'axios'
import Vue from 'vue'
const eosjs = require('eosjs');
import BigNumber from 'bignumber.js/bignumber'


class IndexedDBApiService {
    static upsertCommon(common) {
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
        if (!common.key) common.key = getRandomKey()
        common.isDirty = true

        return new Promise((resolve, reject) => {
            const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')
            let objectStoreRequest = commonsStore.put(common)
            resolve(common.key)
        })
    }

    static eraseCommon(key) {
        return new Promise((resolve, reject) => {
            const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')
            let objectStoreRequest = commonsStore.delete(key)
            resolve(key)
        })
    }

    static async getCommonByKey(key) {
        return new Promise((resolve, reject) => {
            const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')

            commonsStore.get(key).onsuccess = event => {
                let result = event.target.result
                if (result) {
                    resolve(result)
                } else {
                    store.commit('SET_SNACKBAR', {
                        snackbar: true,
                        text: 'queryByIndex failed',
                        color: 'error'
                    })
                    reject('error')
                }
            }
        })
    }

    static async queryByIndex(indexName, key) {
        // Wrap indexedDB transaction in a promise
        return new Promise((resolve, reject) => {
            const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')
            if (!commonsStore.indexNames.contains(indexName)) {
                console.error('Add index: ', indexName)
                resolve([])
                return
            }
            let index = commonsStore.index(indexName)
            let getAllRequest = index.getAll(key)

            getAllRequest.onsuccess = function () {
                resolve(getAllRequest.result)
            }
            getAllRequest.onerror = event => {
                store.commit('SET_SNACKBAR', {
                    snackbar: true,
                    text: 'queryByIndex failed',
                    color: 'error'
                })
                reject(event)
            }
        })
    }

    static async getControlledAccounts(actor, saughtPermission) {

        // Recursivly get an array of subclasses
        const getSubclasses = async (classKey) => {
            const subclasses = async (parentClassKey) => {
                let classArr = await this.queryByIndex('parentId', parentClassKey)
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
            let classObj = await this.getCommonByKey(classKey)
            subClassesArr.push(classObj)
            // console.log('subClassesArr', subClassesArr)
            return subClassesArr // include the class we started out with
        }

        // We need to get objects from classId class, and all of its subclasses
        // First, get an array of all subclasses
        let subClassArr = await getSubclasses('kld5empithii') //  EOS Accounts

        // Collect all of the objects for these subclasses
        let promisses = subClassArr.map(classObj => {
            return this.queryByIndex('classId', classObj.key)
        })
        let subClassObjectsArr = await Promise.all(promisses)
        // Flatten array of arrays.
        const accountsArr = Vue._.flatten(subClassObjectsArr)
        let resultsArr = []

        accountsArr.forEach(accountObj => {
            if (accountObj.permissions) {
                accountObj.permissions.forEach(permission => {
                    if (permission.required_auth.accounts) {
                        permission.required_auth.accounts.forEach(account => {
                            if (account.permission.actor === actor && account.permission.permission === saughtPermission) resultsArr.push(accountObj)
                        })
                    }
                })
            }
            return false
        })
        return resultsArr
    }

    static async userMayAddHistory(store, agreementId) {

        // Recursivly findout if obj is a classId
        const isA = async (objId, classId) => {
            const obj = await this.getCommonByKey(objId)
            if (obj.classId === classId) return true
            const superclassId = obj.classId

            const testSuperClass = async superclassId => {
                const superclass = await this.getCommonByKey(superclassId)
                if (!superclass.parentId) return false // we are at the root
                if (superclass.parentId === classId) return true
                return testSuperClass(superclass.parentId)
            }
        }
        /* 
          if agreement buyerId = current user
          and
          agreement stateId = typeOf(buyerState)
              allow add history record
  
          or
  
          get seller orgunit accounts = controled accounts by sellerId  
          get currnet user orgunit accounts = controled accounts by current user 
          if there is a match
              find the states that these accounts are authorized for
              if one of those sates is the current state
                  allow add history record
        */
        const currentUserId = store.state.currentUserId
        const agreementObj = await this.getCommonByKey(agreementId)

        if (agreementObj.buyerId === currentUserId) {
            const isABuyerState = await isA(agreementObj.stateId, 'xsaq3l5hncb2') // Buyer States
            if (isABuyerState) return true
        }
        const sellerOrgunitAccounts = await this.getControlledAccounts(agreementObj.sellerId, 'owner')
        const currentUserOrgunitAccounts = await this.getControlledAccounts(currentUserId, 'active')
        const authorizedForAccountArr = Vue._.intersectionWith(sellerOrgunitAccounts, currentUserOrgunitAccounts, (objA, objB) => {
            return objA.key === objB.key
        })

        let authorizedForState = false
        authorizedForAccountArr.forEach(authAccount => {
            authAccount.authorizedForStateIds.forEach(stateId => {
                if (stateId === agreementObj.stateId) authorizedForState = true
            })
        })
        return authorizedForState
    }
    static async transact(newObj, store) {
        try {
            const rpc = new JsonRpc(HTTPENDPOINT)
            const result = await api.transact({
                actions: [{
                    account: 'eosio',
                    name: 'delegatebw',
                    authorization: [{
                        actor: 'useraaaaaaaa',
                        permission: 'active'
                    }],
                    data: {
                        from: 'useraaaaaaaa',
                        receiver: 'useraaaaaaaa',
                        stake_net_quantity: '1.0000 SYS',
                        stake_cpu_quantity: '1.0000 SYS',
                        transfer: false
                    }
                }]
            }, {
                    blocksBehind: 3,
                    expireSeconds: 30
                })
            return result.rows.map(row => {
                return JSON.parse(row.common)
            })
        } catch (err) {
            console.error(err)
            return []
        }
    }

    static async ImportFromStatic(store) {

        /* let sb = new eosjs.Serialize.SerialBuffer();                                                  
        sb.pushName('testacc');                                                                                                                                     
        let res = eosjs.Numeric.binaryToDecimal(sb.getUint8Array(8));
        const lowerBoundBigNumber = new BigNumber(res)
        const upperBoundBigNumber = lowerBoundBigNumber.plus(1).toString()
        let res2 = eosjs.Numeric.SerialBuffer(12, upperBoundBigNumber);

        debugger */

        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open('commonsDB', 1)

            openRequest.onupgradeneeded = e => {
                let db = e.target.result
                const store = db.createObjectStore('commons', { keyPath: 'key' })
                store.createIndex('parentId', 'parentId')
                store.createIndex('classId', 'classId')
                store.createIndex('ownerId', 'ownerId')
                store.createIndex('parentStateId', 'parentStateId')
                store.createIndex('parentOrgId', 'parentOrgId')
                store.createIndex('isDirty', 'isDirty')
            }

            openRequest.onsuccess = e => {
                this.db = e.target.result

                return axios('commons.json', { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, data: {} }).then(response => {
                    const transaction = this.db.transaction('commons', 'readwrite')
                    const commonsStore = transaction.objectStore('commons')
                    // console.log(response.data)

                    /* const ipfsPromisses = response.data.map(obj => {
                                  IpfsApiService.pinJSONToIPFS(obj).then( result => {
                                      console.log('result', result)
                                      obj.cid = result.data.IpfsHash
                                  })
                              }) */

                    response.data.forEach(obj => {
                        commonsStore.put(obj)
                    })
                    store.commit('SET_SNACKBAR', {
                        snackbar: true,
                        text: 'Import from static succes',
                        color: 'green'
                    })
                    resolve(true)
                })
            }

            openRequest.onerror = e => {
                store.commit('SET_SNACKBAR', {
                    snackbar: true,
                    text: 'Import from static file failed',
                    color: 'error'
                })
                console.error(e.error)
                reject(e.error)
            }
        })
    }
}

export default IndexedDBApiService
