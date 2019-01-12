global.THREE = require('../../node_modules/three/three.js')
const TrackballControls = require('../../node_modules/three/examples/js/controls/TrackballControls.js')
const Detector = require('../../node_modules/three/examples/js/Detector.js')

export default class modelObject3d extends THREE.Object3D {
  constructor (geometry, material, pos, queryResult, font) {
    super()

    this.key = queryResult.id
    this.name = queryResult.name ? queryResult.name : queryResult.text
    this.userData = queryResult
    this.material = material
    // this.userData.children = []
    // this.userData.instances = []
    this.position.set(pos.x, pos.y, pos.z)
    let mesh = new THREE.Mesh(geometry, material)
    this.add(mesh)
    let text3d = new THREE.TextGeometry(this.name, {size: 30, height: 1, font: font})
    text3d.computeBoundingBox()
    let xOffset = -0.5 * (text3d.boundingBox.max.x - text3d.boundingBox.min.x)
    let yOffset = -0.5 * (text3d.boundingBox.max.y - text3d.boundingBox.min.y)
    let textMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
    let textMesh = new THREE.Mesh(text3d, textMaterial)
    textMesh.position.x = xOffset
    textMesh.position.y = yOffset
    textMesh.position.z = 55
    textMesh.rotation.x = 0
    textMesh.rotation.y = Math.PI * 2
    this.add(textMesh)
  }
  calculateX (x) {
    let ourX = x
    let maxXUntilNow = x
    this.userData.children.forEach(function (child) {
      maxXUntilNow = child.calculateX(x)
      x = maxXUntilNow + 800
    })
    if (this.userData.children.length > 1) {
      let minX = this.userData.children[0].position.x
      let maxX = this.userData.children[(this.userData.children.length - 1)].position.x
      ourX = (maxX - minX) / 2 + minX
    }
    this.position.set(ourX, this.position.y, this.position.z)
    return maxXUntilNow
  }
  collectSelectableMeshes (selectableMeshArr) {
    selectableMeshArr.push(this.children[0])
    this.userData.instances.forEach(function (child) {
      selectableMeshArr.push(child.children[0])
    })
    this.userData.children.forEach(function (child) {
      child.collectSelectableMeshes(selectableMeshArr)
    })
  }
  /* getModelObject3DByKey (key) {
    if (this.key === key) return this
    let resObj = this.userData.instances.find(function (child) {
      return (child.key === key)
    })
    if (resObj) return resObj
    this.userData.children.some(function (child) {
      let obj = child.getModelObject3DByKey(key)
      if (obj) {
        resObj = obj
        return true
      }
    })
    return resObj
  }
  selectByKey (key) {
    // Select/unselect this Objec3D
    if (this.userData.key === key) this.children[0].material = new THREE.MeshLambertMaterial({color: 0xFFFF33})
    else this.children[0].material = this.userData.material
    this.userData.instances.forEach(function (child) {
      // Select/unselect child Objec3D
      if (child.userData.key === key) child.children[0].material = new THREE.MeshLambertMaterial({color: 0xFFFF33})
      else child.children[0].material = child.userData.material
    })
    this.userData.children.forEach(function (child) {
      child.selectByKey(key)
    })
  } */
  findMinY () {
    let minYUntilNow = this.position.y
    this.userData.children.forEach(function (child) {
      let minY = child.findMinY()
      minYUntilNow = minY < minYUntilNow ? minY : minYUntilNow
    })
    return minYUntilNow
  }
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
  }
  drawObjectConnectors (modelObject3D) {
    if (this.userData.instances.length > 0) {
      let endVector = this.userData.instances[this.userData.instances.length - 1].position
      modelObject3D.add(this.drawBeam(this.position, endVector, this.userData.connectorMaterial))
    }
    this.userData.children.forEach(function (child) {
      child.drawObjectConnectors(modelObject3D)
    })
  }
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
