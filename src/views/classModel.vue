<template>
    <div class="webglContainer" v-resize="onResize">
    </div>
</template>

<script>
import Scene from '../lib/sceneMixin.js'
// import classObject3d from '../lib/classObject3d.js'

export default {
  name: 'classModel',
  mixins: [Scene]
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
