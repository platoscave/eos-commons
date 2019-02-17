<template>
  <div class="webglContainer">
    <v-btn absolute dark fab small right color="pink" @click="onOrbit">
      <template v-if="orbit">
          <v-icon>flare</v-icon>
      </template>
      <template v-else>
          <v-icon>360</v-icon>
      </template>
    </v-btn>
    <div v-resize="onResize" v-on:click="onClick"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import Scene from '../lib/sceneMixin.js'
import ProcessObject3d from '../lib/processObject3d.js'

// const WIDTH = 400
const HEIGHT = 200

export default {
  name: 'processModel',
  mixins: [Scene],
  data () {
    return {
      skyboxArray: ['grass/sbox_px.jpg', 'grass/sbox_nx.jpg', 'grass/sbox_py.jpg', 'grass/sbox_ny.jpg', 'grass/sbox_pz.jpg', 'grass/sbox_nz.jpg']

    }
  },
  mounted () {
    let fontLoader = new THREE.FontLoader()
    fontLoader.load('helvetiker_regular.typeface.json', (font) => {
      this.font = font
      this.addLoadingText()
      let queryObj = {
        query: {
          where: {
            docProp: 'classId',
            operator: 'eq',
            value: '574724823c6d3cd598a5a373'
          }
        }
      }
      this.$store.dispatch('query', queryObj).then((resultsArr) => {
        let zPos = 0
        let promises = []
        resultsArr.forEach(interfaceState => {
          promises.push(this.drawInterfaceState(interfaceState, zPos))
          zPos -= 1600
        })
        return Promise.all(promises).then(resultsArr => {
          this.removeLoadingText()
        })
      })
    })
  },
  methods: {
    drawInterfaceState (interfaceState, zPos) {
      let placeholderObject3d = new THREE.Object3D()
      placeholderObject3d.position.setZ(zPos)
      this.modelObject3D.add(placeholderObject3d)
      let interfaceStateObj3d = new ProcessObject3d(interfaceState, this.font)
      placeholderObject3d.add(interfaceStateObj3d)
      this.selectableMeshArr.push(interfaceStateObj3d.children[0])

      const substateId = interfaceState.substateId
      if (!substateId) return false
      /* collect the substates in and object with the stateId as key */
      return this.collectSubstates(substateId).then(stateIdObj => {
        for (let key in stateIdObj) {
          let stateObj = stateIdObj[key]
          let obj = new ProcessObject3d(stateObj, this.font)
          placeholderObject3d.add(obj)
          this.selectableMeshArr.push(obj.children[0])
        }

        let maxX = this.setPositionX(placeholderObject3d, substateId, 0)
        this.setPositionY(placeholderObject3d, substateId, -HEIGHT * 4)

        interfaceStateObj3d.position.setX(maxX / 2)
        interfaceStateObj3d.updateMatrixWorld()

        // Draw interface connector to first substate
        let subStateState = placeholderObject3d.getObjectByProperty('key', substateId)
        // console.log('subStateState', subStateState.name)
        interfaceStateObj3d.drawTubeBottomToLeftSide(subStateState, 'happy')

        // Tell the subSates to draw their connetors
        subStateState.drawSubstateConnectors(placeholderObject3d, interfaceStateObj3d)

        // let box = new THREE.BoxHelper(placeholderObject3d, 0xffff00)
        // this.modelObject3D.add(box)
        placeholderObject3d.position.setX(-maxX / 2)
        return true
      })
    },
    collectSubstates (stateId) {
      return this.$store.dispatch('getCommonByCid', stateId).then(substate => {
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
        overflow: hidden;
    }
</style>
