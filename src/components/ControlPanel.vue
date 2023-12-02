<template>
    <div class="bodyControlPanel" ref="bodyControlPanel">
        <div class="controlPanel" ref="controlPanel">
            <p><input type="text" placeholder="获取密码" v-model.lazy="key" /><button @click="getDoodles">获取涂鸦</button></p>
            <p><input type="text" placeholder="分享密码(字母或数字或中文)" v-model.lazy="share" style="font-size: 11px;"/><button @click="shareDoodles">分享涂鸦</button></p>
            <button @click="saveDoodle">保存涂鸦</button>
            <button @click="restoreGraffiti">恢复历史</button>
        </div>
        <div class="masks" @click="masks"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, inject } from 'vue';
import { userPaintingData } from '../store/pinia';

const userStore = userPaintingData();
const bodyControlPanel = ref<any>(null);
const controlPanel = ref<any>(null);
const key = ref<any>(null);
const share = ref<any>(null);
const ajax = inject('ajax') as any;

// 分享绘画数据
const shareDoodles = async () => {
    if (!userStore.paintingData || !share.value) return alert('涂鸦不能为空或分享密码不能为空！');
    try {
        const info = { paintingroutes: userStore.paintingData, password: share.value };
        const axiosConfig = { headers: { 'Content-Type': 'application/json' } };
        const result = await ajax.post('share', info, axiosConfig);
        return alert(result.data.message);
    } catch (error) { alert('分享失败！'); };
};

// 获取涂鸦数据并模拟绘画
const getDoodles = async () => {
    if (!key.value) return alert('涂鸦密码不能为空!');
    try {
        const info = await ajax.get('doodle', { params: { password: key.value } });
        if (info.data.message.length < 10) { return alert(info.data.message) };
        userStore.paintingData = userStore.shareDoodles = info.data.message;
        userStore.animationState = true;
    } catch (error) { console.error(error); };
};

// 保存涂鸦
const saveDoodle = (): any => userStore.graffitiStatus = true;

// 恢复历史涂鸦
const restoreGraffiti = (): any => userStore.storageStatus = true;

// 监听并显示页面
watch(() => userStore.setStatus, (newDate) => {
    if (!newDate) return;
    bodyControlPanel.value.style.display = 'block';
    setTimeout(() => { controlPanel.value.style.width = "200px"; }, 100);
});

// 隐藏页面
const masks = (): any => {
    userStore.setStatus = false;
    controlPanel.value.style.width = "0px";
    setTimeout(() => { bodyControlPanel.value.style.display = 'none'; }, 500);
};
</script>

<style scoped>
.bodyControlPanel {
    display: none;
    z-index: -10;
}

.controlPanel {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    width: 0px;
    height: auto;
    aspect-ratio: 3 / 4;
    position: fixed;
    left: 50%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
    transition: 0.75s;
}

.controlPanel>p {
    display: flex;
    border-radius: 5px;
    border: 1px solid black;
}

.controlPanel>p>input {
    width: 70%;
    text-align: center;
    border: 0;
    border-radius: 0;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
}

.controlPanel>p>button {
    width: 30%;
    height: 100%;
    border: 0;
    border-radius: 0;
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    background-color: white;
}

.controlPanel button,
.controlPanel input {
    height: 35px;
    border-radius: 5px;
    border: 1px solid black;
    outline: none;
    cursor: pointer;
}

.masks {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background-color: black;
    opacity: 0.5;
    z-index: 5;
}
</style>