<template>
    <div class="graffitiPainting">
        <canvas ref="canvas"></canvas>
    </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { userPaintingData } from '../store/pinia';

let isDrawingHistory: boolean = false;
const canvas = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref<boolean>(false);
let lastX: number = 0;
let lastY: number = 0;
let drawingHistory: { x: number; y: number }[] = [];
const userStore = userPaintingData();
let requestId: number | null = null;

// 监听显示页面状态并保存涂鸦数据
watch(() => userStore.setStatus, (newDate) => {
    if (!newDate) return;
    if (drawingHistory.length !== 0) { userStore.paintingData = JSON.stringify(drawingHistory); };
    if (userStore.shareDoodles.length !== 0 && drawingHistory.length !== 0) {
        const newArr = [...JSON.parse(userStore.paintingData), ...JSON.parse(userStore.shareDoodles)];
        userStore.paintingData = JSON.stringify(newArr);
    };
    userStore.setStatus = false;
    drawingHistory = [];
});

// 监听涂鸦储存状态并保存涂鸦数据到本地储存
watch(() => userStore.graffitiStatus, (newDate) => {
    if (!newDate) return;
    localStorage.setItem('drawingHistory', userStore.paintingData);
    userStore.graffitiStatus = false;
});

// 监听涂鸦储存状态并恢复历史涂鸦数据
watch(() => userStore.storageStatus, (newDate) => {
    if (!newDate) return;
    const storageData = localStorage.getItem('drawingHistory');
    const info = storageData ? JSON.parse(storageData) : null;
    drawingHistory = info;
    userStore.paintingData = storageData;
    userStore.storageStatus = false;
    replay(info);
});

// 监听获取涂鸦状态并模拟出来
watch(() => userStore.animationState, (newDate) => {
    if (!newDate) return;
    replay(JSON.parse(userStore.shareDoodles));
    userStore.animationState = false;
});

onMounted(() => {
    if (canvas.value) {
        canvas.value.width = window.innerWidth;
        canvas.value.height = window.innerHeight;
        canvas.value.addEventListener('mousedown', startDrawing);
        canvas.value.addEventListener('mousemove', draw);
        canvas.value.addEventListener('mouseup', stopDrawing);
        canvas.value.addEventListener('touchstart', startDrawing);
        canvas.value.addEventListener('touchmove', draw);
        canvas.value.addEventListener('touchend', stopDrawing);
    }
});

const startDrawing = (e: MouseEvent | TouchEvent): void => {
    isDrawing.value = true;
    [lastX, lastY] = getPosition(e);
    drawingHistory.push({ x: lastX, y: lastY });
};

const draw = (e: MouseEvent | TouchEvent): void => {
    if (!isDrawing.value || !canvas.value) return;
    const [x, y] = getPosition(e);
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    let additionalPoints = calculateAdditionalPoints(lastX, lastY, x, y);
    for (let i = 0; i < additionalPoints.length; i++) {
        const [additionalX, additionalY] = additionalPoints[i];
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(additionalX, additionalY);
        ctx.stroke();
        [lastX, lastY] = [additionalX, additionalY];
        drawingHistory.push({ x: lastX, y: lastY });
    };
};

// 计算两点之间的额外点
const calculateAdditionalPoints = (x1: number, y1: number, x2: number, y2: number): [number, number][] => {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const pointsNumber = Math.ceil(distance);
    const result: [number, number][] = [];
    for (let i = 1; i <= pointsNumber; i++) {
        const additionalX = x1 + (x2 - x1) * (i / pointsNumber);
        const additionalY = y1 + (y2 - y1) * (i / pointsNumber);
        result.push([additionalX, additionalY]);
    };
    return result;
};

const stopDrawing = (): void => { isDrawing.value = false; };

const getPosition = (e: MouseEvent | TouchEvent): [number, number] => {
    if (!canvas.value) return [0, 0];
    const rect = canvas.value.getBoundingClientRect();
    let clientX: number, clientY: number;
    switch (e.type) {
        case 'touchstart':
        case 'touchmove':
        case 'touchend':
            clientX = (e as TouchEvent).touches[0].clientX;
            clientY = (e as TouchEvent).touches[0].clientY;
            break;
        default:
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
    };
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return [x, y];
};

const replay = (data: { x: number; y: number }[]): void => {
    if (!canvas.value) return;
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(data[0].x, data[0].y);
    ctx.lineTo(data[0].x + 1, data[0].y + 1);
    ctx.stroke();
    isDrawingHistory = true;
    requestId = requestAnimationFrame(() => animateDrawing(data, ctx));
};

const animateDrawing = (data: { x: number; y: number }[], ctx: CanvasRenderingContext2D): void => {
    let index = 0;
    const drawFrame = (): void => {
        if (!isDrawingHistory) return;
        if (index >= data.length) { isDrawingHistory = false; return; }
        const point = data[index];
        if (index === 0) { ctx.beginPath(); ctx.moveTo(point.x, point.y); }
        else {
            if (data[index - 1].x > point.x || data[index - 1].y > point.y) { ctx.beginPath(); };
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
        };
        index++;
        requestId = requestAnimationFrame(drawFrame);
    };
    drawFrame();
};

// 使用节流函数来限制重绘的频率
const throttle = (fn: Function, delay: number) => {
    let timer: any = null;
    return (...args: any[]) => { if (!timer) { timer = setTimeout(() => { fn(...args); timer = null; }, delay); } };
};

throttle(draw, 1000);

document.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });
</script>
  
<style scoped>
canvas {
    width: 100%;
    height: 100%;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1;
    background: #fdfeff;
}
</style>
  