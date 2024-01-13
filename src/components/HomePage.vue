<template>
  <div class="homepage">
    <router-link to="/rotating-cube">Rotating Cube</router-link>
    <router-link to="/web-gl-first-example">WebGL First Example</router-link>
    <router-link to="/web-gl-circle">WebGL Circle</router-link>
    <router-link to="/web-gl-square">WebGL Square</router-link>
    <router-link to="/web-gl-cube">WebGL Cube</router-link>
    <router-link to="/web-gl-rotating-cube">WebGL Rotating Cube</router-link>
    <router-link to="/web-gl-rotating-cube-filled">WebGL Rotating Cube Filled</router-link>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.homepage {
  width: 100%;
  height: 100%;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.homepage > * + * {
  margin-top: 18px;
}

a {
  text-decoration: none;
  color: lightgrey;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva,
    Verdana, sans-serif;
  font-size: 24px;
}

a:hover {
  text-decoration: underline;
  color: yellow;
}
</style>
