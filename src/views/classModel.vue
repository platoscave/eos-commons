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
    const classOctagonal = (ctx, x, y, width, height, radius) => {
      ctx.moveTo(x, y + height/3)
      ctx.moveTo(x, (y + height/3)*2)
      ctx.moveTo(x + width/2, y + height)
      ctx.moveTo(x + width, (y + height/3)*2)
      ctx.moveTo(x + width, y + height/3)
      ctx.moveTo(x + width/2, y)
    }

    // classOctagonal
    let classOctagonalShape = new THREE.Shape()
    classOctagonal(classOctagonalShape, 0, 0, WIDTH, HEIGHT, 20) // negative numbers not allowed
    // extruded shape
    let extrudeSettings = {
      depth: 10,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 1,
      bevelThickness: 1
    }
    this.classGeometry = new THREE.ExtrudeGeometry(classOctagonalShape, extrudeSettings)
    this.classGeometry.center()


    let loader = new THREE.JSONLoader(true)
    let fontLoader = new THREE.FontLoader()

    let promises = []
    promises.push(this.$store.dispatch('materializedView', this.viewId))
    promises.push(new Promise((resolve, reject) => {
      fontLoader.load('helvetiker_regular.typeface.json', (font) => {
        resolve(font)
      })
    }))
    return Promise.all(promises).then((resultsArr) => {
      this.view = resultsArr[0]
      this.font = resultsArr[1]

      this.classMaterial = new THREE.MeshLambertMaterial({color: 0x8904B1})
      this.objectMaterial = new THREE.MeshLambertMaterial({color: 0x00A300})

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
          /* this.collectAndDrawObjects(rootObj, minY).then(res => {
            // Tell the classes to draw their object connectors
            rootObj.drawObjectConnectors(this.modelObject3D)
            // Get an array of selectable meshes
            rootObj.collectSelectableMeshes(this.selectableMeshArr)
            // console.log('done', rootObj)
            // Highlight the slected object and naviagte to it.
            // To do this we just call the path observer.
            this.routePathChanged(this.route.path)
          }) */

          //rootObj.collectSelectableMeshes(this.selectableMeshArr)
        })
      })
    }, (err) => console.log(err))
  },
  methods: {
    collectAndDrawClasses (queryResult, position) {
      let obj = new classObject3d(this.classGeometry, this.classMaterial, position, queryResult, this.font)
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
    /*collectAndDrawObjects (object3D, minY) {
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
    },*/
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
    },
    drawClassConnectors (modelObject3D) {
      if (this.userData.children.length > 0) {
        let connectorMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
        // vertical beam from parent class
        let parentEndVector = new THREE.Vector3(this.position.x, this.position.y - 200, this.position.z)
        modelObject3D.add(this.drawBeam(this.position, parentEndVector, connectorMaterial))
        // horizontal beam
        let beamStartX = this.userData.children[0].position.x
        let beamEndX = this.userData.children[this.userData.children.length - 1].position.x
        let beamStartVector = new THREE.Vector3(beamStartX, this.position.y - 200, this.position.z)
        let beamtEndVector = new THREE.Vector3(beamEndX, this.position.y - 200, this.position.z)
        modelObject3D.add(this.drawBeam(beamStartVector, beamtEndVector, connectorMaterial))
        // sphere at the left end
        let sphereGeometryLeft = new THREE.SphereGeometry(10)
        let sphereMeshLeft = new THREE.Mesh(sphereGeometryLeft, connectorMaterial)
        sphereMeshLeft.position.set(beamStartVector.x, beamStartVector.y, beamStartVector.z)
        modelObject3D.add(sphereMeshLeft)
        // sphere at the right end
        let sphereGeometry = new THREE.SphereGeometry(10)
        let sphereMesh = new THREE.Mesh(sphereGeometry, connectorMaterial)
        sphereMesh.position.set(beamtEndVector.x, beamtEndVector.y, beamtEndVector.z)
        modelObject3D.add(sphereMesh)
        // for each of the child classes
        this.userData.children.forEach(function (child) {
          // beam from child class to horizontal beam
          let childStartVector = new THREE.Vector3(child.position.x, child.position.y + 200, child.position.z)
          modelObject3D.add(this.drawBeam(childStartVector, child.position, connectorMaterial))
          // tell the child class to do the same
          child.drawClassConnectors(modelObject3D)
        }.bind(this))
      }
    },
    drawObjectConnectors (modelObject3D) {
      if (this.userData.instances.length > 0) {
        let endVector = this.userData.instances[this.userData.instances.length - 1].position
        modelObject3D.add(this.drawBeam(this.position, endVector, this.userData.connectorMaterial))
      }
      this.userData.children.forEach(function (child) {
        child.drawObjectConnectors(modelObject3D)
      })
    },
    drawBeam (p1, p2, material, sceneObject3D, name) {
      // https://stackoverflow.com/questions/15139649/three-js-two-points-one-cylinder-align-issue/15160850#15160850
      let HALF_PI = Math.PI * 0.5
      let distance = p1.distanceTo(p2)
      let position = p2.clone().add(p1).divideScalar(2)
      let cylinder = new THREE.CylinderGeometry(10, 10, distance, 10, 10, false)
      let orientation = new THREE.Matrix4()// a new orientation matrix to offset pivot
      let offsetRotation = new THREE.Matrix4()// a matrix to fix pivot rotation
      let offsetPosition = new THREE.Matrix4()// a matrix to fix pivot position
      orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0))// look at destination
      offsetRotation.makeRotationX(HALF_PI)// rotate 90 degs on X
      orientation.multiply(offsetRotation)// combine orientation with rotation transformations
      cylinder.applyMatrix(orientation)
      let mesh = new THREE.Mesh(cylinder, material)
      mesh.position.set(position.x, position.y, position.z)
      return mesh
      /* let diffVector = new THREE.Vector3()
      diffVector.subVectors(p2, p1)
      let beamVector = new THREE.Vector3(0, 1, 0)
      let theta = beamVector.angleTo(diffVector)
      let rotationAxis = new THREE.Vector3()
      rotationAxis.crossVectors(beamVector, diffVector)
      if (rotationAxis.length() < 0.000001) {
        // Special case: if rotationAxis is just about zero, set to X axis,
        // so that the angle can be given as 0 or PI. This works ONLY
        // because we know one of the two axes is +Y.
        rotationAxis.set(1, 0, 0)
      }
      rotationAxis.normalize()
      let postionVec = new THREE.Vector3()
      postionVec.copy(diffVector)
      postionVec.divideScalar(2)
      postionVec.add(p1)
      let orientation = new THREE.Matrix4()
      orientation.matrixAutoUpdate = false
      orientation.makeRotationAxis(rotationAxis, theta)
      orientation.setPosition(postionVec)
      let beamLength = diffVector.length()
      let beamGeometry = new THREE.CylinderGeometry(10, 10, beamLength, 12, 1, true)
      beamGeometry.applyMatrix(orientation)// apply transformation for geometry
      let beamMesh = new THREE.Mesh(beamGeometry, beamMaterial)
      // beamMesh.position.set(p2.x,p2.y,p2.z)
      if (name) {
        let textMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
        let text3d = new THREE.TextGeometry(name, {size: 30, height: 1, font: 'helvetiker'})
        let textMesh = new THREE.Mesh(text3d, textMaterial)
        text3d.computeBoundingBox()
        let xOffset = -0.5 * (text3d.boundingBox.max.x - text3d.boundingBox.min.x)
        textMesh.position = postionVec
        textMesh.position.x += xOffset
        textMesh.position.z += 20
        textMesh.rotation.y = Math.PI * 2
        sceneObject3D.add(textMesh)
      }
      return (beamMesh) */
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
