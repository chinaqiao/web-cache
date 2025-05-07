export const CONFIG = {
  // 数据库配置
  db: {
    name: 'resource-cache',
    version: 1
  },

  // 资源类型
  resourceTypes: {
    IMAGE: 'image',
    JS: 'js',
    CSS: 'css'
  },

  // 清理类型
  cleanTypes: {
    ALL: 'all',
    IMAGE: 'image',
    JS: 'js',
    CSS: 'css'
  },

  // 版本信息
  version: {
    current: '1.0.0',
    min: '1.0.0'
  },

  // 限制
  limits: {
    // 单个资源大小限制（10MB）
    maxResourceSize: 10 * 1024 * 1024,
    // 总缓存大小限制（100MB）
    maxTotalSize: 100 * 1024 * 1024,
    // 缓存过期时间（7天）
    expirationTime: 7 * 24 * 60 * 60 * 1000
  }
}; 