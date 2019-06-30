
import axios from 'axios'
import IpfsApiService from './IpfsApiService'

class InitializeApiService {
  static async fromStaticFile () {
    return new Promise((resolve, reject) => {
      const openRequest = indexedDB.open('commonsDB', 1)

      openRequest.onupgradeneeded = e => {
        let db = e.target.result
        const store = db.createObjectStore('commons', { keyPath: 'key' })
        store.createIndex('parentId', 'parentId')
        store.createIndex('classId', 'classId')
        store.createIndex('ownerId', 'ownerId')
        store.createIndex('isDirty', 'isDirty')
        store.createIndex('cid', 'cid')
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

export default InitializeApiService
