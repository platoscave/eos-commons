<template>
    <div id="canvas-parent" v-resize="onResize" class="webglContainer">
    </div>
</template>


<script>
  import VueMixinTween from 'vue-mixin-tween';

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
            'space_3_right.jpg',
            'space_3_left.jpg',
            'space_3_top.jpg?',
            'space_3_bottom.jpg',
            'space_3_front.jpg',
            'space_3_back.jpg'
          ]
        }
      },
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
          this.$nextTick(() => {
            let widthPx = window.getComputedStyle(this.$el).getPropertyValue("width");
            let heightPx = window.getComputedStyle(this.$el).getPropertyValue("height");
            let width = widthPx.substring(0, widthPx.length-2)
            let height = heightPx.substring(0, heightPx.length-2)
            this.renderer.setSize( width, height );
          })
        }
        else {
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