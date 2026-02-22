<template>
  <div class="annotation-type-switcher">
    <el-radio-group v-model="selectedType" @change="handleTypeChange">
      <el-radio-button
        v-for="type in types"
        :key="type.id"
        :label="type.id"
        :disabled="!type.visible"
      >
        <span class="type-indicator" :style="{ backgroundColor: type.color }"></span>
        {{ type.name }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface AnnotationType {
  id: string;
  name: string;
  color: string;
  visible: boolean;
}

interface Props {
  types: AnnotationType[];
  currentType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  currentType: '',
});

const emit = defineEmits<{
  typeChange: [typeId: string];
}>();

const selectedType = ref(props.currentType || (props.types.length > 0 ? props.types[0].id : ''));

watch(() => props.currentType, (newVal) => {
  if (newVal && newVal !== selectedType.value) {
    selectedType.value = newVal;
  }
});

const handleTypeChange = (typeId: string) => {
  emit('typeChange', typeId);
};
</script>

<style scoped>
.annotation-type-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
}

.type-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 4px;
  vertical-align: middle;
}

:deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
}
</style>