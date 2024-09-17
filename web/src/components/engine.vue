<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ISelectOptions } from '../interface';
import { useI18n } from 'vue-i18n';

const engines = ref<ISelectOptions[]>([]);

const { t } = useI18n();

onMounted(() => {
  engines.value = [
    {
      name: t('searxng'),
      value: 'SEARXNG'
    },
    {
      name: t('chatglm'),
      value: 'CHATGLM'
    },
    {
      name: t('google'),
      value: 'GOOGLE'
    },
    {
      name: t('bing'),
      value: 'BING'
    },
    {
      name: t('sogou'),
      value: 'SOGOU'
    },
    
  ];
});
</script>

<script lang="ts">
export default {
  name: 'SearchEngineSelect'
};
</script>

<template>

</template>
