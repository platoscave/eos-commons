import ipfsConfig from '../config/ipfsConfig.js'
import axios from 'axios'

class IpfsApiService {
  static getCommonByCid (cid) {
    const url = ipfsConfig.getUrl + cid
    return axios
      .get(
        url,
        {
          headers: ipfsConfig.headers
        }
      ).then(function (response) {
        return response
      })
      .catch(function (error) {
        console.error('\nCaught exception: ' + error.response.data.error)
        return {}
      })
  }

  static pinJSONToIPFS (json) {
    const JSONBody = {
      pinataMetadata: {
        name: json.title ? json.title : json.name,
        keyvalues: {
          key: json.key,
          parentId: json.parentId,
          classId: json.classId
        }
      },
      pinataContent: json
    }
    // console.log('JSONBody', JSONBody)
    return axios
      .post(
        ipfsConfig.pinJSONToIPFSUrl,
        JSONBody,
        {
          headers: ipfsConfig.headers
        }).then(function (response) {
        return response
      })
      .catch(function (error) {
        console.error('\nCaught exception: ' + error.response.data.error)
        return {}
      })
  }

  static removePinFromIPFS (pinToRemove) {
    return axios
      .post(
        ipfsConfig.removePinFromIPFSUrl,
        {
          ipfs_pin_hash: pinToRemove
        },
        {
          headers: ipfsConfig.headers
        }).then(function (response) {
        return response
      })
      .catch(function (error) {
        console.error('\nCaught exception: ' + error.response.data.error)
        return {}
      })
  }

  static userPinList (queryParams) {
    const sanitizedParams = {
      hashContains: queryParams.hashContains ? queryParams.hashContains : '*',
      pinStartDate: queryParams.pinStartDate ? queryParams.pinStartDate : '*',
      pinEndDate: queryParams.pinEndDate ? queryParams.pinEndDate : '*',
      unpinStartDate: queryParams.unpinStartDate ? queryParams.unpinStartDate : '*',
      unpinEndDate: queryParams.unpinEndDate ? queryParams.unpinEndDate : '*',
      selectedPinStatus: queryParams.selectedPinStatus ? queryParams.selectedPinStatus : 'all',
      pageLimit: queryParams.pageLimit ? queryParams.pageLimit : 10,
      pageOffset: queryParams.pageOffset ? queryParams.pageOffset : 0
    }
    let metadataQuery = ''
    if (queryParams.nameContains && !queryParams.keyvalues) {
      metadataQuery = `?metadata[name]=${queryParams.nameContains}`
    } else if (!queryParams.nameContains && queryParams.keyvalues) {
      const stringKeyValues = JSON.stringify(queryParams.keyvalues)
      metadataQuery = `?metadata[keyvalues]=${stringKeyValues}`
    } else if (queryParams.nameContains && queryParams.keyvalues) {
      const stringKeyValues = JSON.stringify(queryParams.keyvalues)
      metadataQuery = `?metadata[name]=${queryParams.nameContains}&metadata[keyvalues]=${stringKeyValues}`
    }
    const url = ipfsConfig.userPinListUrl + `${sanitizedParams.hashContains}/pinStart/${sanitizedParams.pinStartDate}/pinEnd/${sanitizedParams.pinEndDate}/unpinStart/${sanitizedParams.unpinStartDate}/unpinEnd/${sanitizedParams.unpinEndDate}/pinSizeMin/*/pinSizeMax/*/pinFilter/${sanitizedParams.selectedPinStatus}/pageLimit/${sanitizedParams.pageLimit}/pageOffset/${sanitizedParams.pageOffset}${metadataQuery}`
    return axios
      .post(
        url,
        {
          headers: ipfsConfig.headers
        }).then(function (response) {
        return response
      })
      .catch(function (error) {
        console.error('\nCaught exception: ' + error.response.data.error)
        return {}
      })
  }

  static testAuthentication () {
    const url = ipfsConfig.testAuthenticationUrl
    const headers = ipfsConfig.headers
    return axios
      .get(
        ipfsConfig.testAuthenticationUrl,
        {
          headers: ipfsConfig.headers
        }).then(function (response) {
        return response
      })
      .catch(function (error) {
        console.error('\nCaught exception: ' + error.response.data.error)
        return {}
      })
  }
}

export default IpfsApiService
