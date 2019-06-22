
import axios from 'axios'

class IndexedDBApiService {
    static async getCommonByKey(key) {
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

    static async queryByIndex(indexName, key) {
        // Wrap indexedDB transaction in a promise
        return new Promise((resolve, reject) => {
            const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')
            if(!commonsStore.indexNames.contains(indexName)) {
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

    static async loadIndexedDB() {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open('commonsDB', 1)

            openRequest.onupgradeneeded = e => {
                let db = e.target.result
                const store = db.createObjectStore('commons', { keyPath: 'key' })
                store.createIndex('parentId', 'parentId')
                store.createIndex('classId', 'classId')
                store.createIndex('ownerId', 'ownerId')
            }

            openRequest.onsuccess = e => {
                this.db = e.target.result

                return axios('commons.json', { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, data: {} }).then(response => {
                    const transaction = this.db.transaction('commons', 'readwrite')
                    const commonsStore = transaction.objectStore('commons')
                    // console.log(response.data)
                    response.data.forEach(obj => {
                        commonsStore.put(obj)
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
