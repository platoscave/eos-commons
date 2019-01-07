<template>
    <div class="webglContainer" v-resize="onResize" v-on:click="onClick">
    </div>
</template>

<script>
import Scene from '../lib/sceneMixin.js'
import classObject3d from '../lib/classObject3d.js'

export default {
  name: 'processModel',
  mixins: [Scene],
  data () {
    return {
      skyboxArray: [
        'grass/sbox_px.jpg',
        'grass/sbox_nx.jpg',
        'grass/sbox_py.jpg',
        'grass/sbox_ny.jpg',
        'grass/sbox_pz.jpg',
        'grass/sbox_nz.jpg'
      ]
    }
  },
  mounted () {
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
    roundedRect(roundedRectShape, 0, 0, 400, 200, 20) // negative numbers not allowed
    // extruded shape
    let extrudeSettings = { depth: 10, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 }
    this.geometry = new THREE.ExtrudeGeometry(roundedRectShape, extrudeSettings)
    this.geometry.center()

    this.interfaceMaterial = new THREE.MeshLambertMaterial({color: 0x00A300})
    this.executeMaterial = new THREE.MeshLambertMaterial({color: 0x8904B1})

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

      let viewQueryObj = this.viewRootQueryObj()
      this.$store.dispatch('query', viewQueryObj).then((resultsArr) => {
        let z = 0
        resultsArr.forEach(interfaceState => {
          let interfaceObject3d = new THREE.Object3D()
          this.modelObject3D.add(interfaceObject3d)
          let position = new THREE.Vector3(0, 0, z)
          let interfaceStateObj = new classObject3d(this.geometry, this.interfaceMaterial, position, interfaceState, this.font)
          interfaceObject3d.add(interfaceStateObj)

          const substateId = interfaceState.data.item.substateId
          if (substateId) {
            let substatePosition = new THREE.Vector3(position.x, position.y - 800, position.z)
            this.drawSubstates(interfaceObject3d, substateId, substatePosition).then(maxX => {
              let bbox = new THREE.Box3().setFromObject(interfaceObject3d)
              let offsetX = bbox.min.x + (bbox.max.x - bbox.min.x) / 2
              interfaceStateObj.position.setX(offsetX)
              //interfaceObject3d.updateMatrix()

              let box = new THREE.BoxHelper(interfaceObject3d, 0xffff00)
              this.modelObject3D.add(box)

              // Draw interface connector to first substate
              let fromState = interfaceObject3d.getObjectByProperty('key', interfaceState.id)
              let toState = interfaceObject3d.getObjectByProperty('key', substateId)
              this.drawTubeBottomToLeftSide(interfaceObject3d, fromState, toState, 'happy')

              this.drawSubstateConnectors(interfaceObject3d, interfaceStateObj, substateId)

              interfaceObject3d.position.setX(-offsetX)
            })
          }
          z -= 1200
        })
        /* this.drawInterfaceState(resultsArr[0].id, new THREE.Vector3(0, 0, 0)).then(rootObj => {
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
          /!* this.collectAndDrawObjects(rootObj, minY).then(res => {
            // Tell the classes to draw their object connectors
            rootObj.drawObjectConnectors(this.modelObject3D)
            // Get an array of selectable meshes
            rootObj.collectSelectableMeshes(this.selectableMeshArr)
            // console.log('done', rootObj)
            // Highlight the slected object and naviagte to it.
            // To do this we just call the path observer.
            this.routePathChanged(this.route.path)
          }) *!/

        }) */
      })
    }, (err) => console.log(err))
  },
  methods: {
    drawSubstates (interfaceStateObj, stateId, position) {
      return this.$store.dispatch('loadCommon', stateId).then(substate => {
        let obj = new classObject3d(this.geometry, this.interfaceMaterial, position, substate, this.font)
        interfaceStateObj.add(obj)
        let nextStateObj = _.find(substate.nextStateIds, {action: 'happy'})
        let stateId = _.get(nextStateObj, 'stateId')
        if (stateId) {
          let newPosition = new THREE.Vector3(position.x + 800, position.y, position.z)
          return this.drawSubstates(interfaceStateObj, stateId, newPosition)
        }
        else return position
      })
    },
    drawSubstateConnectors (interfaceObject3d, callerState, stateId) {
      let fromState = interfaceObject3d.getObjectByProperty('key', stateId)
      if(!fromState.userData.nextStateIds) return
      fromState.userData.nextStateIds.forEach(nextStateActionId => {
        if(nextStateActionId.stateId){
          let toState = interfaceObject3d.getObjectByProperty('key', nextStateActionId.stateId)
          this.drawTubeRightSideToLeftSide (interfaceObject3d, fromState, toState, nextStateActionId.action)
          this.drawSubstateConnectors (interfaceObject3d, callerState, nextStateActionId.stateId)
        }
        else{
          this.drawTubeRightSideToBottom (interfaceObject3d, fromState, callerState, nextStateActionId.action)
        }
      })
    },
    drawTubeBottomToLeftSide (interfaceObject3d, fromState, toState, name) {
      let fromPosition = fromState.position
      let toPosition = toState.position
      let material = this.mapActionNameToMaterial(name)

      let fromPos = new THREE.Vector3(fromPosition.x - 200 / 3, fromPosition.y, fromPosition.z)
      let toPos = new THREE.Vector3(toPosition.x - 400 / 2, toPosition.y, toPosition.z)

      let y1 = toPos.y + (fromPos.y - toPos.y) / 2 + 50
      let y2 = toPos.y + (fromPos.y - toPos.y) / 2
      let x2 = fromPos.x - 50
      let x3 = toPos.x - 200 + 50
      let x4 = toPos.x - 200
      let y4 = y2 - 50
      let y5 = toPos.y + 50
      let x6 = x4 + 50
      let x7 = toPos.x - 40
      let points = [ ]
      points.push(fromPos)
      points.push(new THREE.Vector3(fromPos.x, y1, fromPos.z))
      points.push(new THREE.Vector3(x2, y2, fromPos.z))
      points.push(new THREE.Vector3(x3, y2, toPos.z))
      points.push(new THREE.Vector3(x4, y4, toPos.z))
      points.push(new THREE.Vector3(x4, y5, toPos.z))
      points.push(new THREE.Vector3(x6, toPos.y, toPos.z))
      points.push(new THREE.Vector3(x7, toPos.y, toPos.z))

      let path = new THREE.CatmullRomCurve3(points)
      let geometry = new THREE.TubeGeometry(path, 64, 10, 8, false)
      let mesh = new THREE.Mesh(geometry, material)
      interfaceObject3d.add(mesh)

      let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false)
      let rightCone = new THREE.Mesh(coneGeometry, material)
      rightCone.position.set(toPos.x - 40, toPos.y, toPos.z)
      rightCone.rotation.z = -Math.PI / 2
      interfaceObject3d.add(rightCone)

      if (name) {
        let textMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
        let text3d = new THREE.TextGeometry(name, {size: 30, height: 1, font: this.font})
        text3d.center()
        let textMesh = new THREE.Mesh(text3d, textMaterial)
        text3d.computeBoundingBox()
        textMesh.position.set(x3 + (x2 - x3) / 2, y2, fromPos.z + 20)
        interfaceObject3d.add(textMesh)
      }
    },
    drawTubeRightSideToBottom (interfaceObject3d, fromState, toState, name) {
      let fromPosition = fromState.position
      let toPosition = toState.position
      let material = this.mapActionNameToMaterial(name)

      let fromPos = new THREE.Vector3(fromPosition.x + 200, fromPosition.y, fromPosition.z)
      let toPos = new THREE.Vector3(toPosition.x + 200 / 3, toPosition.y - 200/2, toPosition.z)

      let x1 = fromPos.x + 400 / 2 -50
      let x2 = fromPos.x + 400 / 2
      let y2 = fromPos.y + 50
      let y3 = fromPos.y + (toPos.y - fromPos.y) / 2 -50
      let x4 = x2 - 50
      if(x2 < toPos.x) x4 = x2 + 50
      let y4 = fromPos.y + (toPos.y - fromPos.y) / 2
      let x5 = toPos.x + 50
      if(x2 < toPos.x) x5 = toPos.x - 50
      let y6 = y4 + 50
      let y7 = toPos.y - 40

      let points = [ ]
      points.push(fromPos)
      points.push(new THREE.Vector3(x1, fromPos.y, fromPos.z))
      points.push(new THREE.Vector3(x2, y2, fromPos.z))
      points.push(new THREE.Vector3(x2, y3, fromPos.z))
      points.push(new THREE.Vector3(x4, y4, fromPos.z))
      points.push(new THREE.Vector3(x5, y4, toPos.z))
      points.push(new THREE.Vector3(toPos.x, y6, toPos.z))
      points.push(new THREE.Vector3(toPos.x, y7, toPos.z))

      let path = new THREE.CatmullRomCurve3(points)
      let geometry = new THREE.TubeGeometry(path, 64, 10, 8, false)
      let mesh = new THREE.Mesh(geometry, material)
      interfaceObject3d.add(mesh)

      let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false)
      let rightCone = new THREE.Mesh(coneGeometry, material)
      rightCone.position.set(toPos.x, toPos.y -40, toPos.z)
      interfaceObject3d.add(rightCone)

      if (name === 'a') {
        let textMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
        let text3d = new THREE.TextGeometry(name, {size: 30, height: 1, font: this.font})
        text3d.center()
        let textMesh = new THREE.Mesh(text3d, textMaterial)
        text3d.computeBoundingBox()
        textMesh.position.set(x3 + (x2 - x3) / 2, y2, fromPos.z + 20)
        interfaceObject3d.add(textMesh)
      }
    },
    drawTubeRightSideToLeftSide (interfaceObject3d, fromState, toState, name) {
      let fromPosition = fromState.position
      let toPosition = toState.position
      let material = this.mapActionNameToMaterial(name)

      let fromPos = new THREE.Vector3(fromPosition.x + 200, fromPosition.y, fromPosition.z)
      let toPos = new THREE.Vector3(toPosition.x - 200, toPosition.y, toPosition.z)
      let textPosition = new THREE.Vector3()

      let points = [ ]
      if(toPos.x - fromPos.x <= 800){
        points.push(fromPos)
        points.push(new THREE.Vector3(toPos.x - 40, toPos.y, toPos.z))
        textPosition.set(fromPos.x + (toPos.x - fromPos.x) /2, toPos.y, toPos.z + 20)
      }
      else{
        /*let y1 = toPos.y + (fromPos.y - toPos.y) / 2 + 50
        let y2 = toPos.y + (fromPos.y - toPos.y) / 2
        let x2 = fromPos.x - 50
        let x3 = toPos.x - 200 + 50
        let x4 = toPos.x - 200
        let y4 = y2 - 50
        let y5 = toPos.y + 50
        let x6 = x4 + 50
        let x7 = toPos.x - 40
        points.push(fromPos)
        points.push(new THREE.Vector3(fromPos.x, y1, fromPos.z))
        points.push(new THREE.Vector3(x2, y2, fromPos.z))
        points.push(new THREE.Vector3(x3, y2, toPos.z))
        points.push(new THREE.Vector3(x4, y4, toPos.z))
        points.push(new THREE.Vector3(x4, y5, toPos.z))
        points.push(new THREE.Vector3(x6, toPos.y, toPos.z))
        points.push(new THREE.Vector3(x7, toPos.y, toPos.z))*/
      }


      let path = new THREE.CatmullRomCurve3(points)
      let geometry = new THREE.TubeGeometry(path, 64, 10, 8, false)
      let mesh = new THREE.Mesh(geometry, material)
      interfaceObject3d.add(mesh)

      let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false)
      let rightCone = new THREE.Mesh(coneGeometry, material)
      rightCone.position.set(toPos.x - 40, toPos.y, toPos.z)
      rightCone.rotation.z = -Math.PI / 2
      interfaceObject3d.add(rightCone)

      if (name) {
        let textMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
        let text3d = new THREE.TextGeometry(name, {size: 30, height: 1, font: this.font})
        text3d.center()
        let textMesh = new THREE.Mesh(text3d, textMaterial)
        text3d.computeBoundingBox()
        textMesh.position.set(textPosition)
        interfaceObject3d.add(textMesh)
      }
    },
    mapActionNameToMaterial(name) {
      if(name === 'happy') return new THREE.MeshLambertMaterial({color: 0xAAEFAA})
      if(name === 'unhappy') return new THREE.MeshLambertMaterial({color: 0xFFAAAA})
      if(name === 'invalid') return new THREE.MeshLambertMaterial({color: 0xFFAAAA})
      if(name === 'timeout') return new THREE.MeshLambertMaterial({color: 0xFFFFAA})
      return new THREE.MeshLambertMaterial({color: 0xAAAAFF})
    },
    mapStateToMaterial(stateObj) {
      if(classId === 'interface') return new THREE.MeshLambertMaterial({color: 0x00A300})
      if(classId === 'interface') return new THREE.MeshLambertMaterial({color: 0x8904B1})
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
