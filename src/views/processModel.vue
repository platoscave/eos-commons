<template>
    <div class="webglContainer" v-resize="onResize" v-on:click="onClick">
    </div>
</template>

<script>
import Scene from '../lib/sceneMixin.js'
import processObject3d from '../lib/processObject3d.js'

const WIDTH = 400
const HEIGHT = 200

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
    setTimeout(() => {
      // DOM updated

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
      let extrudeSettings = {
        depth: 10,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 1,
        bevelThickness: 1
      }
      let geometry = new THREE.ExtrudeGeometry(roundedRectShape, extrudeSettings)
      geometry.center()
      let buffgeom = new THREE.BufferGeometry()
      buffgeom.fromGeometry(geometry)

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
        this.$store.dispatch('query2', viewQueryObj).then((resultsObj) => {
          let zz = 0
          Object.keys(resultsObj).forEach(key => {
            let result
            let interfaceState = resultsObj[key]
            interfaceState.id = key
            let placeholderObject3d = new THREE.Object3D()
            placeholderObject3d.position.setZ(zz)
            this.modelObject3D.add(placeholderObject3d)
            let position = new THREE.Vector3(0, 0, 0)
            let interfaceStateObj = new processObject3d(buffgeom, position, interfaceState, this.font)
            placeholderObject3d.add(interfaceStateObj)
            this.selectableMeshArr.push(interfaceStateObj.children[0])

            const substateId = interfaceState.substateId
            if (substateId) {
              /* We have a problem when collecting substates from interfaceState since the are
                 * found using promises. The promises are executed in parallel so we cannot guarantee their uniqueness.
                 * The workaround is to collect the substates in and object with the stateId as key */
              this.collectSubstates(substateId).then(stateIdObj => {
                for (let key in stateIdObj) {
                  let stateObj = stateIdObj[key]
                  let pos = new THREE.Vector3(0, 0, 0)
                  let obj = new processObject3d(buffgeom, pos, stateObj, this.font)
                  placeholderObject3d.add(obj)
                  this.selectableMeshArr.push(obj.children[0])
                }

                let maxX = this.setPositionX(placeholderObject3d, substateId, 0)
                let minY = this.setPositionY(placeholderObject3d, substateId, position.y - 800)

                interfaceStateObj.position.setX(maxX / 2)
                interfaceStateObj.updateMatrixWorld()

                // Draw interface connector to first substate
                let toState = placeholderObject3d.getObjectByProperty('key', substateId)
                interfaceStateObj.drawTubeBottomToLeftSide(placeholderObject3d, toState, 'happy')

                // Tell the subSates to draw their connetors
                let subStateState = placeholderObject3d.getObjectByProperty('key', substateId)
                subStateState.drawSubstateConnectors(placeholderObject3d, interfaceStateObj)

                placeholderObject3d.position.setX(-maxX / 2)
              })

              // let box = new THREE.BoxHelper(placeholderObject3d, 0xffff00)
              // this.modelObject3D.add(box)
            }
            zz -= 1600
          })
        })
      }, (err) => console.log(err))
    }, 1000)
  },
  methods: {
    collectSubstates (stateId) {
      return this.$store.dispatch('loadCommon', stateId).then(substate => {
        let promises = []
        if (substate.nextStateIds) {
          substate.nextStateIds.forEach(nextStateActionId => {
            if (nextStateActionId.stateId) promises.push(this.collectSubstates(nextStateActionId.stateId))
          })
        }
        return Promise.all(promises).then(resultsArr => {
          let res = {}
          res[stateId] = substate
          resultsArr.forEach(resStateIdObj => {
            for (let key in resStateIdObj) {
              res[key] = resStateIdObj[key]
            }
          })
          return res
        })
      })
    },
    setPositionX (placeholderObject3d, stateId, x) {
      let state = placeholderObject3d.getObjectByProperty('key', stateId)
      if (state.position.x < x) state.position.setX(x)
      if (!state.userData.nextStateIds) return state.position.x
      let maxX = x
      state.userData.nextStateIds.forEach(nextStateActionId => {
        if (nextStateActionId.stateId) {
          maxX = Math.max(x, this.setPositionX(placeholderObject3d, nextStateActionId.stateId, x + 800))
        }
      })
      return maxX
    },
    setPositionY (placeholderObject3d, stateId, y) {
      let state = placeholderObject3d.getObjectByProperty('key', stateId)
      if (state.position.y > y) state.position.setY(y)
      if (!state.userData.nextStateIds) return state.position.y
      let minY = y
      state.userData.nextStateIds.forEach(nextStateActionId => {
        if (nextStateActionId.stateId) {
          minY = Math.min(y, this.setPositionY(placeholderObject3d, nextStateActionId.stateId, y))
          y = minY - HEIGHT * 2
        }
      })
      return minY
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
