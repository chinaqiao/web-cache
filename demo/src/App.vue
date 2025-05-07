<template>
  <div class="app">
    <h1>Service Worker 缓存示例</h1>

    <div class="container">
      <h2>示例图片</h2>
      <div class="image-container">
        <img :src="imageUrl" alt="示例图片">
      </div>
      <p>说明：这张图片会被 Service Worker 自动缓存。刷新页面后，如果缓存存在，将直接从缓存加载。</p>
    </div>

    <div class="container">
      <h2>缓存管理</h2>
      <button @click="getCacheStats">查看缓存统计</button>
      <button @click="clearCache">清理缓存</button>
      <div class="stats" v-html="statsResult"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { CONFIG } from '../../src/config/index.js';
import { CacheManager } from '../../src/core/CacheManager.js';
import { IDB } from '../../src/core/IDB.js';

const imageUrl = ref('https://picsum.photos/800/400');
const statsResult = ref('');

// 初始化
const init = async () => {
  const idb = new IDB(CONFIG.db.name, CONFIG.db.version, {
    onupgradeneeded: (e) => {
      const db = e.target.result;
      db.createObjectStore('resources');
      db.createObjectStore('errorLogs');
    }
  });
  await idb.open();

  // 注册 Service Worker
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker 注册成功:', registration);
    } catch (error) {
      console.error('Service Worker 注册失败2:', error);
    }
  }

  window.cacheManager = new CacheManager(idb);
};

// 获取缓存统计
const getCacheStats = async () => {
  try {
    const stats = await window.cacheManager.getStats();
    statsResult.value = `
      <span class="success">
        总大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB<br>
        资源数量: ${stats.resourceCount}<br>
        类型统计:<br>
        ${Object.entries(stats.typeStats).map(([type, count]) => 
          `${type}: ${count}个`
        ).join('<br>')}
      </span>`;
  } catch (error) {
    statsResult.value = `<span class="error">错误: ${error.message}</span>`;
  }
};

// 清理缓存
const clearCache = async () => {
  try {
    await window.cacheManager.clean(CONFIG.cleanTypes.ALL);
    statsResult.value = '<span class="success">缓存已清理</span>';
    // 更新统计信息
    await getCacheStats();
  } catch (error) {
    statsResult.value = `<span class="error">错误: ${error.message}</span>`;
  }
};

onMounted(() => {
  init();
});
</script>

<style scoped>
.app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.container {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.image-container {
  margin: 20px 0;
}

.image-container img {
  max-width: 100%;
  height: auto;
}

.stats {
  margin: 20px 0;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
}

button {
  padding: 8px 15px;
  margin: 5px;
  cursor: pointer;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style> 