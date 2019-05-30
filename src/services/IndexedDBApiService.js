
import axios from 'axios'

class IndexedDBApiService {
    static async getCommonByKey(key) {
        return new Promise((resolve, reject) => {
            const commonsStore = this.db.transaction('commons', 'readwrite').objectStore('commons')

            commonsStore.get(key).onsuccess = event => {
                let result = event.target.result
                if (result) {
                    // result.key = key
                    result.id = key
                    resolve(result)
                } else {
                    axios('ipfs.io/ipfs/' + key, { headers: { 'Content-Type': 'application/json; charset=UTF-8' }, data: {} }).then(response => {
                        let result = response.data
                        commonsStore.put(result, key)
                        // result.key = key
                        result.id = key
                        resolve(result)
                    }).catch(err => reject(err))
                }
            }
        })
    }

    static async queryByIndex(indexName, key) {
      // Wrap indexedDB transaction in a promise
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['commons'], 'readonly')
            const commonsStore = transaction.objectStore('commons')
            let resultsArr = []
            let index = commonsStore.index(indexName)
            // We user a cursor instead of getAll, because we have to add key to our objects
            const request = index.openCursor(IDBKeyRange.only(key))

            request.onsuccess = event => {
              let cursor = event.target.result
              if (cursor) {
                let result = cursor.value
                // result.key = cursor.primaryKey
                result.id = cursor.primaryKey
                resultsArr.push(result)
                cursor.continue()
              }
            }

            request.onerror = event => reject(event)

            transaction.oncomplete = () => resolve(resultsArr)
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
