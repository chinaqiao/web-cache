import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// 生成自签名证书
const generateCertificate = () => {
  const certPath = path.resolve(__dirname, 'certificates');
  if (!fs.existsSync(certPath)) {
    fs.mkdirSync(certPath, { recursive: true });
  }

  const keyPath = path.join(certPath, 'localhost-key.pem');
  const certPath2 = path.join(certPath, 'localhost.pem');

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath2)) {
    const { execSync } = require('child_process');
    execSync(`openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath2}" -days 365 -nodes -subj "/CN=localhost"`, { stdio: 'inherit' });
  }

  return {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath2)
  };
};

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8098,
    host: '0.0.0.0', // 配置项目可以局域网访问
    cors: true, // 默认启用并允许任何源
    // https: true,
    // https: generateCertificate(),
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  optimizeDeps: {
    exclude: ['sw.js']
  }
}); 