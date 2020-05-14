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

const WIDTH = 400;
const HEIGHT = 200;
const DEPTH = 200;

export default {
  name: "workflowModel",
  mixins: [Scene],
  data() {
    return {
      skyboxArray: [
        "grass/sbox_px.jpg",
        "grass/sbox_nx.jpg",
        "grass/sbox_py.jpg",
        "grass/sbox_ny.jpg",
        "grass/sbox_pz.jpg",
        "grass/sbox_nz.jpg"
      ]
      // skyboxArray: ['islands/skybox_e.jpg', 'islands/skybox_w.jpg', 'islands/skybox_t.jpg', 'islands/skybox_b.jpg', 'islands/skybox_n.jpg', 'islands/skybox_s.jpg']
    };
  },
  mounted: async function() {
    this.addLoadingText();

    this.macroEconomicModel(0);

    this.removeLoadingText();
  },
  methods: {
    macroEconomicModel: async function(zPos) {
      let placeholderObject3d = new THREE.Object3D();
      placeholderObject3d.position.setZ(zPos);
      this.modelObject3D.add(placeholderObject3d);

      const material = new THREE.MeshBasicMaterial({
        color: 0x4040ff,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,
        transparent: true
      });

      let roundedRectShape = this.getRoundedRectShape(0, 0, WIDTH, HEIGHT, 20);
      // let geometry = new THREE.ShapeGeometry(rountedRectShape)
      // extruded shape
      let extrudeSettings = {
        depth: DEPTH,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 2,
        bevelSize: 1,
        bevelThickness: 1
      };
      let geometry = new THREE.ExtrudeGeometry(
        roundedRectShape,
        extrudeSettings
      );
      geometry.center();
      let buffgeom = new THREE.BufferGeometry();
      buffgeom.fromGeometry(geometry);
      let mesh = new THREE.Mesh(buffgeom, material);
      placeholderObject3d.add(mesh);

      // water https://github.com/mrdoob/three.js/blob/master/examples/webgl_water.html

      var waterGeometry = new THREE.PlaneBufferGeometry(WIDTH, DEPTH);

      var params = {
        color: "#ffffff",
        scale: 4,
        flowX: 1,
        flowY: 1
      };

      const water = new Water(waterGeometry, {
        color: params.color,
        scale: params.scale,
        flowDirection: new THREE.Vector2(params.flowX, params.flowY),
        textureWidth: 1024,
        textureHeight: 1024
      });

      water.position.y = 1;
      water.rotation.x = Math.PI * -0.5;
      placeholderObject3d.add(water);

      // Pipe

      const radiusTop = 30;

      const fromPos = new THREE.Vector3(0, HEIGHT * -2, 0);
      const toPos = new THREE.Vector3(0, HEIGHT * 2, 0);

      let points = [];
      points.push(fromPos);
      points.push(
        new THREE.Vector3(fromPos.x - WIDTH / 2, fromPos.y, fromPos.z)
      );
      //points.push(new THREE.Vector3(toPos.x - WIDTH / 2, fromPos.y - HEIGHT, toPos.z))
      points.push(new THREE.Vector3(toPos.x - WIDTH / 2, toPos.y, toPos.z));
      points.push(toPos);

      //this.addTextMeshBetween(name, points[1], points[2])

      let curve = new THREE.CatmullRomCurve3(points); //SplineCurve3
      curve.curveType = "catmullrom";
      let tubeGeometry = new THREE.TubeGeometry(curve, 64, 10, 8, false);
      let tubeMesh = new THREE.Mesh(tubeGeometry, material);
      placeholderObject3d.add(tubeMesh);

      // Cone

      let coneMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ef });
      let coneGeometry = new THREE.CylinderGeometry(0, 40, 100, 40, 40, false);
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
      placeholderObject3d.add(coneMesh);

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
