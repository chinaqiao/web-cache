import { CONFIG } from '../src/config/index.js';
import { CacheManager } from '../src/core/CacheManager.js';
import { IDB } from '../src/core/IDB.js';
import { Validator } from '../src/utils/validator.js';

// 初始化
const idb = new IDB(CONFIG.db.name, CONFIG.db.version, {
  onupgradeneeded: (e) => {
    const db = e.target.result;
    db.createObjectStore('resources');
    db.createObjectStore('errorLogs');
  }
});

const validator = new Validator();
const cacheManager = new CacheManager(idb);

// 需要缓存的资源类型
const CACHEABLE_TYPES = [
  CONFIG.resourceTypes.IMAGE,
  CONFIG.resourceTypes.JS,
  CONFIG.resourceTypes.CSS
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// 拦截请求
self.addEventListener('fetch', async (event) => {
  const url = event.request.url;
  
  // 只处理 GET 请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 检查是否是可缓存的资源类型
  const resourceType = getResourceType(url);
  if (!CACHEABLE_TYPES.includes(resourceType)) {
    return;
  }

  try {
    // 检查缓存中是否有有效资源
    const hasValidResource = await cacheManager.hasValidResource(url);
    if (hasValidResource) {
      // 从缓存获取资源
      const cachedContent = await cacheManager.get(url);
      if (cachedContent) {
        return event.respondWith(new Response(cachedContent));
      }
    }

    // 如果缓存中没有，则从网络获取并缓存
    const response = await fetch(event.request);
    const clone = response.clone();
    
    // 异步缓存资源
    event.waitUntil((async () => {
      try {
        const content = await clone.blob();
        await cacheManager.cache(url, content, resourceType);
      } catch (error) {
        console.error('缓存资源失败:', error);
      }
    })());

    return event.respondWith(response);
  } catch (error) {
    console.error('处理请求失败:', error);
  }
});

// 根据 URL 判断资源类型
function getResourceType(url) {
  const extension = url.split('.').pop().toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return CONFIG.resourceTypes.IMAGE;
    case 'js':
      return CONFIG.resourceTypes.JS;
    case 'css':
      return CONFIG.resourceTypes.CSS;
    default:
      return null;
  }
} 