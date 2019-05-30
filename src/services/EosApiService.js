import { Api, JsonRpc, RpcError } from 'eosjs'
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'
import testAccounts from '../config/testaccounts.js'
import axios from 'axios'

const HTTPENDPOINT = 'http://localhost:8888'
const CODE = 'eoscommonsio' // contract who owns the table, to keep table names unqique amongst different contracts. We all use the same table space.
const SCOPE = 'eoscommonsio' // scope of the table. Can be used to give each participating acount its own table. Usually the same as code
const TABLE = 'commons' // name of the table as specified by the contract abi

// Main action call to blockchain
async function takeAction (action, dataValue) {
  const ACCOUNT = 'eoscommonsio'
  const ACTOR = 'eoscommonsio'

  const privateKey = testAccounts.testAccounts.eoscommonsio.privateKey
  const rpc = new JsonRpc(HTTPENDPOINT)
  const signatureProvider = new JsSignatureProvider([privateKey])
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() })

  // Main call to blockchain after setting action, account_name and data
  try {
    const resultWithConfig = await api.transact({
      actions: [{
        account: ACCOUNT,
        name: action,
        authorization: [{
          actor: ACTOR,
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

class EosApiService {
  static upsertCommon (key, commonObj) {
    const getRandomKey = () => {
      var characters = 'abcdefghijklmnopqrstuvwxyz12345'
      var randomKey = ''
      for (var i = 0; i < 12; i++) {
        randomKey += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      return randomKey
    }
    if (!key) key = getRandomKey()

    return new Promise((resolve, reject) => {
      takeAction('upsert', { username: 'eoscommonsio', key: key, common: JSON.stringify(commonObj) })
        .then(() => {
          resolve(key)
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
    try {
      const rpc = new JsonRpc(HTTPENDPOINT)
      const result = await rpc.get_table_rows({
        'json': true,
        'code': CODE, // contract who owns the table
        'scope': SCOPE, // scope of the table
        'table': TABLE, // name of the table as specified by the contract abi
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

  static async queryByIndex (indexName, key) {
    try {
      const rpc = new JsonRpc(HTTPENDPOINT)
      const result = await rpc.get_table_rows({
        'json': true,
        'code': CODE, // contract who owns the table
        'scope': SCOPE, // scope of the table
        'table': TABLE, // name of the table as specified by the contract abi
        'limit': 500,
        'lower_bound': key
      })
      console.log('key: ' + result.rows[0].key)
      return JSON.parse(result.rows[0].common)
    } catch (err) {
      console.error(err)
    }
  }

  static async loadEos () {
    const doAllSequentually = async (fnPromiseArr) => {
      for (let i = 0; i < fnPromiseArr.length; i++) {
        await fnPromiseArr[i]()
      }
    }

    const createFnPromise = (key, common) => {
      return () => this.upsertCommon(key, common)
    }

    return axios('commons.json', { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, data: {} }).then(response => {
      let loadEOSPromissesArr = []
      Object.keys(response.data).forEach(key => {
        let common = response.data[key]
        console.log(key, common)
        loadEOSPromissesArr.push(createFnPromise(key, common))
      })
      doAllSequentually(loadEOSPromissesArr).then(() => {
        console.log('finished')
        return true
      })
    })
  }
}

export default EosApiService
