<template>
  <div class="no-overflow">
    <v-btn class="button-top" absolute dark fab small right color="pink" @click="onOrbit">
      <v-icon>{{orbit ? "flare" : "360"}}</v-icon>
    </v-btn>
    <div v-resize="onResize" v-on:click="onClick"></div>
  </div>
</template>

<!--<script src="three/examples/js/renderers/CSS3DRenderer.js"></script>-->

<script>
//import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject
} from "three/examples/jsm/renderers/CSS3DRenderer";
import Scene from "../../lib/sceneMixin.js";
import TWEEN from "@tweenjs/tween.js";

const WIDTH = 400;
const HEIGHT = 200;
const DEPTH = 200;

export default {
  name: "mindPalaceModel",
  mixins: [Scene],
  data() {
    return {
      skyboxArray: [
        "islands/skybox_e.jpg",
        "islands/skybox_w.jpg",
        "islands/skybox_t.jpg",
        "islands/skybox_b.jpg",
        "islands/skybox_n.jpg",
        "islands/skybox_s.jpg"
      ]
      //skyboxArray: ['dawnmountain/dawnmountain-posx.png', 'dawnmountain/dawnmountain-negx.png', 'dawnmountain/dawnmountain-posy.png', 'dawnmountain/dawnmountain-negy.png', 'dawnmountain/dawnmountain-posz.png', 'dawnmountain/dawnmountain-negz.png']
    };
  },
  mounted: async function() {
    this.addLoadingText();

    //this.mindPalace();
    const w = 560;
    const h = 315;

    this.create3dPage(
      w,
      h,
      new THREE.Vector3(0, 400, 0),
      new THREE.Vector3(0, 0, 0),
      `<iframe width="${w}" height="${h}" src="http://localhost:8080/#/.etzkqkeevznx" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    );

    this.create3dPage(
      w,
      h,
      new THREE.Vector3(-300, 0, 0),
      new THREE.Vector3(0, Math.PI * 0.25, 0),
      `<iframe width="${w}" height="${h}" src="https://www.youtube.com/embed/eRsGyueVLvQ?controls=0" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    );

    this.create3dPage(
      w,
      h,
      new THREE.Vector3(300, 0, 0),
      new THREE.Vector3(0, -Math.PI * 0.25, 0),
      '<label for="fname">First name:</label> <input type="text" id="fname" name="fname"><br><br>'
    );

    this.removeLoadingText();
  },
  methods: {
    ///////////////////////////////////////////////////////////////////
    // Creates 3d webpage object
    //
    ///////////////////////////////////////////////////////////////////
    create3dPage: function(w, h, position, rotation, content) {
      var plane = this.createPlane(w, h, position, rotation);

      this.glModelObject3D.add(plane);

      var cssObject = this.createCssObject(w, h, position, rotation, content);

      this.cssModelObject3D.add(cssObject);
    },
    ///////////////////////////////////////////////////////////////////
    // Creates plane mesh
    //
    ///////////////////////////////////////////////////////////////////
    createPlane: function(w, h, position, rotation) {
      var material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.NoBlending
      });

      var geometry = new THREE.PlaneGeometry(w, h);

      var mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = position.x;
      mesh.position.y = position.y;
      mesh.position.z = position.z;

      mesh.rotation.x = rotation.x;
      mesh.rotation.y = rotation.y;
      mesh.rotation.z = rotation.z;

      return mesh;
    },
    ///////////////////////////////////////////////////////////////////
    // Creates CSS object
    //
    ///////////////////////////////////////////////////////////////////
    createCssObject: function(w, h, position, rotation, content) {
      var html = [
        `<div style="width:${w}px; height:${h}px; font-size:20px";>`,
        content,
        "</div>"
      ].join("\n");

      var div = document.createElement("div");
      div.style.background = new THREE.Color(0xa0a0a0).getStyle();
      div.setAttribute("contenteditable", "");
      div.setAttribute("name", "CONTENTDIV");
      div.innerHTML = html;

      var cssObject = new CSS3DObject(div);

      cssObject.position.x = position.x;
      cssObject.position.y = position.y;
      cssObject.position.z = position.z;

      cssObject.rotation.x = rotation.x;
      cssObject.rotation.y = rotation.y;
      cssObject.rotation.z = rotation.z;

      return cssObject;
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
