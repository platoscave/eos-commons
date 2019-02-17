import * as THREE from 'three'
import Vue from 'vue'
import classModelColors from '../config/classModelColors'

const WIDTH = 400
const HEIGHT = 200
const DEPTH = 100
const RADIUS = 50

export default class ClassObject3d extends THREE.Object3D {
  constructor (queryResult, font) {
    super()

    this.key = queryResult.id
    this.cid = queryResult.cid
    this.name = queryResult.name ? queryResult.name : queryResult.title
    this.userData = queryResult
    this.font = font
    let mesh = new THREE.Mesh(this.getGeometry(), this.getMaterial())
    this.add(mesh)
    let textPosition = this.position.clone()
    textPosition.setZ(textPosition.z + DEPTH / 2 + 20)
    this.addTextMesh(this.name, textPosition)
  }
  drawClassConnectors (placeholderObj3d) {
    if (this.subclassesObj3ds.length > 0) {
      let connectorMaterial = this.mapAssocNameToMaterial()

      let ourWorldPosition = new THREE.Vector3()
      this.getWorldPosition(ourWorldPosition)

      // vertical beam from parent class
      let parentEndPosition = new THREE.Vector3(0, HEIGHT * -2, 0)
      this.add(this.drawBeam(new THREE.Vector3(), parentEndPosition, connectorMaterial))

      // horizontal beam
      let beamStartPos = this.subclassesObj3ds[0].position.clone()
      beamStartPos.sub(ourWorldPosition)
      beamStartPos.setY(HEIGHT * -2)
      let beamEndPos = this.subclassesObj3ds[this.subclassesObj3ds.length - 1].position.clone()
      beamEndPos.sub(ourWorldPosition)
      beamEndPos.setY(HEIGHT * -2)
      this.add(this.drawBeam(beamStartPos, beamEndPos, connectorMaterial))

      // sphere at the left end
      let sphereGeometryLeft = new THREE.SphereGeometry(15)
      let sphereMeshLeft = new THREE.Mesh(sphereGeometryLeft, connectorMaterial)
      sphereMeshLeft.position.set(beamStartPos.x, beamStartPos.y, beamStartPos.z)
      this.add(sphereMeshLeft)
      // sphere at the right end
      let sphereGeometry = new THREE.SphereGeometry(15)
      let sphereMesh = new THREE.Mesh(sphereGeometry, connectorMaterial)
      sphereMesh.position.set(beamEndPos.x, beamEndPos.y, beamEndPos.z)
      this.add(sphereMesh)

      // for each of the child classes
      this.subclassesObj3ds.forEach(childObj3d => {
        // beam from child class to horizontal beam
        let childBeamStartPos = childObj3d.position.clone()
        childBeamStartPos.sub(ourWorldPosition)
        childBeamStartPos.setY(HEIGHT * -2)
        let childBeamEndPos = childObj3d.position.clone()
        childBeamEndPos.sub(ourWorldPosition)
        childBeamEndPos.setY(HEIGHT * -4)
        this.add(this.drawBeam(childBeamStartPos, childBeamEndPos, connectorMaterial))
        childObj3d.drawClassConnectors(placeholderObj3d)
        childObj3d.drawClassAssocs(placeholderObj3d)
      })
    }
  }
  drawClassAssocs (placeholderObj3d) {
    const getAssocs = (properties) => {
      let resultsArr = []
      Object.keys(properties).forEach(key => {
        let obj = properties[key]
        let toCid = Vue._.get(obj, 'query.from')
        if (toCid && toCid !== 'classes') resultsArr.push({ key: key, name: obj.title, cid: toCid })
        let subProperties = Vue._.get(obj, 'items.properties')
        if (subProperties) resultsArr = resultsArr.concat(getAssocs(subProperties))
      })
      return resultsArr
    }

    let properties = Vue._.get(this, 'userData.properties')
    if (!properties) return
    let assocsArr = getAssocs(properties)
    // console.log('assocsArr', assocsArr)

    let ourWorldPosition = new THREE.Vector3()
    this.getWorldPosition(ourWorldPosition)

    assocsArr.forEach(assoc => {
      let assocToObj3d = placeholderObj3d.getObjectByProperty('key', assoc.cid)

      this.drawTubeTopSideToBottom(assocToObj3d, assoc.key)
    })

    // for each of the child classes
    /* this.subclassesObj3ds.forEach(childObj3d => {
      childObj3d.drawClassAssocs(placeholderObj3d)
    }) */
  }
  drawObjectConnectors (length) {
    let fomPos = new THREE.Vector3(0, -HEIGHT / 4, 0)
    let toPos = fomPos.clone()
    toPos.setZ(length)
    let connectorMaterial = new THREE.MeshLambertMaterial({ color: 0xEFEFEF })
    this.add(this.drawBeam(fomPos, toPos, connectorMaterial))
  }
  drawObjectAssocs (placeholderObj3d) {
    const getAssocs = (properties) => {
      let resultsArr = []
      Object.keys(properties).forEach(key => {
        let obj = properties[key]
        if (key !== 'ownerId') {
          let nameColor = classModelColors.nameColor[key]
          // if (nameColor) console.log('obj.constructor', obj.constructor, obj)
          if (nameColor && nameColor !== 'ownerId' && obj.constructor === String) resultsArr.push({ name: key, cid: obj })
        }
        if (Array.isArray(obj)) {
          obj.forEach(subObj => {
            resultsArr = resultsArr.concat(getAssocs(subObj))
          })
        }
      })
      return resultsArr
    }
    if (!this.userData) return
    let assocsArr = getAssocs(this.userData)
    assocsArr.forEach(assoc => {
      let assocToObj3d = placeholderObj3d.getObjectByProperty('key', assoc.cid)
      if (!assocToObj3d) console.warn('Cant find ' + assoc.cid + ' from ' + this.name + ': ' + this.cid)
      else this.drawTubeTopSideToBottom(assocToObj3d, assoc.name)
    })
  }
  drawBeam (p1, p2, material, sceneObject3D, name) {
    // https://stackoverflow.com/questions/15139649/three-js-two-points-one-cylinder-align-issue/15160850#15160850
    let HALF_PI = Math.PI * 0.5
    let distance = p1.distanceTo(p2)
    let position = p2.clone().add(p1).divideScalar(2)
    let cylinder = new THREE.CylinderGeometry(15, 15, distance, 10, 10, false)
    let orientation = new THREE.Matrix4()// a new orientation matrix to offset pivot
    let offsetRotation = new THREE.Matrix4()// a matrix to fix pivot rotation
    // let offsetPosition = new THREE.Matrix4()// a matrix to fix pivot position
    orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0))// look at destination
    offsetRotation.makeRotationX(HALF_PI)// rotate 90 degs on X
    orientation.multiply(offsetRotation)// combine orientation with rotation transformations
    cylinder.applyMatrix(orientation)
    let mesh = new THREE.Mesh(cylinder, material)
    mesh.position.set(position.x, position.y, position.z)
    return mesh
  }
  drawTubeTopSideToBottom (toObj3d, name) {
    // translate toPosition to our local coordinates
    let toPosition = toObj3d.position.clone()
    toPosition.applyMatrix4(new THREE.Matrix4().getInverse(this.matrix))

    let material = this.mapAssocNameToMaterial(name)

    let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false)
    let coneMesh = new THREE.Mesh(coneGeometry, material)

    let fromPos, toPos
    let points = []

    if (toObj3d.userData.docType === 'class') {
      fromPos = this.getSidePos('back', new THREE.Vector3())
      toPos = this.getSidePos('back', toPosition)
      let endPos = toPos.clone()
      endPos.setZ(endPos.z - 60)

      let assocDepth = (this.mapAssocNameToDepth(name) * DEPTH * 2) + (DEPTH * 2)

      points.push(fromPos)
      points.push(new THREE.Vector3(fromPos.x, fromPos.y, fromPos.z - assocDepth))
      if (toPos.y !== fromPos.y) points.push(new THREE.Vector3(fromPos.x, toPos.y, fromPos.z - assocDepth))
      points.push(new THREE.Vector3(toPos.x, toPos.y, toPos.z - assocDepth))
      points.push(endPos)

      coneMesh.rotation.x = Math.PI / 2
      coneMesh.position.set(toPos.x, toPos.y, toPos.z - 40)
    } else if (toPosition.y < 0) {
      fromPos = this.getSidePos('bottom', new THREE.Vector3())
      toPos = this.getSidePos('top', toPosition)
      let endPos = toPos.clone()
      endPos.setY(endPos.y + 60)

      points.push(fromPos)
      points.push(new THREE.Vector3(fromPos.x, fromPos.y - HEIGHT * 1.5, fromPos.z))
      if (toPos.x !== fromPos.x) points.push(new THREE.Vector3(toPos.x, fromPos.y - HEIGHT * 1.5, fromPos.z))
      points.push(new THREE.Vector3(toPos.x, toPos.y + HEIGHT * 1.5, toPos.z))
      points.push(endPos)

      coneMesh.rotation.z = -Math.PI
      coneMesh.position.set(toPos.x, toPos.y + 40, toPos.z)
    } else if (toPosition.y > 0) {
      fromPos = this.getSidePos('top', new THREE.Vector3())
      toPos = this.getSidePos('bottom', toPosition)
      let endPos = toPos.clone()
      endPos.setY(endPos.y - 60)

      points.push(fromPos)
      points.push(new THREE.Vector3(fromPos.x, fromPos.y + HEIGHT * 1.5, fromPos.z))
      if (toPos.x !== fromPos.x) points.push(new THREE.Vector3(toPos.x, fromPos.y + HEIGHT * 1.5, fromPos.z))
      points.push(new THREE.Vector3(toPos.x, toPos.y - HEIGHT * 1.5, toPos.z))
      points.push(endPos)

      coneMesh.position.set(toPos.x, toPos.y - 40, toPos.z)
    } else {
      fromPos = this.getSidePos('bottom', new THREE.Vector3())
      toPos = this.getSidePos('bottom', toPosition)
      let endPos = toPos.clone()
      endPos.setY(endPos.y - 60)

      points.push(fromPos)
      points.push(new THREE.Vector3(fromPos.x, fromPos.y - HEIGHT * 1.5, fromPos.z))
      if (toPos.x !== fromPos.x) points.push(new THREE.Vector3(toPos.x, fromPos.y - HEIGHT * 1.5, fromPos.z))
      points.push(new THREE.Vector3(toPos.x, toPos.y - HEIGHT * 1.5, toPos.z))
      points.push(endPos)

      coneMesh.position.set(toPos.x, toPos.y - 40, toPos.z)
    }

    let path = new THREE.CatmullRomCurve3(this.straightenPoints(points))
    let geometry = new THREE.TubeGeometry(path, 128, 7, 8, false)
    let mesh = new THREE.Mesh(geometry, material)
    this.add(mesh)

    this.add(coneMesh)

    this.addTextMeshBetween(name, points[1], points[2])
  }
  mapAssocNameToMaterial (name) {
    let nameColor = classModelColors.nameColor[name]
    if (nameColor) return new THREE.MeshLambertMaterial({ color: nameColor.color })
    if (name) console.warn('Add color to classModelColors', name)
    return new THREE.MeshLambertMaterial({ color: 0xEFEFEF }) // grey, class connectors
  }
  mapAssocNameToDepth (name) {
    let nameColor = classModelColors.nameColor[name]
    if (nameColor) return nameColor.depth
    return 0
  }
  getMaterial () {
    let nameColor = classModelColors.nameColor[this.userData.docType]
    if (nameColor) return new THREE.MeshLambertMaterial({ color: nameColor.color })
    return new THREE.MeshLambertMaterial({ color: 0x00A300 }) // green
  }
  getSidePos (side, pos) {
    if (side === 'top') return new THREE.Vector3(pos.x, pos.y + HEIGHT / 2, pos.z)
    if (side === 'right') return new THREE.Vector3(pos.x + WIDTH / 2, pos.y, pos.z)
    if (side === 'bottom') return new THREE.Vector3(pos.x, pos.y - HEIGHT / 2, pos.z)
    if (side === 'left') return new THREE.Vector3(pos.x - WIDTH / 2, pos.y, pos.z)
    if (side === 'front') return new THREE.Vector3(pos.x, pos.y, pos.z + DEPTH / 2)
    if (side === 'back') return new THREE.Vector3(pos.x, pos.y, pos.z - DEPTH / 2)
    return pos
  }
  getGeometry () {
    const classHexagonal = (ctx, x, y, width, height, radius) => {
      ctx.moveTo(x, y + height / 3)
      ctx.moveTo(x, (y + height / 3) * 2)
      ctx.moveTo(x + width / 2, y + height)
      ctx.moveTo(x + width, (y + height / 3) * 2)
      ctx.moveTo(x + width, y + height / 3)
      ctx.moveTo(x + width / 2, y)
    }
    const objectPentagonal = (ctx, x, y, width, height, radius) => {
      ctx.moveTo(x, y)
      ctx.moveTo(x, y + height / 2)
      ctx.moveTo(x + width / 2, y + height)
      ctx.moveTo(x + width, y + height / 2)
      ctx.moveTo(x + width, y)
    }
    let shape = new THREE.Shape()
    if (this.userData.docType === 'class') classHexagonal(shape, 0, 0, WIDTH, HEIGHT, 20)
    else objectPentagonal(shape, 0, 0, WIDTH, HEIGHT, 20)

    // extruded shape
    let extrudeSettings = { depth: DEPTH, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 }
    let geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    geometry.center()
    let buffgeom = new THREE.BufferGeometry()
    buffgeom.fromGeometry(geometry)
    return buffgeom
  }
  straightenPoints (points) {
    let newPoints = []
    points.forEach((point, i) => {
      if (i === 0) newPoints.push(point)
      else {
        let direction = new THREE.Vector3()
        direction.subVectors(point, points[i - 1])
        direction.setLength(RADIUS)
        let newPoint = new THREE.Vector3()
        newPoint.subVectors(point, direction)
        newPoints.push(newPoint)
        if (i < points.length - 1) {
          let direction = new THREE.Vector3()
          direction.subVectors(point, points[i + 1])
          direction.setLength(RADIUS)
          let newPoint = new THREE.Vector3()
          newPoint.subVectors(point, direction)
          newPoints.push(newPoint)
        } else newPoints.push(point)
      }
    })
    return newPoints
  }
  addTextMeshBetween (name, pointA, pointB) {
    let textPosition = new THREE.Vector3()
    textPosition.subVectors(pointB, pointA).divideScalar(2)
    textPosition.add(pointA)
    textPosition.setZ(textPosition.z + 20)
    this.addTextMesh(name, textPosition)
  }
  addTextMesh (name, textPosition) {
    let textMaterial = new THREE.MeshLambertMaterial({ color: 0xEFEFEF })
    let text3d = new THREE.TextGeometry(name, { size: 30, height: 1, font: this.font })
    text3d.center()
    let textMesh = new THREE.Mesh(text3d, textMaterial)
    textMesh.position.set(textPosition.x, textPosition.y, textPosition.z)
    this.add(textMesh)
  }
}
