
import VueMixinTween from 'vue-mixin-tween'
export default {
  name: 'Scene',
  mixins: [
    // The only required argument is the name of the property to tween.
    // The default duration is 500 milliseconds.
    // The default timing function is TWEEN.Easing.Quadratic.Out
    // We're using a "custom" linear timing function here.
    VueMixinTween('numberOfAlligators', 5000, (pos) => pos)
  ],
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
      skyboxArray: []
    }
  },
  mounted () {
    this.loadScene()
  },
  methods: {
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
          this.renderer.setSize(width, height)
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
      this.camera.position.z = 2000
      // by changing the eulerOrder we can force the camera to keep its head level
      // see: http://stackoverflow.com/questions/17517937/three-js-camera-tilt-up-or-down-and-keep-horizon-level
      // this.camera.rotation.order = "YXZ";

      // renderer
      // this.renderer = new THREE.WebGLRenderer( {antialias: true} );
      if (Detector.webgl) this.renderer = new THREE.WebGLRenderer({antialias: true})
      else this.renderer = new THREE.CanvasRenderer()
      //        this.renderer.setSize( this.size.width, this.size.height );
      this.onResize()
      this.$el.appendChild(this.renderer.domElement)

      // controls
      this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement)
      this.controls.rotateSpeed = 1.0
      this.controls.zoomSpeed = 1.2
      this.controls.panSpeed = 0.8
      this.controls.noRotate = false
      this.controls.noZoom = false
      this.controls.noPan = false
      this.controls.staticMoving = true
      this.controls.dynamicDampingFactor = 0.3
      this.controls.keys = [ 65, 83, 68 ]
      // this.controls.addEventListener( 'change', this.render );
      //        this.controls.addEventListener('change', e => this.render(e));
      this.controls.update()

      // lights
      let light1 = new THREE.DirectionalLight(0xffffff)
      light1.position.set(1, 1, 1).normalize()
      sceneObject3D.add(light1)
      let light2 = new THREE.AmbientLight(0x404040)
      sceneObject3D.add(light2)

      // axes
      sceneObject3D.add(new THREE.AxisHelper(100))

      // projector
      //        this.projector = new THREE.Projector();
      this.raycaster = new THREE.Raycaster()

      // See https://stemkoski.github.io/Three.js/Skybox.html
      if (this.skyboxArray.length == 6) {
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
      // for canvas gradient
      if (this.displayFPS) {
        stats = new Stats()
        stats.domElement.style.position = 'absolute'
        stats.domElement.style.top = '0px'
        this.domNode.appendChild(stats.domElement)
      }

      // this.connect(this.domNode, "onclick", "onClick");
      sceneObject3D.name = 'Boilerplate'
      //        this.scene.container.addEventListener('click', e => this.onClick(e));
      this.render()
      this.animate()
    },
    render () {
      // console.log(camera.position.x);
      // this.camera.rotation.z = 0;// this is used to keep the camera level
      this.renderer.render(this.scene, this.camera)
    },

    animate () {
      requestAnimationFrame(this.animate.bind(this))
      // TWEEN.update();
      this.camera.up = new THREE.Vector3(0, 1, 0)// Keep the camera level
      this.skyBox.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z) // keep skybox centred around the camera
      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },
    onClick (event) {
      // see https://threejs.org/docs/#api/core/Raycaster.setFromCamera
      event.preventDefault()

      // get 2D coordinates of the mouse, in normalized device coordinates (NDC)
      // let x = event.offsetX - this.$.threejsNode.offsetLeft;
      // let y = event.offsetY - this.$.threejsNode.offsetTop;
      let box = event.target.getBoundingClientRect()
      let x = (event.offsetX / box.width) * 2 - 1
      let y = -(event.offsetY / box.height) * 2 + 1
      let mouse = new THREE.Vector2(x, y)

      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(mouse, this.camera)
      let intersects = this.raycaster.intersectObjects(this.selectableMeshArr)
      if (intersects.length > 0) {
        let selectedMesh = intersects[0].object
        let key = selectedMesh.parent.userData.key

        // Update the hash so that is reflects the current selected object3D
        // Ths will trigger the route.path observer
        let pathArr = this.route.path.split('.')
        let idx = (this.level + 1) * 4
        let prevIdx = (this.level) * 4
        pathArr[prevIdx] = key
        pathArr[idx] = key
        // let pathArr = pathArr.slice(0, idx+2);
        let newPath = pathArr.join('.')
        this.set('route.path', newPath)
      }
    },
    moveCameraToPos (modelObj) {
      // console.log('selected modelObj', modelObj.name);

      this.scene.updateMatrixWorld()
      let newTargetPos = new THREE.Vector3()
      newTargetPos.setFromMatrixPosition(modelObj.matrixWorld)

      let newCameraPos = newTargetPos.clone()
      newCameraPos.z = 2000
      let cameraPos = this.camera.position
      let target = this.controls.target
      let fromPos = {tx: target.x, ty: target.y, tz: target.z, cx: cameraPos.x, cy: cameraPos.y, cz: cameraPos.z}
      let toPos = {tx: newTargetPos.x, ty: newTargetPos.y, tz: newTargetPos.z, cx: newCameraPos.x, cy: newCameraPos.y, cz: newCameraPos.z}
      let tween = new TWEEN.Tween(fromPos).to(toPos, 1500)
      tween.easing(TWEEN.Easing.Quadratic.Out)

      let controls = this.controls
      tween.onUpdate(function () {
        let tweenTargetPos = new THREE.Vector3(this.tx, this.ty, this.tz)
        let tweenCameraPos = new THREE.Vector3(this.cx, this.cy, this.cz)
        // console.log('tweenCameraPos', tweenCameraPos);
        controls.object.position.set(tweenCameraPos.x, tweenCameraPos.y, tweenCameraPos.z)
        controls.target = tweenTargetPos
      })
      tween.start()
    }
  }
}
