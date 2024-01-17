<script setup lang="ts">
import AlgoCloud from './AlgoCloud.vue'
</script>

<template>
  <svg id="svg-element" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
    <AlgoCloud :index="1" :cx="500" :cy="500" :width="300" :height="200" :points="10" />
  </svg>
</template>

<style scoped>
svg {
  background-color: rgb(36, 199, 228);
  display: block;
  width: 100%;
  height: 100%;
}
</style>
