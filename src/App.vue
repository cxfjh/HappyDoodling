<template>
  <div>
    <control-panel></control-panel>
    <graffiti-painting></graffiti-painting>
    <div class="app"><button @click="setUp">更多</button><button @click="rouse">Qity</button></div>
  </div>
</template>

<script setup lang="ts">
import GraffitiPainting from './components/GraffitiPainting.vue';
import ControlPanel from './components/ControlPanel.vue';
import { userPaintingData } from './store/pinia';

const userStore = userPaintingData();
const setUp = (): any => userStore.setStatus = true;
const rouse = (): any => location.href = 'mqqwpa://im/chat?chat_type=wpa&uin=2192787729&version=1&src_type=web&web_src=http:://wpa.b.qq.com';
</script>

<style scoped>
.app {
  display: flex;
  width: 100%;
  justify-content: space-between;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1;
}

.app>button {
  width: 60px;
  height: 30px;
}
</style>
