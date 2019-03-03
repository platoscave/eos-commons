import * as THREE from 'three'
import processModelColors from '../config/processModelColors'
import fontJson from '../assets/helvetiker_regular.typeface.json'
const font = new THREE.Font(fontJson)

const WIDTH = 400
const HEIGHT = 200
const DEPTH = 100
const RADIUS = 50

export default class ProcessObject3d extends THREE.Object3D {
  constructor (queryResult) {
    super()

    this.key = queryResult.id
    this.name = queryResult.name ? queryResult.name : queryResult.title
    this.userData = queryResult
    let mesh = new THREE.Mesh(this.getGeometry(), this.getMaterial())
    // let helper = new THREE.VertexNormalsHelper(mesh, 20, 0x00ff00, 1)
    // this.add(helper)
    this.add(mesh)
    let textPosition = this.position.clone()
    textPosition.setZ(textPosition.z + DEPTH / 2 + 20)
    this.addTextMesh(this.name, textPosition)
  }
  drawSubstateConnectors (placeholderObject3d, returnState) {
    if (!this.userData.nextStateIds) return
    this.userData.nextStateIds.forEach(nextStateActionId => {
      if (nextStateActionId.stateId) {
        let toState = placeholderObject3d.getObjectByProperty('key', nextStateActionId.stateId)
        this.drawTubeRightSideToLeftSide(toState, nextStateActionId.action)
        toState.drawSubstateConnectors(placeholderObject3d, returnState)
      } else {
        this.drawTubeRightSideToBottom(returnState, nextStateActionId.action)
      }
    })
  }
  drawTubeBottomToLeftSide (toState, name) {
    // translate toPosition to our local coordinates
    let toPosition = toState.position.clone()
    toPosition.applyMatrix4(new THREE.Matrix4().getInverse(this.matrix))

    let material = this.mapActionNameToMaterial(name)

    let fromPos = this.getSidePos('bottom', new THREE.Vector3())
    fromPos.setX(fromPos.x - WIDTH / 4)
    let toPos = this.getSidePos('left', toPosition)
    let endPos = toPos.clone()
    endPos.setX(endPos.x - 60)

    let points = []
    points.push(fromPos)
    points.push(new THREE.Vector3(fromPos.x, fromPos.y - HEIGHT, fromPos.z))
    points.push(new THREE.Vector3(toPos.x - WIDTH / 2, fromPos.y - HEIGHT, toPos.z))
    points.push(new THREE.Vector3(toPos.x - WIDTH / 2, toPos.y, toPos.z))
    points.push(endPos)

    this.addTextMeshBetween(name, points[1], points[2])

    let path = new THREE.CatmullRomCurve3(this.straightenPoints(points))
    let geometry = new THREE.TubeGeometry(path, 64, 10, 8, false)
    let mesh = new THREE.Mesh(geometry, material)
    this.add(mesh)

    let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false)
    let rightCone = new THREE.Mesh(coneGeometry, material)
    rightCone.position.set(toPos.x - 40, toPos.y, toPos.z)
    rightCone.rotation.z = -Math.PI / 2
    this.add(rightCone)
  }
  drawTubeRightSideToBottom (toState, name) {
    // translate toPosition to our local coordinates
    let toPosition = new THREE.Vector3()
    toPosition.subVectors(toState.position, this.position)

    let material = this.mapActionNameToMaterial(name)

    let fromPos = this.getSidePos('right', new THREE.Vector3())
    let toPos = this.getSidePos('bottom', toPosition)
    toPos.setX(toPos.x + WIDTH / 4)
    let endPos = toPos.clone()
    endPos.setY(endPos.y - 60)

    let points = []
    points.push(fromPos)
    points.push(new THREE.Vector3(fromPos.x + WIDTH / 2, fromPos.y, fromPos.z))
    points.push(new THREE.Vector3(fromPos.x + WIDTH / 2, toPos.y - HEIGHT * 2, toPos.z))
    points.push(new THREE.Vector3(toPos.x, toPos.y - HEIGHT * 2, toPos.z))
    points.push(endPos)

    this.addTextMeshBetween(name, points[1], points[2])

    let path = new THREE.CatmullRomCurve3(this.straightenPoints(points))
    let geometry = new THREE.TubeGeometry(path, 64, 10, 8, false)
    let mesh = new THREE.Mesh(geometry, material)
    this.add(mesh)

    let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false)
    let rightCone = new THREE.Mesh(coneGeometry, material)
    rightCone.position.set(toPos.x, toPos.y - 40, toPos.z)
    this.add(rightCone)
  }
  drawTubeRightSideToLeftSide (toState, name) {
    // translate toPosition to our local coordinates
    let toPosition = new THREE.Vector3()
    toPosition.subVectors(toState.position, this.position)

    let material = this.mapActionNameToMaterial(name)

    let fromPos = this.getSidePos('right', new THREE.Vector3())
    let toPos = this.getSidePos('left', toPosition)
    let endPos = toPos.clone()
    endPos.setX(endPos.x - 60)

    let points = []
    if (toPos.x - fromPos.x <= WIDTH && toPos.y === fromPos.y) {
      points.push(fromPos)
      points.push(endPos)
      this.addTextMeshBetween(name, points[0], points[1])
    } else {
      points.push(fromPos)
      points.push(new THREE.Vector3(fromPos.x + WIDTH / 2, fromPos.y, fromPos.z))
      points.push(new THREE.Vector3(toPos.x - WIDTH / 2, toPos.y, toPos.z))
      points.push(endPos)
      this.addTextMeshBetween(name, points[1], points[2])
    }

    let path = new THREE.CatmullRomCurve3(points)
    let geometry = new THREE.TubeGeometry(path, 64, 10, 8, false)
    let mesh = new THREE.Mesh(geometry, material)
    this.add(mesh)

    let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false)
    let rightCone = new THREE.Mesh(coneGeometry, material)
    rightCone.position.set(toPos.x - 40, toPos.y, toPos.z)
    rightCone.rotation.z = -Math.PI / 2
    this.add(rightCone)
  }
  drawInitialTubetoLeftSide (fromPosition, name) {
    let material = this.mapActionNameToMaterial(name)

    let fromPos = this.getSidePos('right', fromPosition)
    let toPos = this.getSidePos('left', new THREE.Vector3())
    let endPos = toPos.clone()
    endPos.setX(endPos.x - 60)

    let points = []
    points.push(fromPos)
    points.push(new THREE.Vector3(fromPos.x + WIDTH / 2, fromPos.y, fromPos.z))
    points.push(new THREE.Vector3(toPos.x - WIDTH / 2, toPos.y, toPos.z))
    points.push(endPos)

    this.addTextMeshBetween(name, points[1], points[2])

    let path = new THREE.CatmullRomCurve3(this.straightenPoints(points))
    let geometry = new THREE.TubeGeometry(path, 64, 10, 8, false)
    let mesh = new THREE.Mesh(geometry, material)
    this.add(mesh)

    let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false)
    let rightCone = new THREE.Mesh(coneGeometry, material)
    rightCone.position.set(toPos.x - 40, toPos.y, toPos.z)
    rightCone.rotation.z = -Math.PI / 2
    this.add(rightCone)

    // sphere at the left end
    let sphereGeometryLeft = new THREE.SphereGeometry(10)
    let sphereMeshLeft = new THREE.Mesh(sphereGeometryLeft, material)
    sphereMeshLeft.position.set(fromPos.x, fromPos.y, fromPos.z)
    this.add(sphereMeshLeft)
  }
  mapActionNameToMaterial (name) {
    let color = processModelColors.nameColor[name]
    if (!color) {
      color = processModelColors.nameColor['default']
      console.warn('Add color to processModelColors:', name)
    }
    return new THREE.MeshLambertMaterial({ color: color })
  }
  getMaterial () {
    let color = processModelColors.nameColor[this.userData.classId]
    if (!color) {
      color = processModelColors.nameColor['default']
      console.warn('Add color to processModelColors:', this.userData.classId)
    }
    return new THREE.MeshLambertMaterial({ color: color })
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
    const roundedRect = (ctx, x, y, width, height, radius) => {
      ctx.moveTo(x, y + radius)
      ctx.lineTo(x, y + height - radius)
      ctx.quadraticCurveTo(x, y + height, x + radius, y + height)
      ctx.lineTo(x + width - radius, y + height)
      ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius)
      ctx.lineTo(x + width, y + radius)
      ctx.quadraticCurveTo(x + width, y, x + width - radius, y)
      ctx.lineTo(x + radius, y)
      ctx.quadraticCurveTo(x, y, x, y + radius)
    }
    // Rounded rectangle
    let roundedRectShape = new THREE.Shape()
    roundedRect(roundedRectShape, 0, 0, WIDTH, 200, 20) // negative numbers not allowed
    // extruded shape
    let extrudeSettings = { depth: DEPTH, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 }
    let geometry = new THREE.ExtrudeGeometry(roundedRectShape, extrudeSettings)
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
    let text3d = new THREE.TextGeometry(name, { size: 30, height: 1, font: font })
    text3d.center()
    let textMesh = new THREE.Mesh(text3d, textMaterial)
    textMesh.position.set(textPosition.x, textPosition.y, textPosition.z)
    this.add(textMesh)
  }
}
