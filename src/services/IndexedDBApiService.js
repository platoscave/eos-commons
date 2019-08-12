
import axios from 'axios'
import IpfsApiService from './IpfsApiService'

class IndexedDBApiService {
  static upsertCommon (common) {
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

  static eraseCommon (key) {
    return new Promise((resolve, reject) => {
      const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')
      let objectStoreRequest = commonsStore.delete(key)
      resolve(key)
    })
  }

  static async getCommonByKey (key) {
    return new Promise((resolve, reject) => {
      const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')

      commonsStore.get(key).onsuccess = event => {
        let result = event.target.result
        if (result) {
          resolve(result)
        } else {
          axios('ipfs.io/ipfs/' + key, { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, data: {} }).then(response => {
            let result = response.data
            commonsStore.put(result, key)
            resolve(result)
          }).catch(err => reject(err))
        }
      }
    })
  }

  static async queryByIndex (indexName, key) {
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
      getAllRequest.onerror = event => reject(event)
    })
  }

  static async get_controlled_accounts (accountId, store) {
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
  static async transact (newObj, store) {
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

  static async ImportFromStatic (store) {
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
