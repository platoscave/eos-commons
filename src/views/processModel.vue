<template>
    <div class="webglContainer" v-resize="onResize" v-on:click="onClick">
    </div>
</template>

<script>
import * as THREE from 'three'
import Scene from '../lib/sceneMixin.js'
import ProcessObject3d from '../lib/ProcessObject3d.js'

// const WIDTH = 400
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
        let zz = 0
        resultsArr.forEach(interfaceState => {
          let placeholderObject3d = new THREE.Object3D()
          placeholderObject3d.position.setZ(zz)
          this.modelObject3D.add(placeholderObject3d)
          let interfaceStateObj3d = new ProcessObject3d(interfaceState, this.font)
          placeholderObject3d.add(interfaceStateObj3d)
          this.selectableMeshArr.push(interfaceStateObj3d.children[0])

          const substateId = interfaceState.substateId
          if (substateId) {
            /* We have a problem when collecting substates from interfaceState since the are
                * found using promises. The promises are executed in parallel so we cannot guarantee their uniqueness.
                * The workaround is to collect the substates in and object with the stateId as key */
            this.collectSubstates(substateId).then(stateIdObj => {
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
              let toState = placeholderObject3d.getObjectByProperty('key', substateId)
              interfaceStateObj3d.drawTubeBottomToLeftSide(toState, 'happy')

              // Tell the subSates to draw their connetors
              let subStateState = placeholderObject3d.getObjectByProperty('key', substateId)
              subStateState.drawSubstateConnectors(placeholderObject3d, interfaceStateObj3d)

              placeholderObject3d.position.setX(-maxX / 2)
            })

            // let box = new THREE.BoxHelper(placeholderObject3d, 0xffff00)
            // this.modelObject3D.add(box)
          }
          zz -= 1600
        })
        this.removeLoadingText()
      })
    }, (err) => console.log(err))
  },
  methods: {
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
