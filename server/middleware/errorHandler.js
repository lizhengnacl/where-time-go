/**
 * 全局错误处理中间件
 */
const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Global Error Handler:", err);

    // 处理 OpenAI SDK 抛出的错误
    if (err.status && err.message && err.type) {
      ctx.status = err.status;
      ctx.body = {
        error: err.message,
        type: err.type,
        code: err.code,
      };
      return;
    }

    // 处理自定义业务错误或未知错误
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message || "服务器内部错误",
      code: err.code || "INTERNAL_ERROR",
    };
  }
};

module.exports = errorHandler;
