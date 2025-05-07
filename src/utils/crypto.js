/**
 * 加密工具类
 */
export class CryptoManager {
  constructor() {
    this.keyStore = new Map();
    this.keyRotationInterval = 24 * 60 * 60 * 1000; // 24小时
  }

  /**
   * 生成新的加密密钥
   * @returns {Promise<CryptoKey>}
   */
  async generateKey() {
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
    return key;
  }

  /**
   * 从原始密钥材料导入密钥
   * @param {ArrayBuffer} keyMaterial - 密钥材料
   * @returns {Promise<CryptoKey>}
   */
  async importKey(keyMaterial) {
    return await window.crypto.subtle.importKey(
      'raw',
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * 导出密钥
   * @param {CryptoKey} key - 要导出的密钥
   * @returns {Promise<ArrayBuffer>}
   */
  async exportKey(key) {
    return await window.crypto.subtle.exportKey('raw', key);
  }

  /**
   * 加密数据
   * @param {CryptoKey} key - 加密密钥
   * @param {ArrayBuffer} data - 要加密的数据
   * @returns {Promise<{encrypted: ArrayBuffer, iv: ArrayBuffer}>}
   */
  async encrypt(key, data) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    return {
      encrypted,
      iv
    };
  }

  /**
   * 解密数据
   * @param {CryptoKey} key - 解密密钥
   * @param {ArrayBuffer} encrypted - 加密的数据
   * @param {ArrayBuffer} iv - 初始化向量
   * @returns {Promise<ArrayBuffer>}
   */
  async decrypt(key, encrypted, iv) {
    return await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encrypted
    );
  }

  /**
   * 获取或创建资源密钥
   * @param {string} resourceId - 资源ID
   * @returns {Promise<CryptoKey>}
   */
  async getResourceKey(resourceId) {
    if (!this.keyStore.has(resourceId)) {
      const key = await this.generateKey();
      this.keyStore.set(resourceId, {
        key,
        created: Date.now()
      });
    }
    return this.keyStore.get(resourceId).key;
  }

  /**
   * 检查并轮换过期的密钥
   */
  async rotateKeys() {
    const now = Date.now();
    for (const [resourceId, { key, created }] of this.keyStore.entries()) {
      if (now - created > this.keyRotationInterval) {
        const newKey = await this.generateKey();
        this.keyStore.set(resourceId, {
          key: newKey,
          created: now
        });
      }
    }
  }
} 