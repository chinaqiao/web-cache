import { CONFIG } from '../config/index.js';

export class Logger {
  constructor(idb) {
    this.idb = idb;
    this.storeName = 'errorLogs';
  }

  /**
   * 记录错误日志
   * @param {Error} error - 错误对象
   * @param {Object} context - 错误上下文
   * @returns {Promise<void>}
   */
  async logError(error, context = {}) {
    const logEntry = {
      time: new Date().toISOString(),
      type: error.name || 'UnknownError',
      message: error.message,
      stack: error.stack,
      context,
      retryCount: 0
    };

    await this.idb.add(this.storeName, logEntry);
  }

  /**
   * 获取错误日志
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} - 错误日志列表
   */
  async getErrorLogs(options = {}) {
    const { limit = 100, type = null } = options;
    let query = null;

    if (type) {
      query = IDBKeyRange.only(type);
    }

    return await this.idb.getAllMatching(this.storeName, {
      query,
      count: limit
    });
  }

  /**
   * 清理错误日志
   * @param {number} days - 保留天数
   * @returns {Promise<void>}
   */
  async cleanLogs(days = 7) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const logs = await this.getErrorLogs();
    const oldLogs = logs.filter(log => new Date(log.time) < cutoffDate);

    for (const log of oldLogs) {
      await this.idb.delete(this.storeName, log.id);
    }
  }

  /**
   * 更新重试次数
   * @param {string} logId - 日志ID
   * @param {number} retryCount - 重试次数
   * @returns {Promise<void>}
   */
  async updateRetryCount(logId, retryCount) {
    const log = await this.idb.get(this.storeName, logId);
    if (log) {
      log.retryCount = retryCount;
      await this.idb.put(this.storeName, log);
    }
  }
} 