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
import Scene from '../lib/sceneMixin.js'
import ClassObject3d from '../lib/classObject3d.js'

const WIDTH = 400
const HEIGHT = 200

export default {
  name: 'classModel',
  mixins: [Scene],
  data () {
    return {
      // skyboxArray: ['grass/sbox_px.jpg','grass/sbox_nx.jpg','grass/sbox_py.jpg','grass/sbox_ny.jpg','grass/sbox_pz.jpg','grass/sbox_nz.jpg']
      skyboxArray: ['milkyway/posx.jpg', 'milkyway/negx.jpg', 'milkyway/posy.jpg', 'milkyway/negy.jpg', 'milkyway/posz.jpg', 'milkyway/negz.jpg']
      // skyboxArray: ['jupiter/space_3_right.jpg','jupiter/space_3_left.jpg','jupiter/space_3_top.jpg','jupiter/space_3_bottom.jpg','jupiter/space_3_front.jpg','jupiter/space_3_back.jpg']
    }
  },
  mounted: async function () {
    this.addLoadingText()

    // placeholderObj3d holds all of our 3d objects. Mostly used for lookup by cid.
    let placeholderObj3d = new THREE.Object3D()
    this.modelObject3D.add(placeholderObj3d)

    // Get the root class from the store
    let rootClass = await this.$store.dispatch('getCommonByCid', 'gzthjuyjca4s')

    // Tell the root class to draw itself, and each of it's subclasses, recursivily
    let rootClassObj3d = await this.collectAndDrawClasses(placeholderObj3d, rootClass)

    // Position the classes
    let maxX = this.setPositionX(rootClassObj3d, 0)
    this.setPositionY(rootClassObj3d, 0)

    // Shift placeholder to the left so that the root is at the center of the universe
    placeholderObj3d.position.setX(-maxX / 2)
    placeholderObj3d.updateMatrixWorld(true)

    rootClassObj3d.drawClassBeams()

    this.drawClassAssocs(placeholderObj3d, rootClassObj3d)

    // Tell the root class and each of it's subclasses to draw its objects, recursivily
    await this.collectAndDrawObjects(placeholderObj3d, rootClassObj3d)
    placeholderObj3d.updateMatrixWorld(true)

    // TODO takes awhile. find a way to filter.
    this.drawObjectAssocs(placeholderObj3d, rootClassObj3d)

    this.removeLoadingText()
  },
  methods: {
    collectAndDrawClasses (placeholderObj3d, classObj) {
      let rootClassObj3d = new ClassObject3d(classObj, this.font)
      placeholderObj3d.add(rootClassObj3d)
      this.selectableMeshArr.push(rootClassObj3d.children[0])
      let queryObj = {
        query: {
          sortBy: 'title',
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
          if (classObj.cid !== '5jdnjqxsqmgn') { // Hack: ignore Blaance Sheet children
            promises.push(this.collectAndDrawClasses(placeholderObj3d, subClassObj))
          }
        })
        return Promise.all(promises).then(childObjsArr => {
          rootClassObj3d.subclassesObj3ds = childObjsArr
          return (rootClassObj3d)
        })
      })
    },
    collectAndDrawObjects (placeholderObj3d, classObj3d) {
      let queryObj = {
        query: {
          sortBy: 'name',
          where: {
            docProp: 'classId',
            operator: 'eq',
            value: classObj3d.cid
          }
        }
      }
      return this.$store.dispatch('query', queryObj).then((resultsArr) => {
        classObj3d.userData.resultsArr = resultsArr // TODO not needed?
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

        if (resultsArr.length > 0) classObj3d.drawObjectToClassBeam((resultsArr.length - 1) * WIDTH * 2 + WIDTH * 4)

        let promises = []
        classObj3d.subclassesObj3ds.forEach(subClassObj3d => {
          promises.push(this.collectAndDrawObjects(placeholderObj3d, subClassObj3d))
        })
        return Promise.all(promises)
      })
    },
    /**
     * Recusrive function to traverse the class hierarchy using the subclassesObj3ds array.
     * On the current class, set the x value, then iterate the subclasses
     * Call ourselves on each of these subclasses.
     * The x and max x returned from the subcalsses, is used to center our class
     * The max x returned from the subcalsses, is also used to ensure the next class is positioned beyond it,
     * so that it has enough room for it's subclasses
     *
     * @param {ClassObject3d} classObj3d - An object3d instance. The current class.
     * @param {number} x - the x value that represents the minimum x for this class.
     * @return {number} - the hightest x value used sofar.
     */
    setPositionX (classObj3d, x) {
      let minX = x
      let maxX = x
      classObj3d.subclassesObj3ds.forEach(subClassObj3d => {
        maxX = Math.max(x, this.setPositionX(subClassObj3d, x))
        x = maxX + WIDTH * 2
      })
      let subclassesLength = classObj3d.subclassesObj3ds.length
      /* if (subclassesLength > 0) {
        let lastSubclassPosX = classObj3d.subclassesObj3ds[subclassesLength - 1].position.x
        classObj3d.position.setX(minX + (lastSubclassPosX - minX) / 2)
      } */
      classObj3d.position.setX(minX + (maxX - minX) / 2)
      return maxX
    },

    /**
     * Recusrive function to traverse the class hierarchy using the subclassesObj3ds array.
     * On each of these classes, set the y value, then iterate the subclasses
     * Call ourselves on each of these subclasses.
     *
     * @param {ClassObject3d} classObj3d - An object3d instance. The current class.
     * @param {number} y - the y value that this class will be positioned at.
     * @return {number} - the lowest y value used sofar (not actually used yet).
     */
    setPositionY (classObj3d, y) {
      classObj3d.position.setY(y)
      let minY = y
      classObj3d.subclassesObj3ds.forEach(subClassObj3d => {
        minY = Math.min(y, this.setPositionY(subClassObj3d, y - HEIGHT * 4))
      })
      return minY
    },

    /**
     * Recusrive function to traverse the class hierarchy using the subclassesObj3ds array.
     * On each of these classes, iterate over its instances using the instancesObj3d array.
     * Call drawObjectAssocs on each of these instances.
     *
     * @param {ClassObject3d} placeholderObj3d - An object3d instance. Used to find associated objects by key.
     * @param {ClassObject3d} classObj3d - An object3d instance. The current class
     */
    drawObjectAssocs (placeholderObj3d, classObj3d) {
      classObj3d.subclassesObj3ds.forEach(subClassObj3d => {
        subClassObj3d.instancesObj3d.forEach(instanceObj3d => {
          instanceObj3d.drawObjectAssocs(placeholderObj3d)
        })
        this.drawObjectAssocs(placeholderObj3d, subClassObj3d)
      })
    },

    /**
     * Recusrive function to traverse the class hierarchy using the subclassesObj3ds array.
     *
     * @param {ClassObject3d} placeholderObj3d - An object3d instance. Used to find associated objects by key.
     * @param {ClassObject3d} classObj3d - An object3d instance. The current class
     */
    drawClassAssocs (placeholderObj3d, classObj3d) {
      classObj3d.subclassesObj3ds.forEach(subClassObj3d => {
        subClassObj3d.drawClassAssocs(placeholderObj3d)
        this.drawClassAssocs(placeholderObj3d, subClassObj3d)
      })
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
