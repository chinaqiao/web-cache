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
    port: 8080,
    https: generateCertificate()
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'demo/index.html')
      }
    }
  },
  publicDir: 'demo/public',
  optimizeDeps: {
    exclude: ['sw.js']
  }
}); 