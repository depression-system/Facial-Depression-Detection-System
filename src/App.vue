<script setup lang="ts">
import {darkTheme, useOsTheme} from 'naive-ui'
import {computed} from 'vue'
import Dashboard from "./views/dashboard.vue";

const osTheme = useOsTheme()
const theme = computed(() => (osTheme.value === 'dark' ? darkTheme : null));

</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <dashboard/>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
html,
body,
#app, .n-config-provider, .n-message-provider {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
