import TWEEN from '@tweenjs/tween.js'
import * as THREE from 'three'
// import * as TWEEN from '../../node_modules/three/examples/js/libs/tween.min.js';
// const TWEEN = require('../../node_modules/three/examples/js/libs/tween.min.js')
export default {
  name: 'Scene',
  props: {
    level: Number,
    viewId: String,
    width: {
      type: Number,
      default: undefined
    },
    height: {
      type: Number,
      default: undefined
    }
  },
  data () {
    return {
      skyboxArray: [],
      orbit: false
    }
  },
  mounted () {
    this.loadScene()
  },
  created () {
    this.$store.watch(state => state.levelIdsArr[this.level].selectedObjId, (newVal, oldVal) => {
      console.log('selectedObjId Changed!', newVal, oldVal)
      this.highlight(newVal, oldVal)
      this.moveCameraToPos(newVal)
    }, {immediate: false})
  },
  methods: {
    onOrbit (e) {
      this.orbit = !this.orbit
      this.controls.autoRotate = this.orbit
    },
    onResize () {
      if (!this.renderer) return
      if (this.width === undefined || this.height === undefined) {
        this.$nextTick(() => {
          let widthPx = window.getComputedStyle(this.$el).getPropertyValue('width')
          let heightPx = window.getComputedStyle(this.$el).getPropertyValue('height')
          let widthStr = widthPx.substring(0, widthPx.length - 2)
          let heightStr = heightPx.substring(0, heightPx.length - 2)
          let width = Number(widthStr)
          let height = Number(heightStr) - 3
          this.camera.aspect = width / height
          this.camera.updateProjectionMatrix()
          this.renderer.setSize(width, height)
          // this.controls.handleResize()
          this.render()
        })
      } else {
        this.$nextTick(() => {
          this.renderer.setSize(this.width, this.height)
        })
      }
    },
    getSceneIndexByKey (key) {
      for (let i = 0; i < this.scenes.length; i++) {
        if (this.scenes[i].key === key) {
          return i
        }
      }
      return -1
    },
    loadScene () {
      // world
      this.scene = new THREE.Scene()

      let sceneObject3D = new THREE.Object3D()
      this.modelObject3D = new THREE.Object3D()

      this.scene.add(sceneObject3D)
      this.scene.add(this.modelObject3D)

      this.selectableMeshArr = []

      // camera
      this.camera = new THREE.PerspectiveCamera(60, 3 / 2, 1, 100000)
      this.camera.position.z = 4000

      // renderer
      this.renderer = new THREE.WebGLRenderer({antialias: true})
      this.$el.appendChild(this.renderer.domElement)

      // controls
      this.controls = new THREE.OrbitControls(this.camera)
      this.controls.autoRotateSpeed = 0.125
      this.controls.minPolarAngle = Math.PI / 4
      this.controls.maxPolarAngle = Math.PI / 1.5

      // lights
      let light1 = new THREE.DirectionalLight(0xffffff)
      light1.position.set(1, 1, 1).normalize()
      sceneObject3D.add(light1)
      let light2 = new THREE.AmbientLight(0x404040)
      sceneObject3D.add(light2)

      // axes
      sceneObject3D.add(new THREE.AxisHelper(100))

      // raycaster
      this.raycaster = new THREE.Raycaster()

      // this.scene.background = new THREE.CubeTextureLoader().load(this.skyboxArray)
      // See https://stemkoski.github.io/Three.js/Skybox.html
      if (this.skyboxArray.length === 6) {
        let skyGeometry = new THREE.CubeGeometry(50000, 50000, 50000)
        let materialArray = []
        for (let i = 0; i < 6; i++) {
          materialArray.push(new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(this.skyboxArray[i]),
            side: THREE.BackSide
          }))
        }
        let skyMaterial = new THREE.MeshFaceMaterial(materialArray)
        this.skyBox = new THREE.Mesh(skyGeometry, skyMaterial)
        sceneObject3D.add(this.skyBox)
      }

      // else see http://threejs.org/examples/webgl_multiple_views.html

      sceneObject3D.name = 'Boilerplate'
      this.$el.addEventListener('click', this.onClick, false)

      this.onResize()
      this.render()
      this.animate()
    },
    render () {
      this.renderer.render(this.scene, this.camera)
    },

    animate () {
      requestAnimationFrame(this.animate.bind(this))
      TWEEN.update()
      this.skyBox.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z) // keep skybox centred around the camera
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },
    onClick (event) {
      // see https://threejs.org/docs/#api/core/Raycaster.setFromCamera
      event.preventDefault()

      // get 2D coordinates of the mouse, in normalized device coordinates (NDC)
      let box = event.target.getBoundingClientRect()
      let x = (event.offsetX / box.width) * 2 - 1
      let y = -(event.offsetY / box.height) * 2 + 1
      let mouse = new THREE.Vector2(x, y)

      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(mouse, this.camera)
      let intersects = this.raycaster.intersectObjects(this.selectableMeshArr)
      if (intersects.length > 0) {
        let selectedMesh = intersects[0].object
        // let normal = intersects[0].face.normal
        // console.log(normal)
        // var normalMatrix = new THREE.Matrix3().getNormalMatrix(selectedMesh.matrixWorld)
        // console.log(normal.clone().applyMatrix3(normalMatrix).normalize())
        this.$store.commit('SET_PAGE_STATE2', {
          level: this.level,
          selectedObjId: selectedMesh.parent.key
        })
      }
    },
    highlight (newVal, oldVal) {
      let currentlySelected = this.modelObject3D.getObjectByProperty('key', oldVal)
      if (currentlySelected) {
        currentlySelected.children[0].material = currentlySelected.getMaterial()
        currentlySelected.children[1].material = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
      }
      let newlySelected = this.modelObject3D.getObjectByProperty('key', newVal)
      if (newlySelected) {
        newlySelected.children[0].material = new THREE.MeshLambertMaterial({color: 0xEEEE00})
        newlySelected.children[1].material = new THREE.MeshLambertMaterial({color: 0x666666})
      }
    },
    moveCameraToPos (key) {
      let selectedModelObj = this.modelObject3D.getObjectByProperty('key', key)
      // console.log('selectedModelObj', selectedModelObj)
      this.scene.updateMatrixWorld()
      let newTargetPos = new THREE.Vector3()
      newTargetPos.setFromMatrixPosition(selectedModelObj.matrixWorld)

      new TWEEN.Tween(this.controls.target).easing(TWEEN.Easing.Quadratic.Out).to(newTargetPos, 1500).start()

      let cameraPos = this.controls.object.position.clone()
      let newCameraPos = newTargetPos.clone()
      newCameraPos.setZ(newCameraPos.z + 2000)
      newCameraPos.setY(newCameraPos.y + 250)
      let cameraTween = new TWEEN.Tween(cameraPos).to(newCameraPos, 1500)
      cameraTween.easing(TWEEN.Easing.Quadratic.Out)
      cameraTween.onUpdate(() => {
        // console.log('cameraPos', cameraPos)
        this.controls.object.position.set(cameraPos.x, cameraPos.y, cameraPos.z)
      })
      cameraTween.start()
    },
    addLoadingText () {
      let textMaterial = new THREE.MeshLambertMaterial({color: 0xEFEFEF})
      let text3d = new THREE.TextGeometry('Loading...', {size: 200, font: this.font})
      text3d.center()
      let textMesh = new THREE.Mesh(text3d, textMaterial)
      textMesh.name = 'Loading Message'
      textMesh.position.set(0, 400, 0)
      this.scene.add(textMesh)
    },
    removeLoadingText () {
      let mesh = this.scene.getObjectByName('Loading Message')

      this.scene.remove(mesh)
    }
  }
}
