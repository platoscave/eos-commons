<template>
  <div>
    <v-btn absolute dark fab small right color="pink" @click="onOrbit">
      <template v-if="orbit">
          <v-icon>flare</v-icon>
      </template>
      <template v-else>
          <v-icon>360</v-icon>
      </template>
  </v-btn>
    <div class="webglContainer" v-resize="onResize" v-on:click="onClick"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import Scene from '../lib/sceneMixin.js'
import ClassObject3d from '../lib/classObject3d.js'

const WIDTH = 400
const HEIGHT = 200

export default {
  name: 'classModel',
  mixins: [Scene],
  data () {
    return {
      /* skyboxArray: ['grass/sbox_px.jpg','grass/sbox_nx.jpg','grass/sbox_py.jpg','grass/sbox_ny.jpg','grass/sbox_pz.jpg','grass/sbox_nz.jpg'] */
      skyboxArray: ['milkyway/posx.jpg', 'milkyway/negx.jpg', 'milkyway/posy.jpg', 'milkyway/negy.jpg', 'milkyway/posz.jpg', 'milkyway/negz.jpg']
      /* skyboxArray: ['jupiter/space_3_right.jpg','jupiter/space_3_left.jpg','jupiter/space_3_top.jpg','jupiter/space_3_bottom.jpg','jupiter/space_3_front.jpg','jupiter/space_3_back.jpg'] */
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
            docProp: '$key',
            operator: 'eq',
            value: '56f86c6a5dde184ccfb9fc6a'
          }
        }
      }
      this.$store.dispatch('query', queryObj).then((resultsArr) => {
        let rootClass = resultsArr[0]
        let placeholderObj3d = new THREE.Object3D()
        this.modelObject3D.add(placeholderObj3d)

        this.collectClasses(placeholderObj3d, rootClass).then(res => {
          let rootClassObj3d = placeholderObj3d.getObjectByProperty('key', rootClass.id)
          let maxX = this.setPositionX(placeholderObj3d, rootClassObj3d, 0)
          this.setPositionY(placeholderObj3d, rootClassObj3d, 0)

          placeholderObj3d.position.setX(-maxX / 2)

          rootClassObj3d.drawClassConnectors(placeholderObj3d)

          rootClassObj3d.drawClassAssocs(placeholderObj3d)

          // this.removeLoadingText()
          this.collectObjects(placeholderObj3d, rootClassObj3d).then(res => {
            placeholderObj3d.updateMatrixWorld(true)
            this.drawObjectAssocs(placeholderObj3d, rootClassObj3d)

            this.removeLoadingText()
          })
        })
      })
    })
  },
  methods: {
    collectClasses (placeholderObj3d, classObj) {
      let rootClassObj3d = new ClassObject3d(classObj, this.font)
      placeholderObj3d.add(rootClassObj3d)
      this.selectableMeshArr.push(rootClassObj3d.children[0])
      let queryObj = {
        query: {
          where: {
            docProp: 'parentId',
            operator: 'eq',
            value: classObj.cid
          }
        }
      }
      return this.$store.dispatch('query', queryObj).then((resultsArr) => {
        let promises = []
        resultsArr.forEach(subClassObj => {
          if (classObj.cid !== '573435433c6d3cd598a5a2db') { // Hack: ignore Blaance Sheet children
            promises.push(this.collectClasses(placeholderObj3d, subClassObj))
          }
        })
        return Promise.all(promises).then(childObjsArr => {
          rootClassObj3d.subclassesObj3ds = childObjsArr
          return (rootClassObj3d)
        })
      })
    },
    collectObjects (placeholderObj3d, classObj3d) {
      let queryObj = {
        query: {
          where: {
            docProp: 'classId',
            operator: 'eq',
            value: classObj3d.cid
          }
        }
      }
      return this.$store.dispatch('query', queryObj).then((resultsArr) => {
        classObj3d.userData.resultsArr = resultsArr
        classObj3d.instancesObj3d = []
        let z = classObj3d.position.z + WIDTH * 4
        resultsArr.forEach(objectObj => {
          let objectObj3d = new ClassObject3d(objectObj, this.font)
          objectObj3d.position.set(classObj3d.position.x, classObj3d.position.y, z)
          objectObj3d.rotateY(Math.PI * 0.5)
          placeholderObj3d.add(objectObj3d)
          this.selectableMeshArr.push(objectObj3d.children[0])
          classObj3d.instancesObj3d.push(objectObj3d)
          z += WIDTH * 2
        })

        if (resultsArr.length > 0) classObj3d.drawObjectConnectors((resultsArr.length - 1) * WIDTH * 2 + WIDTH * 4)

        let promises = []
        classObj3d.subclassesObj3ds.forEach(subClassObj3d => {
          promises.push(this.collectObjects(placeholderObj3d, subClassObj3d))
        })
        return Promise.all(promises)
      })
    },
    setPositionX (placeholderObj3d, classObj3d, x) {
      let minX = x
      let maxX = x
      classObj3d.subclassesObj3ds.forEach(subClassObj3d => {
        maxX = Math.max(x, this.setPositionX(placeholderObj3d, subClassObj3d, x))
        x = maxX + WIDTH * 2
      })
      classObj3d.position.setX(minX + (maxX - minX) / 2)
      return maxX
    },
    setPositionY (placeholderObj3d, classObj3d, y) {
      classObj3d.position.setY(y)
      let minY = y
      classObj3d.subclassesObj3ds.forEach(subClassObj3d => {
        minY = Math.min(y, this.setPositionY(placeholderObj3d, subClassObj3d, y - HEIGHT * 4))
      })
      return minY
    },
    drawObjectAssocs (placeholderObj3d, classObj3d) {
      classObj3d.subclassesObj3ds.forEach(subClassObj3d => {
        subClassObj3d.instancesObj3d.forEach(instanceObj3d => {
          instanceObj3d.drawObjectAssocs(placeholderObj3d)
        })
        this.drawObjectAssocs(placeholderObj3d, subClassObj3d)
      })
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
