<template>
    <div id="canvas-parent" v-resize="onResize" class="webglContainer">
    </div>
</template>


<script>
  import VueMixinTween from 'vue-mixin-tween';
//  import * as THREE from '../../node_modules/three/three.js' global.
//  const THREE = require('../../node_modules/three/three.js')
//  import * as Detector from '../../node_modules/three/examples/js/Detector.js'
//  import * as TWEEN from '../../node_modules/three/examples/js/libs/tween.min.js'
//  import  * as Projector from '../../node_modules/three/examples/js/renderers/Projector.js'
//  import * as TrackballControls from '../../node_modules/three/examples/js/controls/TrackballControls.js'
/*  import THREE from '../../node_modules/three/three.min.js'
  import Detector from '../../node_modules/three/examples/js/Detector.js'
  import TrackballControls from '../../node_modules/three/examples/js/controls/TrackballControls.js'
  import Projector from '../../node_modules/three/examples/js/renderers/Projector.js'
  import stats from '../../node_modules/three/examples/js/libs/stats.min.js'
  import tween from '../../node_modules/three/examples/js/libs/tween.min.js'*/

  const _log = console.log.bind(console);

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
      skyboxArray: {
        type: Array,
        default: () => {
          return [
            '../images/space_3_right.jpg',
            '../images/space_3_left.jpg',
            '../images/space_3_top.jpg?',
            '../images/space_3_bottom.jpg',
            '../images/space_3_front.jpg',
            '../images/space_3_back.jpg'
          ]
        }
      },
      width: {
        type: Number,
        default: 500
      },
      height: {
        type: Number,
        default: 500
      }
    },
    data () {
      return {
        size: {
          width: this.width,
          height: this.height
        },
        scene_index: -1,
        viewer: null,
        panorama: null,
        hotspots: []
      }
    },
    mounted () {
      this.onResize()
      this.loadScene()
    },
    methods: {
      onResize () {
        if (this.width === undefined || this.height === undefined) {
//          var heightString = this.$refs.canvasParent.clientHeightvar height = document.getElementById('myDiv').style.height;
          var rect = this.$el.getBoundingClientRect();
          console.log(rect.height);

          let style = window.getComputedStyle(this.$el).getPropertyValue("height");
          let width = style.width.substring(0, style.width.length-2)
          let height = style.height.substring(0, style.height.length-2)
          this.$nextTick(() => {

            this.renderer.setSize( width, height );
            /*this.size = {
              width: this.$el.clientWidth,
              height: this.$el.clientHeight
            }*/
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
        _log('this.scenes = ' + this.skyboxArray)

        // world
        this.scene = new THREE.Scene();

        let sceneObject3D = new THREE.Object3D();
        this.modelObject3D = new THREE.Object3D();

        this.scene.add(sceneObject3D);
        this.scene.add(this.modelObject3D);

        this.selectableMeshArr = [];

        //camera
        this.camera = new THREE.PerspectiveCamera( 60, 3 / 2, 1, 100000 );
        this.camera.position.z = 2000;
        //by changing the eulerOrder we can force the camera to keep its head level
        //see: http://stackoverflow.com/questions/17517937/three-js-camera-tilt-up-or-down-and-keep-horizon-level
        //this.camera.rotation.order = "YXZ";

        // renderer
        //this.renderer = new THREE.WebGLRenderer( {antialias: true} );
        if ( Detector.webgl ) this.renderer = new THREE.WebGLRenderer( {antialias: true} );
        else this.renderer = new THREE.CanvasRenderer();
//        this.renderer.setSize( this.size.width, this.size.height );
        this.$el.appendChild(this.renderer.domElement);


        //controls
        this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.panSpeed = 0.8;
        this.controls.noRotate = false;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;
        this.controls.keys = [ 65, 83, 68 ];
        //this.controls.addEventListener( 'change', this.render );
//        this.controls.addEventListener('change', e => this.render(e));
        this.controls.update()


        // lights
        let light1 = new THREE.DirectionalLight( 0xffffff );
        light1.position.set( 1, 1, 1 ).normalize();
        sceneObject3D.add( light1 );
        let light2 = new THREE.AmbientLight( 0x404040 );
        sceneObject3D.add( light2 );

        // axes
        sceneObject3D.add( new THREE.AxisHelper(100) );

        // projector
//        this.projector = new THREE.Projector();
        this.raycaster = new THREE.Raycaster();


        // See https://stemkoski.github.io/Three.js/Skybox.html
        if(this.skyboxArray.length == 6) {
          let skyGeometry = new THREE.CubeGeometry(50000, 50000, 50000);
          let materialArray = [];
          for (let i = 0; i < 6; i++)
            materialArray.push( new THREE.MeshBasicMaterial({
              map: THREE.ImageUtils.loadTexture( this.skyboxArray[i] ),
              side: THREE.BackSide
            }));
          let skyMaterial = new THREE.MeshFaceMaterial(materialArray);
          this.skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
          sceneObject3D.add( this.skyBox );
        }

        //else see http://threejs.org/examples/webgl_multiple_views.html
        // for canvas gradient
        if(this.displayFPS){
          stats = new Stats();
          stats.domElement.style.position = 'absolute';
          stats.domElement.style.top = '0px';
          this.domNode.appendChild( stats.domElement );
        }

        //this.connect(this.domNode, "onclick", "onClick");
        sceneObject3D.name = 'Boilerplate';




//        this.addEventListener('iron-resize', e => this.resize(e));

//        this.scene.container.addEventListener('click', e => this.onClick(e));


        this.animate();

      },
      render(){
        //console.log(camera.position.x);
        //this.camera.rotation.z = 0;// this is used to keep the camera level
        this.renderer.render( this.scene, this.camera );
      },

      animate(){
        requestAnimationFrame(this.animate.bind(this));
        //TWEEN.update();
        this.camera.up = new THREE.Vector3(0,1,0);// Keep the camera level
        this.skyBox.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z); //keep skybox centred around the camera
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
      },
      onClick(event){
        //see https://threejs.org/docs/#api/core/Raycaster.setFromCamera
        event.preventDefault();

        //get 2D coordinates of the mouse, in normalized device coordinates (NDC)
        //var x = event.offsetX - this.$.threejsNode.offsetLeft;
        //var y = event.offsetY - this.$.threejsNode.offsetTop;
        var box = event.target.getBoundingClientRect();
        var x = ( event.offsetX / box.width ) * 2 - 1;
        var y = - ( event.offsetY / box.height ) * 2 + 1;
        var mouse = new THREE.Vector2(x,y);

        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera( mouse, this.camera );
        var intersects = this.raycaster.intersectObjects( this.selectableMeshArr );
        if ( intersects.length > 0 ) {
          var selectedMesh = intersects[0].object;
          var key = selectedMesh.parent.userData.key;

          // Update the hash so that is reflects the current selected object3D
          // Ths will trigger the route.path observer
          var pathArr = this.route.path.split('.');
          var idx = (this.level+1)*4;
          var prevIdx = (this.level)*4;
          pathArr[prevIdx] = key;
          pathArr[idx] = key;
          //var pathArr = pathArr.slice(0, idx+2);
          var newPath = pathArr.join('.');
          this.set('route.path', newPath);
        }
      },
      moveCameraToPos(modelObj){
        //console.log('selected modelObj', modelObj.name);

        this.scene.updateMatrixWorld();
        var newTargetPos = new THREE.Vector3();
        newTargetPos.setFromMatrixPosition(modelObj.matrixWorld);

        var newCameraPos = newTargetPos.clone();
        newCameraPos.z = 2000;
        var cameraPos = this.camera.position;
        var target = this.controls.target;
        var fromPos = {tx: target.x, ty: target.y, tz: target.z, cx: cameraPos.x, cy: cameraPos.y, cz: cameraPos.z};
        var toPos = {tx: newTargetPos.x, ty: newTargetPos.y, tz: newTargetPos.z, cx: newCameraPos.x, cy: newCameraPos.y, cz: newCameraPos.z};
        var tween = new TWEEN.Tween(fromPos).to(toPos, 1500);
        tween.easing(TWEEN.Easing.Quadratic.Out);

        var controls = this.controls;
        tween.onUpdate(function(){
          var tweenTargetPos = new THREE.Vector3(this.tx, this.ty, this.tz);
          var tweenCameraPos = new THREE.Vector3(this.cx, this.cy, this.cz);
          //console.log('tweenCameraPos', tweenCameraPos);
          controls.object.position.set( tweenCameraPos.x, tweenCameraPos.y, tweenCameraPos.z );
          controls.target = tweenTargetPos;
        });
        tween.start();
      }
    }
  }

  /*function addHotspot (scene, targetScene) {
    var pos = {
      x: targetScene.x,
      y: targetScene.y,
      z: targetScene.z
    }

    var geometry = new THREE.RingGeometry(8, 13, 100, 100)
    var material = new THREE.MeshPhongMaterial({
      color: 1668818,
      emissive: 0xffffff,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      polygonOffset: !0,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4
    })

    var geometryBorder = new THREE.CircleGeometry(9, 32, 32)
    var materialBorder = new THREE.MeshPhongMaterial()
    materialBorder.copy(material)

    materialBorder.opacity = 0.5

    var circle = new THREE.Mesh(geometryBorder)

    var hotspot = new THREE.Mesh(geometry)

    var merged = new THREE.Geometry()

    circle.updateMatrix()
    merged.merge(circle.geometry, circle.matrix, 0)
    hotspot.updateMatrix()

    merged.merge(hotspot.geometry, hotspot.matrix, 1)

    var group = new THREE.Mesh(merged, new THREE.MeshFaceMaterial([material, materialBorder]))

    group.rotation.set(toRadian(90), 0, 0)
    group.position.set(pos.x, pos.y - 100, pos.z)

    group.type = 'hotspot'

    group.targetScene = targetScene

    return group
  }

  function addArrow (scene, targetScene) {
    var arrowGeometry = makeArrowGeometry()
    var arrowMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.8,
      color: 1668818,
      emissive: 0xffffff,
      side: THREE.DoubleSide,
      polygonOffset: !0,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4
    })

    var arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)

    var x1 = targetScene.x
    var z1 = targetScene.z
    var x2 = scene.x
    var z2 = scene.z

    var ath = toDegree(Math.atan2((z1 - z2), (x1 - x2)))

    arrow.rotation.set(toRadian(90), 0, toRadian(ath))

    var arrowPos = sphereToWorld(ath, 0)

    arrow.position.set(arrowPos.x, arrowPos.y, arrowPos.z)
    arrow.type = 'arrow'
    arrow.targetScene = targetScene
    return arrow
  }

  function makeArrowGeometry () {
    var t = 1 / 10.0
    var i = 2 * t / 3
    var n = t * Math.cos(60 * THREE.Math.DEG2RAD)
    var r = t * Math.sin(60 * THREE.Math.DEG2RAD)
    var o = new THREE.Shape()
    o.moveTo(i, 0)
    o.lineTo(i - n, r)
    o.lineTo(-n, r)
    o.lineTo(0, 0)
    o.lineTo(-n, -r)
    o.lineTo(i - n, -r)
    o.lineTo(i, 0)
    return new THREE.ShapeGeometry(o)
  }

  function sphereToWorld (ath, atv) {
    var d = 1 / 2.0
    ath += 90
    var mY = -d * Math.sin(toRadian(atv))
    var r = -d * Math.cos(toRadian(atv))
    var mX = r * Math.sin(toRadian(-ath))
    var mZ = r * Math.cos(toRadian(-ath))

    return new THREE.Vector3(mX, mY, mZ)
  }
  function toRadian (a) {
    return a * Math.PI / 180.0
  }

  function toDegree (a) {
    return a * 180.0 / Math.PI
  }*/
</script>

<style scoped>
    .webglContainer {
        /*cursor: pointer;*/
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        margin: 0;
        border: 0;
        padding: 0;
    }

</style>