<script setup lang="ts">
import { ModelSelect, SearchEngineSelect, LocalModelSelect, LanguageSelect } from './';
import { RiSunLine, RiMoonLine } from '@remixicon/vue';
import { useAppStore } from '../store';
import { type SwitchValue } from 'tdesign-vue-next';
import { useI18n } from 'vue-i18n';
import { Icon } from '@iconify/vue';

const appStore = useAppStore();

const { t } = useI18n();

const showSettings = defineModel<boolean>();

const onChangeTheme = (val: SwitchValue) => {
  if (val) appStore.updateTheme('dark');
  else appStore.updateTheme('light');
};
</script>

<script lang="ts">
export default {
  name: 'AppSettings'
};
</script>

<template>
<ModelSelect />
<SearchEngineSelect />
<LocalModelSelect />
<LanguageSelect />

  <!-- eslint-disable-next-line vue/no-v-model-argument -->
  <t-drawer v-model:visible="showSettings" :footer="false" :header="t('settings')">
      <div class="flex h-full flex-col justify-between gap-4">
        <div class="mb-4 flex flex-col gap-2">
          <a href="https://smart.ultimateai.org" target="_blank">
            <Icon icon="mdi:chat-outline" width="24" height="24" />
			<span> Smart Chat </span>
          </a>
          <a href="https://chat.ultimateai.org" target="_blank">
            <Icon icon="mdi:chat" width="24" height="24" />
			<span> Ultimate Chat </span>
          </a>
          <a href="https://gpt.ultimateai.org" target="_blank">
            <Icon icon="simple-icons:openai" width="24" height="24" />
			<span> Chat GPT Plus </span>
          </a>
		  <a href="https://flux.ultimateai.org/#/music/index" target="_blank">
            <Icon icon="mdi:palette-outline" width="24" height="24" />
			<span>Flux: AI Image Generation </span>
          </a>
          <a href="https://studio.ultimateai.org/#/draw/1002" target="_blank">
            <Icon icon="logos:midjourney" width="24" height="24" />
			<span> Midjourney </span>
          </a>
          <a href="https://studio.ultimateai.org/#/music/index" target="_blank">
            <Icon icon="mdi:music" width="24" height="24" />
			<span> AI Music and Video </span>
          </a>
        </div>
		
		<div class="mb-4 flex flex-row gap-2">
			<a href="https://ultimateai.org/docs" target="_blank">
				<Icon icon="material-symbols:help-outline-rounded" width="24" height="24" />
				<span> Documentation</span>
			</a>	
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