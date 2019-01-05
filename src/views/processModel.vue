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
  methods: {
    drawInterfaceState (queryResult, position) {
      let obj = new classObject3d(this.geometry, this.interfaceMaterial, position, queryResult, this.font)
      this.modelObject3D.add(obj)

      this.render()

      let newPosition = new THREE.Vector3(position.x, position.y - 800, position.z)

      const substateId = queryResult.data.item.substateId
      if (substateId) this.drawSubstates (substateId, newPosition)

      let fromPos = new THREE.Vector3(position.x - 200/3, position.y, position.z)
      let toPos = new THREE.Vector3(newPosition.x - 400/2, newPosition.y, newPosition.z)
      this.drawTubeBottomToRight(fromPos, toPos, 'happy')
    },
    drawSubstates (stateId, position) {
      this.$store.dispatch('loadCommon', stateId).then(substate => {
        let obj = new classObject3d(
          this.geometry,
          this.interfaceMaterial,
          position,
          {id: substate.id, text: substate.name},
          this.font)
        this.modelObject3D.add(obj)
        let nextStateObj = _.find(substate.nextStateIds, {action:'happy'})
        let stateId = _.get(nextStateObj, 'stateId')
        if (stateId){
          let x = position.x + 800
          let y = position.y
          let z = position.z
          this.drawSubstates (stateId, new THREE.Vector3(x, y, z))
        }
      })
    },
    drawTubeBottomToRight(fromPos, toPos, name){
      let material = new THREE.MeshLambertMaterial({color: 0xAAEFAA})

      let y1 = toPos.y + (fromPos.y - toPos.y) / 2 + 50
      let y2 = toPos.y + (fromPos.y - toPos.y) / 2
      let x2 = fromPos.x - 50
      let x3 = toPos.x - 400 + 50
      let x4 = toPos.x - 400
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

      let path = new THREE.CatmullRomCurve3( points )
      let geometry = new THREE.TubeGeometry( path, 64, 10, 8, false )
      let mesh = new THREE.Mesh( geometry, material );
      this.modelObject3D.add(mesh)

      let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false);
      let rightCone = new THREE.Mesh( coneGeometry, material );
      rightCone.position.set(toPos.x - 40, toPos.y, toPos.z)
      //rightCone.position.z -= 80;
      rightCone.rotation.z = -Math.PI / 2;
      this.modelObject3D.add(rightCone);

      if(name){
        let textMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF});
        let text3d = new THREE.TextGeometry(name, {size: 30, height: 1, font: this.font});
        let textMesh = new THREE.Mesh(text3d, textMaterial);
        text3d.computeBoundingBox();
        let xOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );
        textMesh.position.set(x3 + (x2 - x3) / 2, y2, fromPos.z + 20 )
//        textMesh.position = postionVec;
//        textMesh.position.x += xOffset;
//        textMesh.position.z += 20;
//        textMesh.rotation.y = Math.PI * 2;
        this.modelObject3D.add(textMesh);
      }
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
    const roundedRect = ( ctx, x, y, width, height, radius ) => {
      ctx.moveTo( x, y + radius );
      ctx.lineTo( x, y + height - radius );
      ctx.quadraticCurveTo( x, y + height, x + radius, y + height );
      ctx.lineTo( x + width - radius, y + height );
      ctx.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
      ctx.lineTo( x + width, y + radius );
      ctx.quadraticCurveTo( x + width, y, x + width - radius, y );
      ctx.lineTo( x + radius, y );
      ctx.quadraticCurveTo( x, y, x, y + radius );
    }

    // Rounded rectangle
    let extrudeSettings = { depth: 10, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
    let roundedRectShape = new THREE.Shape();
    roundedRect(roundedRectShape, 0, 0, 400, 200, 20) //negative numbers not allowed
    // extruded shape
    this.geometry = new THREE.ExtrudeGeometry( roundedRectShape, extrudeSettings )
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
        // Collect all the classes that we will be using.
        // This is done recursively and asynchronously. the result is promise to the rootObject3D.
        this.drawInterfaceState(resultsArr[0], new THREE.Vector3(0, 0, 0)).then(rootObj => {
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

          rootObj.collectSelectableMeshes(this.selectableMeshArr)
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
