/**
 * 检查是否支持 Web Crypto API
 * @returns {boolean}
 */
function isCryptoSupported() {
  return window.crypto && window.crypto.subtle;
}

/**
 * 使用简单的字符串哈希算法（当 Web Crypto API 不可用时使用）
 * @param {string} str - 要计算 hash 的字符串
 * @returns {string} - hash 值
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * 计算字符串的 hash 值
 * @param {string} str - 要计算 hash 的字符串
 * @returns {Promise<string>} - hash 值
 */
export async function calculateHash(str) {
  if (isCryptoSupported()) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.warn('Web Crypto API failed, falling back to simple hash:', error);
      return simpleHash(str);
    }
  } else {
    console.warn('Web Crypto API not supported, using simple hash');
    return simpleHash(str);
  }
}

/**
 * 验证内容的 hash 值是否匹配
 * @param {string} content - 要验证的内容
 * @param {string} hash - 期望的 hash 值
 * @returns {Promise<boolean>} - 是否匹配
 */
export async function verifyHash(content, hash) {
  const calculatedHash = await calculateHash(content);
  return calculatedHash === hash;
}

/**
 * 计算 Blob 的 hash 值
 * @param {Blob} blob - 要计算 hash 的 Blob 对象
 * @returns {Promise<string>} - hash 值
 */
export async function calculateBlobHash(blob) {
  if (isCryptoSupported()) {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      console.warn('Web Crypto API failed, falling back to simple hash:', error);
      return simpleHash(await blob.text());
    }
  } else {
    console.warn('Web Crypto API not supported, using simple hash');
    return simpleHash(await blob.text());
  }
} 