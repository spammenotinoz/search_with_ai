<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useAppStore } from '../store';
import { useI18n } from 'vue-i18n';

type Emit = {
  (e: 'click'): void;
};

const appStore = useAppStore();
const { t } = useI18n();
const model = ref('');

const emits = defineEmits<Emit>();

onMounted(() => {
  const cached = appStore.model;
  model.value = cached || '';
});
</script>

<script lang="ts">
export default {
  name: 'PageFooter',
};
</script>

<template>
  <div class="flex w-full flex-col items-center gap-2">
    <div class="text-center text-xs text-gray-400">
      {{ t('warning') }}
    </div>
  </div>
</template>
