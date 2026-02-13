<template>
  <div class="review-page">
    <h1>审核界面</h1>
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
.review-page {
  padding: 32px;
}
</style>