<template>
  <div class="no-overflow">
    <v-btn class="button-top" absolute dark fab small right color="pink" @click="onOrbit">
      <v-icon>{{orbit ? "flare" : "360"}}</v-icon>
    </v-btn>
    <div v-resize="onResize" v-on:click="onClick"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import Scene from '../../lib/sceneMixin.js'
import ProcessObject3d from '../../lib/processObject3d.js'

const WIDTH = 400
const HEIGHT = 200

export default {
  name: 'processModel',
  mixins: [Scene],
  data () {
    return {
      // skyboxArray: ['grass/sbox_px.jpg', 'grass/sbox_nx.jpg', 'grass/sbox_py.jpg', 'grass/sbox_ny.jpg', 'grass/sbox_pz.jpg', 'grass/sbox_nz.jpg']
      skyboxArray: ['islands/skybox_e.jpg', 'islands/skybox_w.jpg', 'islands/skybox_t.jpg', 'islands/skybox_b.jpg', 'islands/skybox_n.jpg', 'islands/skybox_s.jpg']
    }
  },
  mounted: async function () {
    this.addLoadingText()
    let queryObj = {
      query: {
        where: [{
          docProp: 'classId',
          operator: 'eq',
          value: 'dwl1kwhalwj4'
        }]
      }
    }
    // Get an array of interface states from the store
    let resultsArr = await this.$store.dispatch('query', queryObj)

    let zPos = 0
    let promises = []
    resultsArr.forEach(interfaceState => {
      // Tell each of the interface states to draw themselves, and each of their substates
      promises.push(this.drawInterfaceState(interfaceState, zPos))
      zPos -= 1600
    })
    let interfaceStateObj3dArr = await Promise.all(promises)

    interfaceStateObj3dArr.forEach(interfaceStateObj3d => {
      // Draw the final action tubes form this interface state
      let y = 0
      interfaceStateObj3d.userData.returnActions.forEach(nextState => {
        console.log('nextState', nextState)
        let position = interfaceStateObj3d.position.clone()
        position.setY(y)
        position.setX(position.x + WIDTH * 4)
        let toState = { position: position }
        interfaceStateObj3d.drawTubeRightSideToLeftSide(toState, nextState)
        y += HEIGHT
      })

      // Draw the initial action tube to this interface state
      let fromPosition = interfaceStateObj3d.position.clone()
      fromPosition.setX(-WIDTH * 4)
      fromPosition.setY(HEIGHT)
      interfaceStateObj3d.drawInitialTubetoLeftSide(fromPosition, 'happy')
    })

    this.removeLoadingText()
  },
  methods: {
    drawInterfaceState (interfaceState, zPos) {
      let placeholderObject3d = new THREE.Object3D()
      placeholderObject3d.position.setZ(zPos)
      this.modelObject3D.add(placeholderObject3d)
      let interfaceStateObj3d = new ProcessObject3d(interfaceState)
      placeholderObject3d.add(interfaceStateObj3d)
      this.selectableMeshArr.push(interfaceStateObj3d.children[0])

      const substateId = interfaceState.substateId
      if (!substateId) return false
      /* collect the substates in and object with the stateId as key */
      return this.collectSubstates(substateId).then(stateIdObj => {
        for (let key in stateIdObj) {
          let stateObj = stateIdObj[key]
          let obj = new ProcessObject3d(stateObj)
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
        return interfaceStateObj3d
      })
    },
    collectSubstates (stateId) {
      return this.$store.dispatch('getCommonByKey', stateId).then(substate => {
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
    .button-top {
      top: 10px
    }
    .no-overflow {
        overflow: hidden;
        height: 100%;
    }
</style>
