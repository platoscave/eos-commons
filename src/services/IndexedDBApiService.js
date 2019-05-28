import { Api, JsonRpc, RpcError } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import testAccounts from '../config/testaccounts.js'
import axios from 'axios'

// Main action call to blockchain
async function takeAction (action, dataValue) {
  const privateKey = testAccounts.testAccounts.eoscommonsio.privateKey
  const httpEndpoint = 'http://localhost:8888'
  const rpc = new JsonRpc(httpEndpoint)
  const signatureProvider = new JsSignatureProvider([privateKey])
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() })

  // Main call to blockchain after setting action, account_name and data
  try {
    const resultWithConfig = await api.transact({
      actions: [{
        account: 'eoscommonsio',
        name: action,
        authorization: [{
          actor: 'eoscommonsio',
          permission: 'active'
        }],
        data: dataValue
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30
    })
    return resultWithConfig
  } catch (err) {
    console.error('\nCaught exception: ' + err)
    if (err instanceof RpcError) { console.log(JSON.stringify(err.json, null, 2)) }
  }
}

class IndexedDBApiService {
  static upsertCommon (key, commonObj) {
    return new Promise((resolve, reject) => {
      takeAction('upsert', { username: 'eoscommonsio', key: key, common: JSON.stringify(commonObj) })
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  static eraseCommon (key) {
    return new Promise((resolve, reject) => {
      takeAction('erase', { username: 'eoscommonsio', key: key })
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  static eraseallCommon () {
    return new Promise((resolve, reject) => {
      takeAction('eraseall', { username: 'eoscommonsio' })
        .then(() => {
          resolve()
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  static async getCommonByKey (key) {
    const httpEndpoint = 'http://localhost:8888'
    try {
      const rpc = new JsonRpc(httpEndpoint)
      const result = await rpc.get_table_rows({
        'json': true,
        'code': 'eoscommonsio', // contract who owns the table
        'scope': 'eoscommonsio', // scope of the table
        'table': 'commons', // name of the table as specified by the contract abi
        'limit': 1,
        'lower_bound': key
      })
      if (result.rows.length == 0) throw 'Key Not found: ' + key
      console.log('key: ' + result.rows[0].key)
      return JSON.parse(result.rows[0].common)
    } catch (err) {
      console.error(err)
    }
  }

  static async loadIndexedDB () {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open('commonsDB', 1)

      openRequest.onupgradeneeded = e => {
        let db = e.target.result
        const store = db.createObjectStore('commons')
        store.createIndex('parentId', 'parentId')
        store.createIndex('classId', 'classId')
      }

      openRequest.onsuccess = e => {
        this.db = e.target.result

        return axios('commons.json', { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, data: {} }).then(response => {
          const transaction = this.db.transaction('commons', 'readwrite')
          const commonsStore = transaction.objectStore('commons')
          Object.keys(response.data).forEach(key => {
            let result = response.data[key]
            commonsStore.put(result, key)
          })
          resolve(true)
        })
      }

      openRequest.onerror = e => {
        console.error(e.error)
        reject(e.error)
      }
    })
  }
}

export default IndexedDBApiService
