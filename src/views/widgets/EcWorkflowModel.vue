<template>
  <div class="no-overflow">
    <v-btn class="button-top" absolute dark fab small right color="pink" @click="onOrbit">
      <v-icon>{{orbit ? "flare" : "360"}}</v-icon>
    </v-btn>
    <div v-resize="onResize" v-on:click="onClick"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import Scene from "../../lib/sceneMixin.js";
import TWEEN from "@tweenjs/tween.js";
import { Water } from "three/examples/jsm/objects/Water2.js";
import { Refractor } from "three/examples/jsm/objects/Refractor.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { WaterRefractionShader } from 'three/examples/jsm/shaders/WaterRefractionShader.js';

const WIDTH = 400;
const HEIGHT = 200;
const DEPTH = 200;

export default {
  name: "workflowModel",
  mixins: [Scene],
  data() {
    return {
      skyboxArray: ['islands/skybox_e.jpg', 'islands/skybox_w.jpg', 'islands/skybox_t.jpg', 'islands/skybox_b.jpg', 'islands/skybox_n.jpg', 'islands/skybox_s.jpg']
    };
  },
  mounted: async function() {
    this.addLoadingText();

    this.macroEconomicModel(0);

    this.removeLoadingText();
  },
  methods: {
    macroEconomicModel: function(zPos) {

      const TANSACTIONBALANCES = new THREE.Vector3(0, - HEIGHT * 4, 0)
      const IDLEBALANCES = new THREE.Vector3( WIDTH, HEIGHT * 2, 0)
      const FOREIGNBALANCES = new THREE.Vector3( WIDTH, - HEIGHT, 0)

      let macroEconomicModelObject3d = new THREE.Object3D();
      this.modelObject3D.add(macroEconomicModelObject3d);

      let transBalObj3d = this.getTankObject3D('Transaction Balances')
      transBalObj3d.position.set(TANSACTIONBALANCES.x, TANSACTIONBALANCES.y, TANSACTIONBALANCES.z)
      macroEconomicModelObject3d.add(transBalObj3d);

      let idleBalObj3d = this.getTankObject3D('Idle Balances')
      idleBalObj3d.position.set(IDLEBALANCES.x, IDLEBALANCES.y, IDLEBALANCES.z)
      macroEconomicModelObject3d.add(idleBalObj3d);

      let forBalObj3d = this.getTankObject3D('Foreign Owned Balances')
      forBalObj3d.position.set(FOREIGNBALANCES.x, FOREIGNBALANCES.y, FOREIGNBALANCES.z)
      macroEconomicModelObject3d.add(forBalObj3d);

   

      // Pipe

      const fromPos = new THREE.Vector3(TANSACTIONBALANCES.x, TANSACTIONBALANCES.y - HEIGHT / 2, TANSACTIONBALANCES.z);
      const toPos = new THREE.Vector3(TANSACTIONBALANCES.x, TANSACTIONBALANCES.y + HEIGHT / 2, TANSACTIONBALANCES.z);

      let points = [];
      points.push(fromPos);
      points.push(new THREE.Vector3(fromPos.x - 40, fromPos.y - HEIGHT, fromPos.z));
      points.push(new THREE.Vector3(fromPos.x - WIDTH * 2, fromPos.y - HEIGHT, fromPos.z));
      points.push(new THREE.Vector3(fromPos.x - WIDTH * 2, IDLEBALANCES.y + HEIGHT * 3, fromPos.z));
      points.push(new THREE.Vector3(fromPos.x, IDLEBALANCES.y + HEIGHT * 3, fromPos.z));
      points.push(toPos);
      
      const pipeMaterial = new THREE.MeshPhongMaterial({
        color: 0x4040ff,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
        //depthTest: false,
        transparent: true,
      });

      let curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.20 ); //SplineCurve3
      let tubeGeometry = new THREE.TubeGeometry(curve, 64, 50, 8, false);
      let tubeMesh = new THREE.Mesh(tubeGeometry, pipeMaterial);
      macroEconomicModelObject3d.add(tubeMesh);

      // Cone

      let coneMaterial = new THREE.MeshLambertMaterial({ color: 0xffdf00 });
      let coneGeometry = new THREE.CylinderGeometry(0, 10, 50, 40, 40, false);
      let coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);

      let t = 0;
      var matrix = new THREE.Matrix4();
      var up = new THREE.Vector3(0, 1, 0);
      var axis = new THREE.Vector3();
      var pt, radians, axis, tangent;

      // set the marker position
      pt = curve.getPoint(t);
      coneMesh.position.set(pt.x, pt.y, pt.z);

      // get the tangent to the curve
      tangent = curve.getTangent(t).normalize();

      // calculate the axis to rotate around
      axis.crossVectors(up, tangent).normalize();

      // calcluate the angle between the up vector and the tangent
      radians = Math.acos(up.dot(tangent));

      // set the quaternion
      coneMesh.quaternion.setFromAxisAngle(axis, radians);
      macroEconomicModelObject3d.add(coneMesh);

      let waterTween = new TWEEN.Tween({ tx: 0 }).to({ tx: 1 }, 8000);
      waterTween.easing(TWEEN.Easing.Linear.None);
      waterTween.onUpdate(obj => {
        // console.log('tx', obj.tx)
        // set the marker position
        pt = curve.getPoint(obj.tx);
        coneMesh.position.set(pt.x, pt.y, pt.z);

        // get the tangent to the curve
        tangent = curve.getTangent(obj.tx).normalize();

        // calculate the axis to rotate around
        axis.crossVectors(up, tangent).normalize();

        // calcluate the angle between the up vector and the tangent
        radians = Math.acos(up.dot(tangent));

        // set the quaternion
        coneMesh.quaternion.setFromAxisAngle(axis, radians);
      });
      waterTween.repeat(Infinity); // repeats forever
      waterTween.start();
    },


    getTankObject3D: function( text ) {

      let tankObject3d = new THREE.Object3D();

      // Water Body

      const waterMaterial = new THREE.MeshBasicMaterial({
        color: 0x4040ff,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
        //depthTest: true,
        transparent: true
      });


      var waterGeometry = new THREE.BoxBufferGeometry( WIDTH, HEIGHT  /2, DEPTH);
      let waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
      waterMesh.position.set(0, -HEIGHT / 4, 0);

      tankObject3d.add(waterMesh);



      // Tank rectangle

      const tankMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        opacity: 0.2,
        side: THREE.DoubleSide,
        //depthWrite: false,
        //depthTest: false,
        transparent: true,
      });
      var materialTransparent =  new THREE.MeshBasicMaterial( { transparent: true, opacity: 0, wireframe: true, side: THREE.DoubleSide} );
      var materials = [ tankMaterial, tankMaterial, materialTransparent, tankMaterial, tankMaterial, tankMaterial ]
      var tankGeometry = new THREE.BoxBufferGeometry( WIDTH, HEIGHT, DEPTH);
      let tankMesh = new THREE.Mesh(tankGeometry, materials);

      tankObject3d.add(tankMesh);
      this.selectableMeshArr.push(tankMesh)


      //makeCanvasLabel:function (text, maxWidth, size, color, backgroundColor) 
      const textMesh = this.makeCanvasLabel(text, WIDTH, 30, 'black', 'rgba(215, 219, 221, 0.5)')
      textMesh.position.set(0, - HEIGHT / 4, DEPTH / 2 +20)
      tankObject3d.add(textMesh);


      const frameMaterial = new THREE.MeshPhongMaterial({
        color: 0xe0e0e0,
        //opacity: 0.3,
        //side: THREE.DoubleSide,
        //depthWrite: false
        //depthTest: false,
        //transparent: true,
      });

      var wireframe = new THREE.EdgesGeometry( tankGeometry );
      const vectorArray = wireframe.attributes.position.array;

      for ( let i = 0;  i < vectorArray.length; i += 6 ) {
        let points = []
        points.push( new THREE.Vector3(vectorArray[i], vectorArray[i+1], vectorArray[i+2]))
        points.push( new THREE.Vector3(vectorArray[i+3], vectorArray[i+4], vectorArray[i+5]))

        let curve = new THREE.CatmullRomCurve3(points);
        let tubeGeometry = new THREE.TubeGeometry(curve, 10, 10, 8, false);
        let tubeMesh = new THREE.Mesh(tubeGeometry, frameMaterial);
        tankObject3d.add(tubeMesh);

        var geometry = new THREE.SphereGeometry( 10, 32, 32 );
        var sphereMesh = new THREE.Mesh( geometry, frameMaterial );
        sphereMesh.position.set(vectorArray[i], vectorArray[i+1], vectorArray[i+2]);
        tankObject3d.add( sphereMesh );
      }




      // water surface https://github.com/mrdoob/three.js/blob/master/examples/webgl_water.html
      // and https://jsfiddle.net/6ym08593/

      var textureLoader = new THREE.TextureLoader();
      var waterGeometry = new THREE.PlaneBufferGeometry(WIDTH, DEPTH);
      var flowMap = textureLoader.load('https://threejs.org/examples/textures/water/Water_1_M_Flow.jpg');

      const water = new Water(waterGeometry, {
        color: '#ffffff',
        scale: 4,
        flowDirection: new THREE.Vector2(1, 1),
        textureWidth: 1024,
        textureHeight: 1024,
        flowMap: flowMap,
        normalMap0: textureLoader.load('https://threejs.org/examples/textures/water/Water_1_M_Normal.jpg'),
        normalMap1: textureLoader.load('https://threejs.org/examples/textures/water/Water_2_M_Normal.jpg')
      });

      water.position.set(0, 2, 0);
      water.rotation.x = Math.PI * -0.5;
      tankObject3d.add(water);


      return tankObject3d
    }
  }
};
</script>

<style scoped>
.button-top {
  top: 10px;
}
.no-overflow {
  overflow: hidden;
  height: 100%;
}
</style>
