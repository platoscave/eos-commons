<template>
    <div class="webglContainer" v-resize="onResize" v-on:click="onClick">
    </div>
</template>

<script>
import Scene from '../lib/sceneMixin.js'
import classObject3d from '../lib/classObject3d.js'

const WIDTH = 400
const HEIGHT = 200

export default {
  name: 'classModel',
  mixins: [Scene],
  data () {
    return {
      /* skyboxArray: ['grass/sbox_px.jpg','grass/sbox_nx.jpg','grass/sbox_py.jpg','grass/sbox_ny.jpg','grass/sbox_pz.jpg','grass/sbox_nz.jpg'] */
      skyboxArray: ['milkyway/posx.jpg','milkyway/negx.jpg','milkyway/posy.jpg','milkyway/negy.jpg','milkyway/posz.jpg','milkyway/negz.jpg']
      /* skyboxArray: ['jupiter/space_3_right.jpg','jupiter/space_3_left.jpg','jupiter/space_3_top.jpg','jupiter/space_3_bottom.jpg','jupiter/space_3_front.jpg','jupiter/space_3_back.jpg'] */
    }
  },
  mounted () {
    // Wait for DOM updated. Vue.nextTick() does not work
    setTimeout(() => {
      let fontLoader = new THREE.FontLoader()
      fontLoader.load('helvetiker_regular.typeface.json', (font) => {
        this.font = font
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
          let placeholderObject3d = new THREE.Object3D()
          this.modelObject3D.add(placeholderObject3d)

          this.collectClasses(placeholderObject3d, rootClass).then(res => {

            let rootClassObj3d = placeholderObject3d.getObjectByProperty('key', rootClass.id)
            let maxX = this.setPositionX(placeholderObject3d, rootClassObj3d, 0)
            let minY = this.setPositionY(placeholderObject3d, rootClassObj3d, 0)

            rootClassObj3d.drawClassConnectors (placeholderObject3d)

          })
        })
      }, (err) => console.log(err))
    }, 1000)
  },
  methods: {
    collectClasses (placeholderObject3d, classObj) {
      let rootClassObj3d = new classObject3d(classObj, this.font)
      placeholderObject3d.add(rootClassObj3d)
      this.selectableMeshArr.push(rootClassObj3d.children[0])
      let queryObj = {
        query: {
          where: {
            docProp: 'parentId',
            operator: 'eq',
            value: classObj.id
          }
        }
      }
      return this.$store.dispatch('query', queryObj).then((resultsArr) => {
        let promises = []
        resultsArr.forEach(subClassObj => {
          promises.push(this.collectClasses(placeholderObject3d, subClassObj))
        })
        return Promise.all(promises).then(childObjsArr => {
          classObj.subclasses = childObjsArr
          return (classObj)
        })
      })
    },
    setPositionX (placeholderObject3d, classObj3d, x) {
      let minX = x
      let maxX = x
      classObj3d.userData.subclasses.forEach(subClass => {
        let subClassObj3d = placeholderObject3d.getObjectByProperty('key', subClass.id)
        maxX = Math.max(x, this.setPositionX(placeholderObject3d, subClassObj3d, x))
        x = maxX + WIDTH * 2
      })
      classObj3d.position.setX(minX + (maxX - minX) / 2)
      return maxX
    },
    setPositionY (placeholderObject3d, classObj3d, y) {
      classObj3d.position.setY(y)
      let minY = y
      classObj3d.userData.subclasses.forEach(subClass => {
        let subClassObj3d = placeholderObject3d.getObjectByProperty('key', subClass.id)
        minY = Math.min(y, this.setPositionY(placeholderObject3d, subClassObj3d, y - HEIGHT * 2))
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
    }
</style>
