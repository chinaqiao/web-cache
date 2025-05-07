import { register } from 'workbox-window';

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  const wb = register('/demo/workbox-demo/sw.js');
  
  wb.addEventListener('installed', event => {
    console.log('Service Worker 已安装');
  });

  wb.addEventListener('controlling', event => {
    console.log('Service Worker 已控制页面');
  });
}

// 模拟 API 请求
async function fetchData() {
  try {
    const response = await fetch('/api/test');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取数据失败:', error);
    return { error: '获取数据失败' };
  }
}

// 清除缓存
async function clearCache() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    const channel = new MessageChannel();
    
    return new Promise((resolve) => {
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      registration.active.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      );
    });
  }
}

// 更新 UI
function updateUI(data) {
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = JSON.stringify(data, null, 2);
}

// 绑定按钮事件
document.getElementById('fetchData').addEventListener('click', async () => {
  const data = await fetchData();
  updateUI(data);
});

document.getElementById('clearCache').addEventListener('click', async () => {
  const result = await clearCache();
  updateUI({ message: '缓存已清除', success: result.success });
}); 