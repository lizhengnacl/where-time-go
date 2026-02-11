/**
 * 接口频控中间件
 * 针对访客（未登录用户）进行严格限制，防止暴力破解或资源滥用
 */

// 内存存储，实际生产环境建议使用 Redis
const store = new Map();

// 清理过期记录
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

/**
 * 创建频控中间件
 * @param {Object} options
 * @param {number} options.windowMs 时间窗口 (毫秒)
 * @param {number} options.max 窗口内最大请求次数
 * @param {string} options.message 超过限制时的提示信息
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000, // 默认 1 分钟
    max = 10, // 默认 10 次
    message = "请求过于频繁，请稍后再试",
  } = options;

  return async (ctx, next) => {
    // 识别用户标识：优先用 Token (userId)，没有则用 IP
    const authHeader = ctx.headers.authorization;
    let identifier = ctx.ip;
    let isGuest = true;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      identifier = authHeader.split(" ")[1];
      isGuest = false;
    }

    // 如果是登录用户，可以放宽限制（或者在外部单独配置）
    // 这里我们主要针对访客
    if (!isGuest) {
      return await next();
    }

    const now = Date.now();
    const key = `${ctx.path}:${identifier}`;

    let record = store.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    record.count++;
    store.set(key, record);

    // 设置响应头
    ctx.set("X-RateLimit-Limit", max);
    ctx.set("X-RateLimit-Remaining", Math.max(0, max - record.count));
    ctx.set("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      ctx.status = 429;
      ctx.body = {
        success: false,
        message,
        code: "TOO_MANY_REQUESTS",
      };
      return;
    }

    await next();
  };
}

module.exports = createRateLimiter;
