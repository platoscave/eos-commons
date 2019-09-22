
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

    static async getCommonByKey(store, key) {
        return new Promise((resolve, reject) => {
            const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')

            commonsStore.get(key).onsuccess = event => {
                let result = event.target.result
                if (result) {
                    resolve(result)
                } else {
                    store.commit('SET_SNACKBAR', {
                        snackbar: true,
                        text: 'getCommonByKey failed: '+ key,
                        color: 'error'
                    })
                    reject('Cant find: '+ key)
                }
            }
        })
    }

    static async queryByIndex(store, indexName, key) {
        // Wrap indexedDB transaction in a promise
        return new Promise((resolve, reject) => {
            const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')
            if (!commonsStore.indexNames.contains(indexName)) {
                console.error('Add index: ', indexName)
                store.commit('SET_SNACKBAR', {
                    snackbar: true,
                    text: 'Add index: ' + indexName,
                    color: 'error'
                })
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

    static async getControlledAccounts(store, actor, saughtPermission) {

        // Recursivly get an array of subclasses
        const getSubclasses = async (classKey) => {
            const subclasses = async (parentClassKey) => {
                let classArr = await this.queryByIndex(store, 'parentId', parentClassKey)
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
            let classObj = await this.getCommonByKey(store, classKey)
            subClassesArr.push(classObj)
            // console.log('subClassesArr', subClassesArr)
            return subClassesArr // include the class we started out with
        }

        // We need to get objects from classId class, and all of its subclasses
        // First, get an array of all subclasses
        let subClassArr = await getSubclasses('kld5empithii') //  EOS Accounts

        // Collect all of the objects for these subclasses
        let promisses = subClassArr.map(classObj => {
            return this.queryByIndex(store, 'classId', classObj.key)
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
            const obj = await this.getCommonByKey(store, objId)
            if (obj.classId === classId) return true
            const superclassId = obj.classId

            const testSuperClass = async superclassId => {
                const superclass = await this.getCommonByKey(store, superclassId)
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
        const agreementObj = await this.getCommonByKey(store, agreementId)
        // Get the last process stack object
        let processStackObj = agreementObj.processStack[0]

        if (agreementObj.buyerId === currentUserId) {
            const isABuyerState = await isA(processStackObj.stateId, 'xsaq3l5hncb2') // Buyer States
            if (isABuyerState) return true
        }
        const sellerOrgunitAccounts = await this.getControlledAccounts(store, agreementObj.sellerId, 'owner')
        const currentUserOrgunitAccounts = await this.getControlledAccounts(store, currentUserId, 'active')
        const authorizedForAccountArr = Vue._.intersectionWith(sellerOrgunitAccounts, currentUserOrgunitAccounts, (objA, objB) => {
            return objA.key === objB.key
        })

        let authorizedForState = false
        authorizedForAccountArr.forEach(authAccount => {
            authAccount.authorizedForStateIds.forEach(stateId => {
                if (stateId === processStackObj.stateId) authorizedForState = true
            })
        })
        return authorizedForState
    }
    static async addAgreement(store, agreementObj) {
        console.log("addAgreement", agreementObj);

        agreementObj.docType = "object";
        // process is mapped to an agreement type
        let processObj = await this.getCommonByKey(store, agreementObj.processId);
        agreementObj.classId = processObj.agreementClassId; // Service Request Arreement class
        agreementObj.agreementHistoryIds = [];
        agreementObj.processStack = [ {
            processId: agreementObj.processId,
            stateId: 'gczvalloctae' // The Initialize state
        } ]
        agreementObj.startDate = new Date().toISOString();
        agreementObj.agreementHistoryIds = [];
        agreementObj.buyerId = store.state.currentUserId;

        const agreementKey = await this.upsertCommon(agreementObj)
        await this.takeAction(store, {agreementObj: agreementObj})

        return agreementKey
    }
    static async takeAction(store, actionObj) {
        console.log("takeAction", actionObj);

        // EOS:
        // Send action to contract
        // Is user authorized for action?
        //    does userId have enough active permission?
        // Get next stateId from current stateId -> state.action
        // Execute transaction: set agreement current stateId
        // Read tracaction into stateHistory


        // Get the agreement
        if(!actionObj.agreementObj) actionObj.agreementObj = await this.getCommonByKey(store, actionObj.agreementId);
        await this.bumpState(store, actionObj);
        let nextStateId = actionObj.agreementObj.processStack[0].stateId
        // Get the newStateObj
        let newStateObj = await this.getCommonByKey(store, nextStateId);

        // See if we have to do anything, based on the new state
        if(newStateObj.classId === 'dqja423wlzrb' ){ //Execute class //TODO replace with isA
            // For now, just skip
            actionObj.action = 'happy'
            await this.bumpState(store, actionObj);
        }
        if(newStateObj.classId === 'jotxozcetpx2' ){ //Perform class //TODO replace with isA
            // Add the sub process to the call stack
            actionObj.agreementObj.processStack.unshift( {
                processId: actionObj.agreementObj.sellerProcessId, // TODO known sub poricess??
                stateId: 'gczvalloctae' // The Initialize state
            } )
            this.UpdateAgreementAddTransaction(store, actionObj) 
            await this.takeAction(store, actionObj)
        }

 
    }
    
    static async bumpState(store, actionObj) {
        const date = new Date();
        actionObj.agreementObj.stateDate = date.toISOString()
        
        // Determine next state
        // Get the current process stack object
        let processStackObj = actionObj.agreementObj.processStack[0]
        // If we are initializing, set the state to the process substateId
        if(processStackObj.stateId === 'gczvalloctae') { // Initialize state
            // WRONG which processId in the case of sub classes?
            let processObj = await this.getCommonByKey(store, actionObj.agreementObj.processId);
            // Set the state to the process subState
            processStackObj.stateId = processObj.substateId
            return this.UpdateAgreementAddTransaction(store, actionObj) 
        } 
        // Get processStackObj state object
        const currentStateObj = await this.getCommonByKey(store, processStackObj.stateId);

        if(currentStateObj.nextStateIds && currentStateObj.nextStateIds.length) {
            // Find the next state that corresponds with the action
            const nextStateObj = currentStateObj.nextStateIds.find( obj => {
                return obj.action === actionObj.action
            })
            // If the nextStateObj has a stateId, use it
            if(nextStateObj && nextStateObj.stateId) {
                processStackObj.stateId = nextStateObj.stateId // Set agreement state to it
                return this.UpdateAgreementAddTransaction(store, actionObj) 
            }
        }
        // We couldn't find a nextStateId, so we return
        // Are we in a sub process? If so, send action to super process
        if(actionObj.agreementObj.processStack.length > 1) {
            // Remove the top processStackObj
            processStackObj.shift()
            return this.UpdateAgreementAddTransaction(store, actionObj) 
        } else {
            // Otherwize we are at the end
            if(actionObj.action === 'happy' ) processStackObj.stateId = '3hxkire2nn4v' // Sucess
            else processStackObj.stateId = 'zdwdoqpxks2s' // Failed
            return this.UpdateAgreementAddTransaction(store, actionObj) 
        }
    }

    static async UpdateAgreementAddTransaction(store, actionObj) {
        const date = new Date();
  
        // Add history record (get transaction from eos)
        // TODO find a way to query trransactions from eos, tehn remove agreementHistoryId
        const transactionObj = {
            docType: 'object',
            classId: 're1ihrfyl3zf', // Transaction
            processId: actionObj.agreementObj.processStack[0].processId, // Service Request Process
            stateId: actionObj.agreementObj.processStack[0].stateId,
            action: actionObj.action,
            stateDate: date.toISOString(),
            updaterId: store.state.currentUserId,
            description: actionObj.description
        }
        const key = await this.upsertCommon(transactionObj)

        // Add transaction to agreementHistoryIds
        actionObj.agreementObj.agreementHistoryIds.unshift(key)
        // Update agreementObj with new state
        await this.upsertCommon(actionObj.agreementObj)

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
