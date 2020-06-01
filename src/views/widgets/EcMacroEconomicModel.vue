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

const IDLEBALANCES = new THREE.Vector3( WIDTH * 1.25, HEIGHT * 2.5, 0)
const FOREIGNBALANCES = new THREE.Vector3( WIDTH * 1.25, - HEIGHT * 2.5, 0)
const TANSACTIONBALANCES = new THREE.Vector3(0, - HEIGHT * 5, 0)

export default {
  name: "macroEconimicModel",
  mixins: [Scene],
  data() {
    return {
      skyboxArray: ['islands/skybox_e.jpg', 'islands/skybox_w.jpg', 'islands/skybox_t.jpg', 'islands/skybox_b.jpg', 'islands/skybox_n.jpg', 'islands/skybox_s.jpg']
      //skyboxArray: ['dawnmountain/dawnmountain-posx.png', 'dawnmountain/dawnmountain-negx.png', 'dawnmountain/dawnmountain-posy.png', 'dawnmountain/dawnmountain-negy.png', 'dawnmountain/dawnmountain-posz.png', 'dawnmountain/dawnmountain-negz.png']
    };
  },
  mounted: async function() {
    this.addLoadingText();

    this.macroEconomicModel(0);

    this.removeLoadingText();
  },
  methods: {
    macroEconomicModel: function(zPos) {

      let macroEconomicModelObject3d = new THREE.Object3D();
      this.glModelObject3D.add(macroEconomicModelObject3d);

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
      
      const pipeMaterial = new THREE.MeshPhongMaterial({
        color: 0x4040ff,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
        //depthTest: false,
        transparent: true,
      });



      

      // incomePipe pipe
      let incomePipeObject3D = this.getIncomePipeObject3D( pipeMaterial )
      macroEconomicModelObject3d.add(incomePipeObject3D);

      // Savings pipe
      let savingsPipeObject3D = this.getToRightPipeObject3D( 'Savings (S)', pipeMaterial )
      savingsPipeObject3D.position.set(IDLEBALANCES.x, IDLEBALANCES.y, IDLEBALANCES.z)
      macroEconomicModelObject3d.add(savingsPipeObject3D);

      // Investment pipe
      let investmentsPipeObject3D = this.getToLeftPipeObject3D( 'Investments (I)', pipeMaterial )
      investmentsPipeObject3D.position.set(IDLEBALANCES.x, IDLEBALANCES.y, IDLEBALANCES.z)
      macroEconomicModelObject3d.add(investmentsPipeObject3D);

      // Import pipe
      let importPipeObject3D = this.getToRightPipeObject3D( 'Import (M)', pipeMaterial )
      importPipeObject3D.position.set(FOREIGNBALANCES.x, FOREIGNBALANCES.y, FOREIGNBALANCES.z)
      macroEconomicModelObject3d.add(importPipeObject3D);

      // Export pipe
      let exportPipeObject3D = this.getToLeftPipeObject3D( 'Export (X)', pipeMaterial )
      exportPipeObject3D.position.set(FOREIGNBALANCES.x, FOREIGNBALANCES.y, FOREIGNBALANCES.z)
      macroEconomicModelObject3d.add(exportPipeObject3D);
      
      // Tax Government spending pipe
      let taxPipeObject3D = this.getTaxPipeObject3D( pipeMaterial )
      taxPipeObject3D.position.set(0, IDLEBALANCES.y, 0)
      macroEconomicModelObject3d.add(taxPipeObject3D);

      // Cone

 
    },


    getTankObject3D: function( text ) {

      const getRandomKey = () => {
          // base32 encoded 64-bit integers. This means they are limited to the characters a-z, 1-5, and '.' for the first 12 characters.
          // If there is a 13th character then it is restricted to the first 16 characters ('.' and a-p).
          var characters = 'abcdefghijklmnopqrstuvwxyz12345'
          var randomKey = ''
          for (var i = 0; i < 12; i++) {
              randomKey += characters.charAt(Math.floor(Math.random() * characters.length))
          }
          return randomKey
      }

      let tankObject3d = new THREE.Object3D();
      tankObject3d.key = getRandomKey()
      tankObject3d.name = text


      // Tank rectangle

      const tankMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        opacity: 0.2,
        side: THREE.DoubleSide,
        //depthWrite: false,
        //depthTest: false,
        transparent: true,
      });
      let materialTransparent =  new THREE.MeshBasicMaterial( { transparent: true, opacity: 0, wireframe: true, side: THREE.DoubleSide} );
      let materials = [ tankMaterial, tankMaterial, materialTransparent, tankMaterial, tankMaterial, tankMaterial ]
      let tankGeometry = new THREE.BoxBufferGeometry( WIDTH, HEIGHT, DEPTH);
      let tankMesh = new THREE.Mesh(tankGeometry, materials);

      tankObject3d.add(tankMesh);
      this.selectableMeshArr.push(tankMesh)



      // Water Body

      const waterMaterial = new THREE.MeshBasicMaterial({
        color: 0x4040ff,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
        //depthTest: true,
        transparent: true
      });


      let waterGeometry = new THREE.BoxBufferGeometry( WIDTH, HEIGHT  /2, DEPTH);
      let waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
      waterMesh.position.set(0, -HEIGHT / 4, 0);

      tankObject3d.add(waterMesh);




      const textMesh = this.makeCanvasLabel(text, WIDTH, 30, 'black', 'rgba(215, 219, 221, 0.7)')
      textMesh.position.set(0, - HEIGHT / 4, DEPTH / 2 +20)
      tankObject3d.add(textMesh);


      const frameMaterial = new THREE.MeshPhongMaterial({
        color: 0xe0e0e0,
      });

      let wireframe = new THREE.EdgesGeometry( tankGeometry );
      const vectorArray = wireframe.attributes.position.array;

      for ( let i = 0;  i < vectorArray.length; i += 6 ) {
        let points = []
        points.push( new THREE.Vector3(vectorArray[i], vectorArray[i+1], vectorArray[i+2]))
        points.push( new THREE.Vector3(vectorArray[i+3], vectorArray[i+4], vectorArray[i+5]))

        let curve = new THREE.CatmullRomCurve3(points);
        let tubeGeometry = new THREE.TubeGeometry(curve, 10, 10, 8, false);
        let tubeMesh = new THREE.Mesh(tubeGeometry, frameMaterial);
        tankObject3d.add(tubeMesh);

        let geometry = new THREE.SphereGeometry( 10, 32, 32 );
        let sphereMesh = new THREE.Mesh( geometry, frameMaterial );
        sphereMesh.position.set(vectorArray[i], vectorArray[i+1], vectorArray[i+2]);
        tankObject3d.add( sphereMesh );
      }

      // water surface https://github.com/mrdoob/three.js/blob/master/examples/webgl_water.html
      // and https://jsfiddle.net/6ym08593/

      let textureLoader = new THREE.TextureLoader();
      let waterSurfaceGeometry = new THREE.PlaneBufferGeometry(WIDTH, DEPTH);
      let flowMap = textureLoader.load('https://threejs.org/examples/textures/water/Water_1_M_Flow.jpg');

      const water = new Water(waterSurfaceGeometry, {
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
    },
    getIncomePipeObject3D: function( pipeMaterial ) {
      let object3d = new THREE.Object3D();

      let TOP = IDLEBALANCES.y + HEIGHT * 4
      let BOTTOM = TANSACTIONBALANCES.y - HEIGHT * 1.5
      let LEFT = - WIDTH * 2

      let downPipe1 = this.getPipeObject3D( HEIGHT, pipeMaterial )
      downPipe1.rotateZ( -Math.PI / 2 );
      downPipe1.position.set(0, TANSACTIONBALANCES.y - HEIGHT / 2, 0)
      object3d.add(downPipe1);

      let cornerDownPipe1 = this.getCornerObject3D( )
      cornerDownPipe1.position.set(0, BOTTOM, 0)
      cornerDownPipe1.rotateZ( Math.PI);
      object3d.add(cornerDownPipe1);

      let leftPipe = this.getPipeObject3D( WIDTH * 2, pipeMaterial )
      leftPipe.rotateZ( -Math.PI );
      leftPipe.translateY(BOTTOM)
      leftPipe.position.set( 0, BOTTOM, 0)
      object3d.add(leftPipe);

      let cornerLeftPipe = this.getCornerObject3D( )
      cornerLeftPipe.position.set(LEFT, BOTTOM, 0)
      cornerLeftPipe.rotateZ( Math.PI / 2);
      object3d.add(cornerLeftPipe);

      let upPipe = this.getPipeObject3D( TOP - BOTTOM, pipeMaterial )
      upPipe.rotateZ( Math.PI / 2 );
      upPipe.position.set( LEFT, BOTTOM, 0)
      object3d.add(upPipe);

      let cornerUpPipe = this.getCornerObject3D( )
      cornerUpPipe.position.set(LEFT, TOP, 0)
      object3d.add(cornerUpPipe);

      let rightPipe = this.getPipeObject3D( WIDTH * 2, pipeMaterial )
      rightPipe.position.set( LEFT, TOP, 0)
      object3d.add(rightPipe);

      let cornerRightPipe = this.getCornerObject3D( )
      cornerRightPipe.position.set(0, TOP, 0)
      cornerRightPipe.rotateZ( - Math.PI / 2);
      object3d.add(cornerRightPipe);

      let downPipe2 = this.getPipeObject3D( HEIGHT * 11.5, pipeMaterial )
      downPipe2.rotateZ( -Math.PI / 2 );
      downPipe2.position.set(0, TOP, 0)
      object3d.add(downPipe2);

      // Add Labels
      const incomeTextMesh = this.makeCanvasLabel('Income (Y)', WIDTH, 40, 'black', 'rgba(215, 219, 221, 0.7)')
      incomeTextMesh.position.set( - WIDTH, TOP, 50)
      object3d.add(incomeTextMesh);

      const disposeTextMesh = this.makeCanvasLabel('Disposable Income', WIDTH, 40, 'black', 'rgba(215, 219, 221, 0.7)')
      disposeTextMesh.position.set(0, IDLEBALANCES.y + HEIGHT * 2, 50)
      object3d.add(disposeTextMesh);

      const consumptioTextMesh = this.makeCanvasLabel('Consumption Spending (C)', WIDTH, 40, 'black', 'rgba(215, 219, 221, 0.7)')
      consumptioTextMesh.position.set(0, IDLEBALANCES.y, 50)
      object3d.add(consumptioTextMesh);

      const domesticTextMesh = this.makeCanvasLabel('Domestic Spending', WIDTH, 40, 'black', 'rgba(215, 219, 221, 0.7)')
      domesticTextMesh.position.set(0, 0, 50)
      object3d.add(domesticTextMesh);

      const totalExpTextMesh = this.makeCanvasLabel('Total Expenditures (AE)', 500, 40, 'black', 'rgba(215, 219, 221, 0.7)')
      totalExpTextMesh.position.set(0, FOREIGNBALANCES.y, 50)
      object3d.add(totalExpTextMesh);

      return object3d
    },

    getPipeObject3D: function( length, pipeMaterial ) {
      let object3d = new THREE.Object3D();

      let points = [];
      points.push(new THREE.Vector3(-length / 2, 0, 0));
      points.push(new THREE.Vector3(length / 2, 0, 0));

      let curve = new THREE.CatmullRomCurve3(points, false); //SplineCurve3
      let tubeGeometry = new THREE.TubeGeometry(curve, 500, 50, 8, false);
      let tubeMesh = new THREE.Mesh(tubeGeometry, pipeMaterial);
      tubeMesh.translateX(length / 2)
      object3d.add(tubeMesh);

      // Add currency
      let currenciesObj3d = this.getCurrenciesObject3D( curve )
      currenciesObj3d.translateX(length / 2)
      object3d.add(currenciesObj3d);
      
      return object3d
    },

    getCornerObject3D: function( ) {
      let object3d = new THREE.Object3D();

      const cornerMaterial = new THREE.MeshPhongMaterial({
        color: 0xe0e0e0
      });

      let sphereGeometry = new THREE.SphereBufferGeometry( 52, 32, 32 );
      let sphereMesh = new THREE.Mesh(sphereGeometry, cornerMaterial);
      object3d.add(sphereMesh);

      var rightCylGeo = new THREE.CylinderBufferGeometry( 52, 52, 100, 8, 1, false );
      let rightCylMesh = new THREE.Mesh(rightCylGeo, cornerMaterial);
      rightCylMesh.position.set( 50, 0, 0)
      rightCylMesh.rotateZ( -Math.PI / 2);
      object3d.add(rightCylMesh);

      var downCylGeo = new THREE.CylinderBufferGeometry( 52, 52, 100, 8, 1, false );
      let downCylMesh = new THREE.Mesh(downCylGeo, cornerMaterial);
      downCylMesh.position.set( 0, -50, 0)
      object3d.add(downCylMesh);

      return object3d
    },
    getToRightPipeObject3D: function( text, pipeMaterial ) {
      let object3d = new THREE.Object3D();
      
      let points = [];
      points.push(new THREE.Vector3(-WIDTH *1.25, HEIGHT * 1.5, 0))
      points.push(new THREE.Vector3(-WIDTH * 0.25 - 30, HEIGHT, 0))
      points.push(new THREE.Vector3(-WIDTH * 0.25, HEIGHT / 2, 0))


      let curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.30 ); //SplineCurve3
      let tubeGeometry = new THREE.TubeGeometry(curve, 64, 30, 8, false);
      let tubeMesh = new THREE.Mesh(tubeGeometry, pipeMaterial);
      object3d.add(tubeMesh);

      // Add currency
      let currenciesObj3d = this.getCurrenciesObject3D( curve )
      object3d.add(currenciesObj3d);

      // Add Labels
      const textMesh = this.makeCanvasLabel(text, WIDTH, 30, 'black', 'rgba(215, 219, 221, 0.7)')
      textMesh.position.set(-WIDTH / 2, HEIGHT * 1.2, 50)
      object3d.add(textMesh);

      return object3d
    },
    getToLeftPipeObject3D: function( text, pipeMaterial ) {
      let object3d = new THREE.Object3D();
      
      let points = [];
      points.push(new THREE.Vector3(-WIDTH * 0.25, - HEIGHT / 2, 0))
      points.push(new THREE.Vector3(-WIDTH * 0.25 - 30, - HEIGHT, 0))
      points.push(new THREE.Vector3(-WIDTH *1.25, - HEIGHT * 1.5, 0))


      let curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.30 ); //SplineCurve3
      let tubeGeometry = new THREE.TubeGeometry(curve, 64, 30, 8, false);
      let tubeMesh = new THREE.Mesh(tubeGeometry, pipeMaterial);
      object3d.add(tubeMesh);

      // Add currency
      let currenciesObj3d = this.getCurrenciesObject3D( curve )
      object3d.add(currenciesObj3d);

      // Add Labels
      const textMesh = this.makeCanvasLabel(text, WIDTH, 30, 'black', 'rgba(215, 219, 221, 0.7)')
      textMesh.position.set(-WIDTH / 2, - HEIGHT * 1.2, 50)
      object3d.add(textMesh);

      return object3d
    },
    getTaxPipeObject3D: function( pipeMaterial ) {
      let object3d = new THREE.Object3D();

      let points = [];
      points.push(new THREE.Vector3( 0, HEIGHT * 3, 0));
      points.push(new THREE.Vector3( -WIDTH, HEIGHT * 2.5, 0));
      points.push(new THREE.Vector3( -WIDTH, - HEIGHT * 1, 0));
      points.push(new THREE.Vector3( 0, - HEIGHT * 1.5, 0));


      let curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.30 ); //SplineCurve3
      let tubeGeometry = new THREE.TubeGeometry(curve, 64, 30, 8, false);
      let tubeMesh = new THREE.Mesh(tubeGeometry, pipeMaterial);
      object3d.add(tubeMesh);

      // Add currency
      let currenciesObj3d = this.getCurrenciesObject3D( curve )
      object3d.add(currenciesObj3d);

      // Add Labels
      const taxTextMesh = this.makeCanvasLabel('Tax (T)', WIDTH, 30, 'black', 'rgba(215, 219, 221, 0.7)')
      taxTextMesh.position.set(- WIDTH / 2, HEIGHT * 2.8, 50)
      object3d.add(taxTextMesh);

      const govTextMesh = this.makeCanvasLabel('Government Spending (G)', WIDTH, 30, 'black', 'rgba(215, 219, 221, 0.7)')
      govTextMesh.position.set(- WIDTH / 2, - HEIGHT * 1.2, 50)
      object3d.add(govTextMesh);

      return object3d
    },
    getCurrenciesObject3D: function ( curve ) {
      let object3d = new THREE.Object3D();

      let coneMaterial = new THREE.MeshLambertMaterial({ color: 0xffdf00 });
      let coneGeometry = new THREE.CylinderGeometry(0, 10, 50, 40, 40, false);
      let coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);

      let t = 0;
      let matrix = new THREE.Matrix4();
      let up = new THREE.Vector3(0, 1, 0);
      let axis = new THREE.Vector3();
      let pt, radians, tangent;

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
      object3d.add(coneMesh);

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

      return object3d
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
