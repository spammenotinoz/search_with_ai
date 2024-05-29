<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { getLocalModels } from '../api';
import { useAppStore } from '../store';
import { MessagePlugin } from 'tdesign-vue-next';

const appStore = useAppStore();
const model = ref(appStore.localModel);
const models = ref<string[]>([]);
const loading = ref(false);

watch(() => appStore.enableLocal, async (val) => {
  if (val) {
    await listModels();
  }
});

onMounted(async () => {
  if (appStore.enableLocal) await listModels();
  if (appStore.localModel) {
    model.value = appStore.localModel;
  } else {
    model.value = models.value[0];
  }
});

async function listModels () {
  try {
    loading.value = true;
    const res = await getLocalModels();
    const values: string[] = [];
    if (!res.models) {
      MessagePlugin.error(JSON.stringify(res.cause));
      return;
    }
    res.models?.forEach((model: any) => {
      // const key = model.details.family; 
      values.push(`${model.name}`);
    });
    models.value = values;
  } catch (error: any) {
    MessagePlugin.error('Failed to get local models');
    console.error(error);
  }  
  loading.value = false;
}
</script>

<script lang="ts">
export default {
  name: 'LocalModelSelect'
};
</script>

<template>
</template>
