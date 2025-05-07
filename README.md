# 前端资源缓存系统

基于 Service Worker 和 IndexedDB 的前端资源缓存系统，支持版本控制和过期管理。

## 功能特点

- 支持缓存 JS、CSS、HTML、图片等资源
- 版本控制机制，支持版本回滚
- 资源大小限制和过期时间管理
- 支持离线访问
- 错误日志记录
- 支持跨域和 HTTPS 资源

## 文件结构

```
src/
├── config/
│   └── index.js           // 配置文件
├── core/
│   ├── IDB.js            // IndexedDB 基础操作类
│   ├── CacheManager.js   // 缓存管理器
│   └── VersionManager.js // 版本管理器
├── utils/
│   ├── hash.js          // hash 计算工具
│   ├── logger.js        // 日志工具
│   └── validator.js     // 验证工具
├── service/
│   └── worker.js        // Service Worker
└── index.js             // 入口文件
```

## 配置说明

```javascript
const CONFIG = {
  // 版本配置
  version: {
    current: '4.0.101',
    previous: '4.0.100'
  },
  
  // 资源限制
  limits: {
    maxFileSize: 10 * 1024 * 1024,    // 10MB
    maxTotalSize: 500 * 1024 * 1024,  // 500MB
    retryTimes: 3
  },
  
  // 缓存过期时间
  expiration: {
    js: 7 * 24 * 60 * 60 * 1000,    // 7天
    css: 7 * 24 * 60 * 60 * 1000,
    html: 7 * 24 * 60 * 60 * 1000,
    image: 30 * 24 * 60 * 60 * 1000  // 30天
  },
  
  // 数据库配置
  db: {
    name: 'resource-cache',
    version: 1,
    stores: ['resources', 'errorLogs']
  }
}
```

## 模块说明

### 1. IDB.js
IndexedDB 基础操作类，提供数据库操作接口。

### 2. CacheManager.js
缓存管理器，负责资源的缓存、获取和清理。

### 3. VersionManager.js
版本管理器，处理版本更新和回滚。

### 4. hash.js
资源 hash 计算和验证工具。

### 5. logger.js
错误日志记录工具。

### 6. worker.js
Service Worker 实现，处理资源请求拦截。

## 使用方式

### 初始化
```javascript
const cache = new ResourceCache(CONFIG);
await cache.init();
```

### 缓存资源
```javascript
await cache.cache('https://example.com/app.js', content, 'js');
```

### 获取资源
```javascript
const resource = await cache.get('https://example.com/app.js');
```

### 清理缓存
```javascript
await cache.clean('image');  // 清理图片
await cache.clean('all');    // 清理所有
```

### 版本回滚
```javascript
await cache.rollback('4.0.100');
```

## API 文档

### ResourceCache 类

#### init()
初始化缓存系统
- 返回: `Promise<void>`

#### cache(url, content, type)
缓存资源
- 参数:
  - `url`: string - 资源 URL
  - `content`: any - 资源内容
  - `type`: string - 资源类型 (js/css/html/image)
- 返回: `Promise<void>`

#### get(url)
获取资源
- 参数:
  - `url`: string - 资源 URL
- 返回: `Promise<any>` - 资源内容

#### clean(type)
清理缓存
- 参数:
  - `type`: string - 清理类型 (js/css/html/image/all)
- 返回: `Promise<void>`

#### rollback(version)
版本回滚
- 参数:
  - `version`: string - 目标版本号
- 返回: `Promise<void>`

#### getStats()
获取统计信息
- 返回: `Promise<{
  totalSize: number,
  resourceCount: number,
  typeStats: {[key: string]: number}
}>`

## 注意事项

1. 资源大小限制
   - 单个资源最大 10MB
   - 总缓存容量最大 500MB

2. 缓存过期
   - JS/CSS/HTML: 7天
   - 图片: 30天

3. 版本控制
   - 支持保留上一版本
   - 支持版本回滚

4. 错误处理
   - 缓存失败时从网络获取
   - 支持重试机制
   - 错误日志记录

## 开发计划

- [ ] 实现基础缓存功能
- [ ] 添加版本控制
- [ ] 实现过期管理
- [ ] 添加错误日志
- [ ] 优化性能
- [ ] 添加测试用例
