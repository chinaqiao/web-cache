import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { openDB } from 'idb';

// 初始化 IndexedDB
const dbPromise = openDB('my-cache-db', 1, {
  upgrade(db) {
    db.createObjectStore('responses');
  },
});

// 自定义缓存到 IndexedDB 的逻辑
const cacheToIDBHandler = async ({ request, response }) => {
  const db = await dbPromise;
  const body = await response.clone().arrayBuffer();
  await db.put('responses', body, request.url);
  return response;
};

// 从 IndexedDB 获取缓存的响应
const getFromIDB = async (request) => {
  const db = await dbPromise;
  const cachedResponse = await db.get('responses', request.url);
  if (cachedResponse) {
    return new Response(cachedResponse);
  }
  return null;
};

// 拦截 API 请求并使用 NetworkFirst 策略
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    plugins: [
      { 
        fetchDidSucceed: cacheToIDBHandler,
        cacheDidMatch: async ({ request }) => {
          return await getFromIDB(request);
        }
      }
    ]
  })
);

// 添加清除缓存的功能
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    const db = await dbPromise;
    await db.clear('responses');
    event.ports[0].postMessage({ success: true });
  }
}); 