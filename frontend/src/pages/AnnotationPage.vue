<template>
  <div class="annotation-page">
    <h1>标注界面</h1>
    <p>功能开发中...</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const audioId = route.params.audioId
console.log('Audio ID:', audioId)
</script>

<style scoped lang="scss">
.annotation-page {
  padding: 32px;
}
</style>