export class IDB {
  constructor(dbName, version, options = {}) {
    this.dbName = dbName;
    this.version = version;
    this.options = options;
    this.db = null;
  }

  /**
   * 打开数据库连接
   * @returns {Promise<IDBDatabase>}
   */
  open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        reject(new Error('数据库打开失败'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        if (this.options.onupgradeneeded) {
          this.options.onupgradeneeded(event);
        }
      };
    });
  }

  /**
   * 获取数据
   * @param {string} storeName - 存储对象名称
   * @param {string|number} key - 主键
   * @returns {Promise<any>}
   */
  get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = (event) => {
        reject(new Error('获取数据失败'));
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  /**
   * 存储数据
   * @param {string} storeName - 存储对象名称
   * @param {any} value - 要存储的值
   * @param {string|number} key - 主键
   * @returns {Promise<void>}
   */
  put(storeName, value, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(value, key);

      request.onerror = (event) => {
        reject(new Error('存储数据失败'));
      };

      request.onsuccess = (event) => {
        resolve();
      };
    });
  }

  /**
   * 删除数据
   * @param {string} storeName - 存储对象名称
   * @param {string|number} key - 主键
   * @returns {Promise<void>}
   */
  delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = (event) => {
        reject(new Error('删除数据失败'));
      };

      request.onsuccess = (event) => {
        resolve();
      };
    });
  }

  /**
   * 获取所有匹配的数据
   * @param {string} storeName - 存储对象名称
   * @returns {Promise<any[]>}
   */
  getAllMatching(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = (event) => {
        reject(new Error('获取数据失败'));
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
} 