<script setup lang="ts">
import { LocalModelSelect } from './';
import { RiSunLine, RiMoonLine } from '@remixicon/vue';
import { useAppStore } from '../store';
import { type SwitchValue } from 'tdesign-vue-next';
import { useI18n } from 'vue-i18n';

const appStore = useAppStore();
const { t } = useI18n();

const showSettings = defineModel<boolean>();

const onChangeTheme = (val: SwitchValue) => {
  if (val) appStore.updateTheme('dark');
  else appStore.updateTheme('light');
};

const onEnableLocalModel = (val: SwitchValue) => {
    appStore.switchLocalModel(val as boolean);
};
</script>

<script lang="ts">
export default {
  name: 'AppSettings'
};
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-model-argument -->
  <t-drawer v-model:visible="showSettings" :footer="false" :header="t('settings')">
      <div class="flex h-full flex-col justify-between gap-4">
	    <div class="w-full">
           
          <div class="mt-2 flex w-full flex-col gap-2">
           
            <t-switch class="w-12" size="large" :default-value="appStore.enableLocal" @change="onEnableLocalModel">
            </t-switch>
          </div>
          <div class="mt-2 flex w-full flex-col gap-2">
            <LocalModelSelect />
          </div>
         </div>
        <div class="mb-4 flex flex-row gap-2">
          <span>{{ t('theme') }}: </span>
          <t-switch class="w-12" size="large" :default-value="appStore.theme === 'dark'" @change="onChangeTheme">
            <template #label="slotProps">
              <template v-if="slotProps.value">
                <RiMoonLine size="14" />
              </template>
              <template v-else>
                <RiSunLine size="14" />
              </template>
            </template>
          </t-switch>
        </div>
    </div>
  </t-drawer>
</template>