import { CONFIG } from '../config/index.js';
import { Validator } from '../utils/validator.js';
import { calculateHash, calculateBlobHash } from '../utils/hash.js';

export class CacheManager {
  constructor(idb) {
    this.idb = idb;
    this.validator = new Validator();
    this.storeName = 'resources';
  }

  /**
   * 缓存资源
   * @param {string} url - 资源URL
   * @param {Blob|string} content - 资源内容
   * @param {string} type - 资源类型
   * @returns {Promise<void>}
   */
  async cache(url, content, type) {
    // 验证资源
    if (!this.validator.validateUrl(url)) {
      throw new Error('Invalid URL');
    }
    if (!this.validator.validateType(type)) {
      throw new Error('Invalid resource type');
    }
    if (!await this.validator.validateSize(content)) {
      throw new Error('Resource size exceeds limit');
    }

    // 计算hash
    const hash = content instanceof Blob 
      ? await calculateBlobHash(content)
      : await calculateHash(content);

    // 检查总容量
    const stats = await this.getStats();
    const contentSize = content instanceof Blob ? content.size : new Blob([content]).size;
    if (stats.totalSize + contentSize > CONFIG.limits.maxTotalSize) {
      throw new Error('Total cache size exceeds limit');
    }

    // 存储资源
    const resource = {
      url,
      content,
      type,
      hash,
      size: contentSize,
      createTime: new Date().toISOString(),
      version: CONFIG.version.current
    };

    await this.idb.put(this.storeName, resource, url);
  }

  /**
   * 获取资源
   * @param {string} url - 资源URL
   * @returns {Promise<any>} - 资源内容
   */
  async get(url) {
    const resource = await this.idb.get(this.storeName, url);
    if (!resource) {
      return null;
    }

    // 检查是否过期
    if (this.validator.isExpired(resource)) {
      await this.idb.delete(this.storeName, url);
      return null;
    }

    return resource.content;
  }

  /**
   * 清理缓存
   * @param {string} type - 清理类型
   * @returns {Promise<void>}
   */
  async clean(type) {
    const resources = await this.idb.getAllMatching(this.storeName);
    
    for (const resource of resources) {
      if (type === CONFIG.cleanTypes.ALL || resource.type === type) {
        await this.idb.delete(this.storeName, resource.url);
      }
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Promise<{
   *   totalSize: number,
   *   resourceCount: number,
   *   typeStats: {[key: string]: number}
   * }>}
   */
  async getStats() {
    const resources = await this.idb.getAllMatching(this.storeName);
    const stats = {
      totalSize: 0,
      resourceCount: resources.length,
      typeStats: {}
    };

    for (const resource of resources) {
      stats.totalSize += resource.size;
      stats.typeStats[resource.type] = (stats.typeStats[resource.type] || 0) + 1;
    }

    return stats;
  }

  /**
   * 检查资源是否存在且有效
   * @param {string} url - 资源URL
   * @returns {Promise<boolean>}
   */
  async hasValidResource(url) {
    const resource = await this.idb.get(this.storeName, url);
    return resource && !this.validator.isExpired(resource);
  }
} 