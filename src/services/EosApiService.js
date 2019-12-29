import {
    Api,
    JsonRpc,
    RpcError
} from 'eosjs'
import {
    JsSignatureProvider
} from 'eosjs/dist/eosjs-jssig'
import testAccounts from '../config/testaccounts.js'
import networks from '../config/networks.js'
import axios from 'axios'
import BigNumber from 'bignumber.js/bignumber'
import {
    encodeName,
    decodeName
} from '../lib/format.js'
import IndexedDBApiService from './IndexedDBApiService'

// See https://eosio.github.io/eosjs/latest/how-to-guides/index


// Main action call to blockchain
async function takeAction(store, actions) {

    const network = store.state.network;
    const rpc = new JsonRpc(networks[network]);

    const actor = store.state.currentUserId;
    const privateKey = testAccounts[actor].privateKey
    const signatureProvider = new JsSignatureProvider([privateKey])

    const api = new Api({
        rpc,
        signatureProvider,
        textDecoder: new TextDecoder(),
        textEncoder: new TextEncoder()
    })

    return new Promise( async(resolve, reject) => {
        // Main call to blockchain after setting action, account_name and data
        try {
            const resultWithConfig = await api.transact({
                actions: actions
            }, {
                blocksBehind: 3,
                expireSeconds: 30
            })
            store.commit('SET_SNACKBAR', {
                snackbar: true,
                text: 'EOS Transaction Succeded: '+ actions[0].name,
                color: 'success'
            })
            resolve( resultWithConfig )
        } catch (err) {
            let text = 'EOS Transaction Failed: '+ actions[0].name
            if (err instanceof RpcError) {
                store.commit('SET_SNACKBAR', {
                    snackbar: true,
                    text: text + '\n' + err.json.error.details[0].message,
                    color: 'error'
                })
                reject(new Error(JSON.stringify(err.json, null, 2)))
            }
            else {
                store.commit('SET_SNACKBAR', {
                    snackbar: true,
                    text: text,
                    color: 'error'
                })
                reject(err)
            }
        }
    })
}

class EosApiService {
    static upsertCommon(store, action, common) {
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

        const accountName = 'eoscommonsio' // also, the name of the table we're tring to update
        const actor = store.state.currentUserId; // The user performing the action
        const actions = [{
            account: accountName,
            name: action,
            authorization: [{
                actor: actor,
                permission: 'active'
            }],
            data: {
                payload: {
                    username: actor,
                    common: JSON.stringify(common)
                }
            }
        }]
        return takeAction(store, actions)
    }

    static eraseCommon(store, key) {
        const accountName = '' // also, the name of the table we're tring to update
        const actor = store.state.currentUserId; // The user performing the action
        const actions = [{
            account: accountName,
            name: 'erase',
            authorization: [{
                actor: actor,
                permission: 'active'
            }],
            data: {
                payload: {
                    username: actor,
                    key: key
                }
            }
        }]
        return takeAction(store, actions)
    }

    static async createAccount(store) {
        const newAccount = 'gzthjuyjca4s'
        const actor = store.state.currentUserId;

        const actions = [{
                account: 'eosio',
                name: 'newaccount',
                authorization: [{
                    actor: actor,
                    permission: 'active',
                }],
                data: {
                    creator: actor,
                    name: newAccount,
                    owner: {
                        threshold: 1,
                        keys: [],
                        accounts: [{
                            permission: {
                              actor: 'eoscommonsio', 
                              permission: "owner"
                            }, 
                            weight: 1 
                          }],
                        waits: []
                    },
                    active: {
                        threshold: 1,
                        keys: [],
                        accounts: [{
                            permission: {
                              actor: 'eoscommonsio', 
                              permission: "active"
                            }, 
                            weight: 1 
                          }],
                        waits: []
                    },
                },
            }/*, // Omly needed when the eos system contract is running
            {
                account: 'eosio',
                name: 'buyrambytes',
                authorization: [{
                    actor: actor,
                    permission: 'active',
                }],
                data: {
                    payer: actor,
                    receiver: newAccount,
                    bytes: 8192,
                },
            },
            {
                account: 'eosio',
                name: 'delegatebw',
                authorization: [{
                    actor: actor,
                    permission: 'active',
                }],
                data: {
                    from: actor,
                    receiver: newAccount,
                    stake_net_quantity: '1.0000 SYS',
                    stake_cpu_quantity: '1.0000 SYS',
                    transfer: false,
                }
            }*/
        ]
        const result = await takeAction(store, actions)
        return result
    }

    // Query Tables


    static async getCommonByKey(store, keyValue) {
        return this.queryByIndex('key', keyValue).then(result => {
            if (result.length == 0) {
                console.error('Key Not found: ' + keyValue)
                return []
            }
            return result[0]
        })
    }

    static async queryByIndex(store, table, indexName, keyValue) {
        try {
            // sb = new eosjs.Serialize.SerialBuffer();                                                  
            // sb.pushName('testacc');                                                                                                                                     
            // eosjs.Numeric.binaryToDecimal(sb.getUint8Array(8));
            // See https://github.com/EOSIO/eosjs/issues/154
            const lowerBoundBigNumber = new BigNumber(encodeName(keyValue, false))
            const upperBound = decodeName(lowerBoundBigNumber.plus(1).toString(), false)
            // console.log('indexName: ', indexName, 'key: ', key, lowerBoundBigNumber.toString(), lowerBoundBigNumber.plus(1).toString())

            let index = 0
            if (indexName === 'key') index = 'first'
            else if (indexName === 'parentId') index = 'second'
            else if (indexName === 'classId') index = 'third'
            else throw 'Add index: ' + indexName

            const network = store.state.network;
            const rpc = networks[network]

            const CODE = 'eoscommonsio' // contract who owns the table, to keep table names unqique amongst different contracts. We all use the same table space.
            const SCOPE = 'eoscommonsio' // scope of the table. Can be used to give each participating acount its own table. Otherwise the same as code
            const TABLE = 'commons' // name of the table as specified by the contract abi

            const result = await rpc.get_table_rows({
                'json': true,
                'code': CODE, // contract who owns the table
                'scope': SCOPE, // scope of the table
                'table': TABLE, // name of the table as specified by the contract abi
                'limit': 500,
                'key_type': 'name', // account name type
                'index_position': index,
                'lower_bound': keyValue,
                'upper_bound': upperBound // must be numericlly equal to key plus one
            })
            return result.rows.map(row => {
                return JSON.parse(row.common)
            })
        } catch (err) {
            console.error(err)
            return []
        }
    }

    static async ImportFromEOS() {
        const doAllSequentually = async (fnPromiseArr) => {
            for (let i = 0; i < fnPromiseArr.length; i++) {
                await fnPromiseArr[i]()
            }
        }

        const createFnPromise = (common) => {
            return () => this.upsertCommon(common)
        }
    }

    static async SaveDirtyToEos() {
        const doAllSequentually = async (fnPromiseArr) => {
            for (let i = 0; i < fnPromiseArr.length; i++) {
                await fnPromiseArr[i]()
            }
        }

        const createFnPromise = (common) => {
            return () => this.upsertCommon(common)
        }
    }

    static async ImportFromEOSX() {
        /* const doAllSequentually = async (fnPromiseArr) => {
          for (let i = 0; i < fnPromiseArr.length; i++) {
            await fnPromiseArr[i]()
          }
        }

        const createFnPromise = (common) => {
          return () => this.upsertCommon(common)
        }

        return axios('commons.json', { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, data: {} }).then(response => {
          let loadEOSPromissesArr = []
          response.data.forEach(common => {
            // console.log(common)
            loadEOSPromissesArr.push(createFnPromise(common))
          })
          doAllSequentually(loadEOSPromissesArr).then(() => {
            console.log('finished upsert')
            return true
          })
        }) */
    }

    static EraseAllEos() {
        const doAllSequentually = async (fnPromiseArr) => {
            for (let i = 0; i < fnPromiseArr.length; i++) {
                await fnPromiseArr[i]()
            }
        }

        const createFnPromise = (key) => {
            return () => this.eraseCommon(key)
        }

        return axios('commons.json', {
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            data: {}
        }).then(response => {
            let loadEOSPromissesArr = []
            response.data.forEach(common => {
                // console.log(common)
                loadEOSPromissesArr.push(createFnPromise(common.key))
            })
            doAllSequentually(loadEOSPromissesArr).then(() => {
                console.log('finished eraseall')
                return true
            })
        })
        /* return new Promise((resolve, reject) => {
          takeAction(store, 'eoscommonsio', 'eraseall', { username: 'eoscommonsio' })
            .then(() => {
              resolve()
            })
            .catch(err => {
              reject(err)
            })
        }) */
    }

    static async getAccountInfo(store, account) {
        const network = store.state.network;
        const rpc = new JsonRpc(networks[network]);
        const result = await rpc.get_account(account)
        console.log(result)
        return result
    }

    static async getAbi(store, account) {
        const network = store.state.network;
        const rpc = new JsonRpc(networks[network]);
        const result = await rpc.get_abi(account)
        console.log(result)
        return result
    }

    static async test(store) {
        let objId = 'lmxjrogzeld1' //purchase agreement
        // let objId = 'gzthjuyjca4s' //root
        const common = await store.dispatch(
            "getCommonByKey",
            objId
        );
        const result = await this.upsertCommon(store, 'addagreement', common) 
        console.log(result)
        return result
    }
}

export default EosApiService