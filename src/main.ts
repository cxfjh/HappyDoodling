import { createApp } from 'vue';
import { createPinia } from 'pinia';
import axios from 'axios';
import App from './App.vue';

const pinia = createPinia();
const app = createApp(App);

// 创建 axios 实例
const ajax = axios.create({
  baseURL: 'https://j464g00137.zicp.fun/',
  timeout: 5000,
});

app.provide('ajax', ajax); // 提供 axios 实例给组件

app.use(pinia);
app.mount('#app');
