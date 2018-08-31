<template>
    <div id="canvas-parent" v-resize="onResize" class="webglContainer">
    </div>
</template>


<script>
  import Scene from "@/lib/sceneMixin.js";
  // import classObject3D from '@/lib/classObject3D'

  export default {
    name: 'classModel',
    components: {
      Scene,
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