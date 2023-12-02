import { defineStore } from 'pinia';

export const userPaintingData = defineStore('painting', {
  state: () => ({
    paintingData: '', // 本地涂鸦数据
    shareDoodles: '', // 分享涂鸦
    animationState: false,
    graffitiStatus: false, // 涂鸦保存状态
    storageStatus: false, // 涂鸦存储状态
    setStatus: false, // 页面显示状态
  })
});
