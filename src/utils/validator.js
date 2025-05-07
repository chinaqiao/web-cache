import { CONFIG } from '../config/index.js';

export class Validator {
  constructor() {
    this.config = CONFIG;
  }

  /**
   * 验证资源大小
   * @param {Blob|string} content - 资源内容
   * @returns {Promise<boolean>} - 是否通过验证
   */
  async validateSize(content) {
    let size;
    if (content instanceof Blob) {
      size = content.size;
    } else if (typeof content === 'string') {
      size = new Blob([content]).size;
    } else {
      throw new Error('Invalid content type');
    }

    return size <= this.config.limits.maxFileSize;
  }

  /**
   * 验证资源类型
   * @param {string} type - 资源类型
   * @returns {boolean} - 是否通过验证
   */
  validateType(type) {
    return Object.values(this.config.resourceTypes).includes(type);
  }

  /**
   * 验证 URL
   * @param {string} url - 资源 URL
   * @returns {boolean} - 是否通过验证
   */
  validateUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证版本号格式
   * @param {string} version - 版本号
   * @returns {boolean} - 是否通过验证
   */
  validateVersion(version) {
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
  }

  /**
   * 验证资源是否过期
   * @param {Object} resource - 资源对象
   * @returns {boolean} - 是否过期
   */
  isExpired(resource) {
    if (!resource.createTime) return true;
    
    const expirationTime = this.config.expiration[resource.type];
    if (!expirationTime) return true;

    const createTime = new Date(resource.createTime).getTime();
    const now = Date.now();
    
    return now - createTime > expirationTime;
  }
} 