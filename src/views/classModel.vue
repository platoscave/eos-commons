<template>
    <div class="webglContainer" v-resize="onResize" v-on:click="onClick">
    </div>
</template>

<script>
import Scene from '../lib/sceneMixin.js'
import classObject3d from '../lib/classObject3d.js'

const WIDTH = 400
const HEIGHT = 200

export default {
  name: 'classModel',
  mixins: [Scene],
  data () {
    return {
      /* skyboxArray: [
        'grass/sbox_px.jpg',
        'grass/sbox_nx.jpg',
        'grass/sbox_py.jpg',
        'grass/sbox_ny.jpg',
        'grass/sbox_pz.jpg',
        'grass/sbox_nz.jpg'
      ] */
      skyboxArray: [
        'milkyway/posx.jpg',
        'milkyway/negx.jpg',
        'milkyway/posy.jpg',
        'milkyway/negy.jpg',
        'milkyway/posz.jpg',
        'milkyway/negz.jpg'
      ]
      /* skyboxArray: [
        'jupiter/space_3_right.jpg',
        'jupiter/space_3_left.jpg',
        'jupiter/space_3_top.jpg',
        'jupiter/space_3_bottom.jpg',
        'jupiter/space_3_front.jpg',
        'jupiter/space_3_back.jpg'
      ] */
    }
  },
  mounted () {
    // Wait for DOM updated. Vue.nextTick() does not work
    setTimeout(() => {
      let fontLoader = new THREE.FontLoader()
      fontLoader.load('helvetiker_regular.typeface.json', (font) => {
        this.font = font
        let queryObj = {
          query: {
            where: {
              docProp: '$key',
              operator: 'eq',
              value: '56f86c6a5dde184ccfb9fc6a'
            }
          }
        }
        this.$store.dispatch('query2', queryObj).then((resultsObj) => {
          let key = Object.keys(resultsObj)[0]
          let rootClass = resultsObj[key]
          rootClass.id = key
          let placeholderObject3d = new THREE.Object3D()
          this.modelObject3D.add(placeholderObject3d)

          this.collectClasses(placeholderObject3d, rootClass).then(res => {

            let rootClassObj3d = placeholderObject3d.getObjectByProperty('key', rootClass.id)
            let maxX = this.setPositionX(placeholderObject3d, rootClassObj3d, 0)
            let minY = this.setPositionY(placeholderObject3d, rootClassObj3d, 0)

            rootClassObj3d.drawClassConnectors (placeholderObject3d)

          })
        })
      }, (err) => console.log(err))
    }, 1000)
  },
  methods: {
    collectClasses (placeholderObject3d, classObj) {
      let rootClassObj3d = new classObject3d(classObj, this.font)
      placeholderObject3d.add(rootClassObj3d)
      this.selectableMeshArr.push(rootClassObj3d.children[0])
      let queryObj = {
        query: {
          where: {
            docProp: 'parentId',
            operator: 'eq',
            value: classObj.id
          }
        }
      }
      return this.$store.dispatch('query2', queryObj).then((resultsObj) => {
        let promises = []
        Object.keys(resultsObj).forEach(key => {
            let subClassObj = resultsObj[key]
            subClassObj.id = key
            promises.push(this.collectClasses(placeholderObject3d, subClassObj))
        })
        return Promise.all(promises).then(childObjsArr => {
          classObj.subclasses = childObjsArr
          return (classObj)
        })
      })
    },
    setPositionX (placeholderObject3d, classObj3d, x) {
      let minX = x
      let maxX = x
      classObj3d.userData.subclasses.forEach(subClass => {
        let subClassObj3d = placeholderObject3d.getObjectByProperty('key', subClass.id)
        maxX = Math.max(x, this.setPositionX(placeholderObject3d, subClassObj3d, x))
        x = maxX + WIDTH * 2
      })
      classObj3d.position.setX(minX + (maxX - minX) / 2)
      return maxX
    },
    setPositionY (placeholderObject3d, classObj3d, y) {
      classObj3d.position.setY(y)
      let minY = y
      classObj3d.userData.subclasses.forEach(subClass => {
        let subClassObj3d = placeholderObject3d.getObjectByProperty('key', subClass.id)
        minY = Math.min(y, this.setPositionY(placeholderObject3d, subClassObj3d, y - HEIGHT * 2))
      })
      return minY
    },
    /* collectAndDrawClasses (queryResult, position) {
      let obj = new classObject3d(position, queryResult, this.font)
      this.selectableMeshArr.push(obj.children[0])
      this.modelObject3D.add(obj)

      this.render()

      let x = position.x
      let y = position.y - 400
      let z = position.z

      const queryArrObj = {
        fk: queryResult.id,
        level: this.level,
        queryArr: queryResult.data.queryArr,
        queryNames: queryResult.data.queryNames
      }

      return this.$store.dispatch('treeQueryArr', queryArrObj).then((resultsArr) => {
        let promises = []
        resultsArr.forEach(function (subQueryResult) {
          // console.log(subClassSnap.key, subClassSnap.val().title)
          promises.push(this.collectAndDrawClasses(subQueryResult, new THREE.Vector3(x, y, z)))
          x += 800
        }.bind(this))
        return Promise.all(promises).then(childObjsArr => {
          obj.userData.children = childObjsArr
          // console.log('childObjsArr', childObjsArr)
          return (obj)
        })
      })
    }, */
    /* collectAndDrawObjects (object3D, minY) {
      let ref = firebase.database().ref('documents')
      return ref.orderByChild('classId').equalTo(object3D.userData.key).once('value').then(snapshot => {
        snapshot.forEach(function (subClassSnap) {
          // console.log(subClassSnap.key, subClassSnap.val().title)
          let obj = new classObject3d(
            subClassSnap.val(),
            subClassSnap.key,
            new THREE.Vector3(object3D.position.x, minY, object3D.position.z),
            this.objectGeometry,
            this.objectMaterial,
            this.font,
            this.textMaterial,
            this.connectorMaterial)
          this.modelObject3D.add(obj)
          this.selectableMeshArr.push(obj.children[0])
          object3D.userData.instances.push(obj)
          minY -= 400
        }.bind(this))
        let promises = []
        object3D.userData.children.forEach(function (child) {
          promises.push(this.collectAndDrawObjects(child, minY))
        }.bind(this))
        return Promise.all(promises)
      })
    }, */
    viewRootQueryObj: function () {
      const getQueriesByName = (query) => {
        let queryNames = {}
        if (query.queryName) queryNames[query.queryName] = query
        if (query.join) {
          query.join.forEach((item) => {
            queryNames = Object.assign(queryNames, getQueriesByName(item))
          })
        }
        return queryNames
      }
      const queryNames = getQueriesByName(this.view.query)

      return {fk: null, query: this.view.query, queryNames: queryNames, level: this.level}
    }
  }
}
</script>

<style scoped>
    .webglContainer {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        margin: 0;
        border: 0;
        padding: 0;
    }
</style>
