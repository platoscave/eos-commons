<template>
    <div class="webglContainer" v-resize="onResize">
    </div>
</template>

<script>
import Scene from '../lib/sceneMixin.js'
import classObject3d from '../lib/classObject3d.js'

export default {
  name: 'classModel',
  mixins: [Scene],
  data () {
    return {
      skyboxArray: [
        'space_3_right.jpg',
        'space_3_left.jpg',
        'space_3_top.jpg?',
        'space_3_bottom.jpg',
        'space_3_front.jpg',
        'space_3_back.jpg'
      ]
    }
  },
  methods: {
    collectAndDrawClasses (queryResult, position) {
      let obj = new classObject3d(
        queryResult,
        position,
        this.classGeometry,
        this.classMaterial,
        this.font,
        this.textMaterial,
        this.connectorMaterial)
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

      return this.$store.dispatch('queryArrObj', queryArrObj).then((resultsArr) => {
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
    },
    collectAndDrawObjects (object3D, minY) {
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
          object3D.userData.instances.push(obj)
          minY -= 400
        }.bind(this))
        let promises = []
        object3D.userData.children.forEach(function (child) {
          promises.push(this.collectAndDrawObjects(child, minY))
        }.bind(this))
        return Promise.all(promises)
      })
    },
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
  },
  mounted () {
    this.classMaterial = new THREE.MeshLambertMaterial({color: 0x8904B1})
    this.objectMaterial = new THREE.MeshLambertMaterial({color: 0x00A300})// 0x00A300
    this.connectorMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
    this.textMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
    let loader = new THREE.JSONLoader(true)
    let fontLoader = new THREE.FontLoader()

    let promises = []
    promises.push(this.$store.dispatch('materializedView', this.viewId))
    promises.push(new Promise((resolve, reject) => {
      loader.load('classMesh.json', (geometry, materials) => {
        resolve(geometry)
      })
    }))
    promises.push(new Promise((resolve, reject) => {
      loader.load('objectMesh.json', (geometry, materials) => {
        resolve(geometry)
      })
    }))
    promises.push(new Promise((resolve, reject) => {
      fontLoader.load('helvetiker_regular.typeface.json', (font) => {
        resolve(font)
      })
    }))
    return Promise.all(promises).then((resultsArr) => {
      this.view = resultsArr[0]
      this.classGeometry = resultsArr[1]
      this.objectGeometry = resultsArr[2]
      this.font = resultsArr[3]

      let viewQueryObj = this.viewRootQueryObj()
      this.$store.dispatch('query', viewQueryObj).then((resultsArr) => {
        // Collect all the classes that we will be using.
        // This is done recursively and asynchronously. the result is promise to the rootObject3D.
        this.collectAndDrawClasses(resultsArr[0], new THREE.Vector3(0, 0, 0)).then(rootObj => {
          this.rootObject3D = rootObj
          // Determine and set the x position, depending on children width
          rootObj.calculateX(0)
          // Shift the model to the left so that the camera is looking at it
          this.modelObject3D.position.set(-(rootObj.position.x), 0, 0)
          // Tell the classes to draw their connectors
          rootObj.drawClassConnectors(this.modelObject3D)
          // Get the lowest Y so we know where to start drawing objects
          let minY = rootObj.findMinY() - 400
          // Collect all the objects that we will be using.
          // This is done recusivly and asyncronosly.
          this.collectAndDrawObjects(rootObj, minY).then(res => {
            // Tell the classes to draw their object connectors
            rootObj.drawObjectConnectors(this.modelObject3D)
            // Get an array of selectable meshes
            rootObj.collectSelectableMeshes(this.selectableMeshArr)
            // console.log('done', rootObj)
            // Highlight the slected object and naviagte to it.
            // To do this we just call the path observer.
            this.routePathChanged(this.route.path)
          })
        })
      })
    }, (err) => console.log(err))
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
