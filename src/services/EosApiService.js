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
            console.log('actions', actions)
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
        const accountName = 'eoscommonsio' // also, the name of the table we're tring to update
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

    static bumpState(store, agreementId) {
        const accountName = 'eoscommonsio' // also, the name of the table we're tring to update
        const actor = store.state.currentUserId; // The user performing the action
        const actions = [{
            account: accountName,
            name: 'bumpstate',
            authorization: [{
                actor: actor,
                permission: 'active'
            }],
            data: {
                payload: {
                    username: actor,
                    agreementid: agreementId,
                    action: 'happy'
                }
            }
        }]
        return takeAction(store, actions)
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

    static async StaticAllToEos(store) {
        const doAllSequentually = async (fnPromiseArr) => {
            for (let i = 0; i < fnPromiseArr.length; i++) {
                await fnPromiseArr[i]()
            }
        }

        const createFnPromise = (common) => {
            return () => this.upsertCommon(store, 'upsert', common).then( result => {console.log(result)})
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
                loadEOSPromissesArr.push(createFnPromise(common))
            })
            doAllSequentually(loadEOSPromissesArr).then(() => {
                console.log('finished StaticAllToEos')
                return true
            })
        })
    }
    static async IndexedDBAllToEos(store) {
        const doAllSequentually = async (fnPromiseArr) => {
            for (let i = 0; i < fnPromiseArr.length; i++) {
                await fnPromiseArr[i]()
            }
        }

        const createFnPromise = (actions) => {
            return () => takeAction(store, actions).then( result => {console.log(result)})
        }

        // Recusivly nagigate class model
        const addSubclasses = async (classId) => {

            // Get the subclasses for this class
            let classesQueryObj = {
                query: {
                    where: [{
                        docProp: 'parentId',
                        operator: 'eq',
                        value: classId
                    }]
                }
            }
            const classesArr = await store.dispatch('query', classesQueryObj)
            if(classesArr.length) {
                const actions = []
                classesArr.forEach(async subClassObj => {
                    actions.push({
                        account: accountName,
                        name: 'upsert',
                        authorization: [{
                            actor: actor,
                            permission: 'active'
                        }],
                        data: {
                            payload: {
                                username: actor,
                                common: JSON.stringify(subClassObj)
                            }
                        }
                    })
                })
                loadEOSPromissesArr.push(createFnPromise(actions))
                let promises = []
                classesArr.forEach(async subClassObj => {
                    promises.push(addSubclasses(subClassObj.key))
                })
                await Promise.all(promises)
            }

            // Get the objects for this class
            let objectsQueryObj = {
                query: {
                    where: [{
                        docProp: 'classId',
                        operator: 'eq',
                        value: classId
                    }]
                }
            }
            const objectsArr = await store.dispatch('query', objectsQueryObj)
            if(objectsArr.length) {
                const actions = []
                objectsArr.forEach(async obj => {
                    actions.push({
                        account: accountName,
                        name: 'upsert',
                        authorization: [{
                            actor: actor,
                            permission: 'active'
                        }],
                        data: {
                            payload: {
                                username: actor,
                                common: JSON.stringify(obj)
                            }
                        }
                    })
                })
                loadEOSPromissesArr.push(createFnPromise(actions))
            }
        }


        const accountName = 'eoscommonsio' // also, the name of the table we're tring to update
        const actor = store.state.currentUserId; // The user performing the action
        let loadEOSPromissesArr = []

        const root = await store.dispatch( 'getCommonByKey', 'gzthjuyjca4s' ); // get the root

        await this.upsertCommon(store, 'upsert', root).then( result => {console.log(result)})

        await addSubclasses('gzthjuyjca4s')
        doAllSequentually(loadEOSPromissesArr)

    }

    static async SaveDirtyToEos(store) {
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

    }

    static XEraseAllEos(store) {
        const doAllSequentually = async (fnPromiseArr) => {
            for (let i = 0; i < fnPromiseArr.length; i++) {
                await fnPromiseArr[i]()
            }
        }

        const createFnPromise = (key) => {
            return () => this.eraseCommon(store, key)
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

    }
    static EraseAllEos(store) {
        const accountName = 'eoscommonsio' // also, the name of the table we're tring to update
        const actor = store.state.currentUserId; // The user performing the action
        const actions = [{
            account: accountName,
            name: 'eraseall',
            authorization: [{
                actor: actor,
                permission: 'active'
            }],
            data: {
                payload: {
                    username: actor
                }
            }
        }]
        takeAction(store, actions).then( result => {console.log(result)})
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

    static async addAgreement(store) {
 
        const printTraces = result => {
            console.log(result.console)
            if(result.inline_traces.length) printTraces(result.inline_traces[0])
        }

        const eraseResult =  await this.eraseCommon(store, 'lmxjrogzeld1')
        console.log('eraseResult', eraseResult)

        let objId = 'lmxjrogzeld1' //purchase agreement
        // let objId = 'gzthjuyjca4s' //root
        const common = await store.dispatch(
            "getCommonByKey",
            objId
        );
        const result = await this.upsertCommon(store, 'addagreement', common) 
        // const result = await this.bumpState(store, 'lmxjrogzeld1', '') 

        console.log('results')
        printTraces(result.processed.action_traces[0])


        return result
       
    }

    static async bumpAgreementState(store) {
 
        const printTraces = result => {
            console.log(result.console)
            if(result.inline_traces.length) printTraces(result.inline_traces[0])
        }

        const result = await this.bumpState(store, 'lmxjrogzeld1' )
        console.log('results')
        printTraces(result.processed.action_traces[0])

        return result
       
    }

    static async test(store) {
 
        const printTraces = result => {
            console.log(result.console)
            if(result.inline_traces.length) printTraces(result.inline_traces[0])
        }

/*
        const result = await this.bumpState(store, 'lmxjrogzeld1' )
        console.log('results')
        printTraces(result.processed.action_traces[0])

        */

        const eraseResult =  await this.eraseCommon(store, 'lmxjrogzeld1')
        console.log('eraseResult', eraseResult)

        let objId = 'lmxjrogzeld1' //purchase agreement
        // let objId = 'gzthjuyjca4s' //root
        const common = await store.dispatch(
            "getCommonByKey",
            objId
        );
        const result = await this.upsertCommon(store, 'addagreement', common) 
        // const result = await this.bumpState(store, 'lmxjrogzeld1', '') 

        console.log('results')
        printTraces(result.processed.action_traces[0])


        return result
       
    }
}

export default EosApiService