<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { getModels } from '../api';
import { useAppStore } from '../store';

const appStore = useAppStore();
const model = ref(appStore.model);
const models = ref<string[]>([]);
const loading = ref(false);

onMounted(async () => {
  await listModels();
  if (appStore.model) {
    model.value = appStore.model;
  } else {
    model.value = models.value[0];
  }
  appStore.updateModel(model.value);
});

async function listModels () {
  loading.value = true;
  const res = await getModels();
  const keys = Object.keys(res);
  const values: string[] = [];
  keys.forEach((key) => {
    const vals = res[key] as string[];
    values.push(...vals.map(i => `${key}:${i}`));
  });

  models.value = values;
  loading.value = false;
}
</script>

<script lang="ts">
export default {
  name: 'ModelSelect'
};
</script>

<template>
</template>
