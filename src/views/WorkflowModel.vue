<template>
  <div class="no-overflow">
    <v-btn class="button-top" absolute dark fab small right color="pink" @click="onOrbit">
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
import ProcessObject3d from '../lib/workflowObject3d.js'

const WIDTH = 400
const HEIGHT = 200

export default {
  name: 'workflowModel',
  mixins: [Scene],
  data () {
    return {
      skyboxArray: ['grass/sbox_px.jpg', 'grass/sbox_nx.jpg', 'grass/sbox_py.jpg', 'grass/sbox_ny.jpg', 'grass/sbox_pz.jpg', 'grass/sbox_nz.jpg']
      // skyboxArray: ['islands/skybox_e.jpg', 'islands/skybox_w.jpg', 'islands/skybox_t.jpg', 'islands/skybox_b.jpg', 'islands/skybox_n.jpg', 'islands/skybox_s.jpg']
    }
  },
  mounted: async function () {
    this.addLoadingText()
    let queryObj = {
      query: {
        where: {
          docProp: 'classId',
          operator: 'eq',
          value: '574232b83c6d3cd598a5a309'
        }
      }
    }
    // Get an array of agreements from the store
    let resultsArr = await this.$store.dispatch('query', queryObj)

    let zPos = 0
    let promises = []
    resultsArr.forEach(agreement => {
      // Tell each of the interface states to draw themselves, and each of their substates
      promises.push(this.drawWorkflow(agreement, zPos))
      zPos -= 1600
    })
    let workflowObj3dArr = await Promise.all(promises)

    /* workflowObj3dArr.forEach(workflowObj3d => {
      // Draw the final action tubes form this interface state
      let y = 0
      workflowObj3d.userData.nextStateIds.forEach(nextState => {
        console.log('nextState', nextState)
        let position = workflowObj3d.position.clone()
        position.setY(y)
        position.setX(position.x + WIDTH * 4)
        let toState = { position: position }
        workflowObj3d.drawTubeRightSideToLeftSide(toState, nextState.action)
        y += HEIGHT
      })

      // Draw the initial action tube to this interface state
      let fromPosition = workflowObj3d.position.clone()
      fromPosition.setX(-WIDTH * 4)
      fromPosition.setY(HEIGHT)
      workflowObj3d.drawInitialTubetoLeftSide(fromPosition, 'happy')
    }) */

    this.removeLoadingText()
  },
  methods: {
    drawWorkflow: async function (agreement, zPos) {
      // Get the buyer from the store
      let buyer = await this.$store.dispatch('getCommonByCid', agreement.buyerId)
      // Get the seller from the store
      let seller = await this.$store.dispatch('getCommonByCid', agreement.sellerId)

      let placeholderObject3d = new THREE.Object3D()
      placeholderObject3d.position.setZ(zPos)
      this.modelObject3D.add(placeholderObject3d)

      let rountedRectShape = this.getRoundedRectShape(0, 0, WIDTH * 10, HEIGHT * 5, 50)
      let geometry = new THREE.ShapeGeometry( rountedRectShape )
      geometry.center()
      var material = new THREE.MeshBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide, transparent: true, opacity: 0.25 } )
      var swimlane = new THREE.Mesh( geometry, material )
      placeholderObject3d.add( swimlane )
      
      return true;
      let workflowObj3d = new ProcessObject3d(workflow)
      placeholderObject3d.add(workflowObj3d)
      this.selectableMeshArr.push(workflowObj3d.children[0])

      const substateId = workflow.substateId
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

        workflowObj3d.position.setX(maxX / 2)
        workflowObj3d.updateMatrixWorld()

        // Draw interface connector to first substate
        let subStateState = placeholderObject3d.getObjectByProperty('key', substateId)
        // console.log('subStateState', subStateState.name)
        workflowObj3d.drawTubeBottomToLeftSide(subStateState, 'happy')

        // Tell the subSates to draw their connetors
        subStateState.drawSubstateConnectors(placeholderObject3d, workflowObj3d)

        // let box = new THREE.BoxHelper(placeholderObject3d, 0xffff00)
        // this.modelObject3D.add(box)
        placeholderObject3d.position.setX(-maxX / 2)
        return workflowObj3d
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
    .button-top {
      top: 10px
    }
    .no-overflow {
        overflow: hidden;
    }
</style>
