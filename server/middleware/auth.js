const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.WTG_JWT_SECRET || "timary_fallback_secret";

/**
 * 身份验证中间件 (生产级)
 * 校验 JWT Token 的有效性、签名以及是否过期
 */
async function authMiddleware(ctx, next) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.status = 401;
    ctx.body = { success: false, message: "未登录或登录已失效" };
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    // 校验 Token 签名和有效期
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 将解析出的用户信息存入 state，方便后续路由使用
    ctx.state.userId = decoded.userId;
    ctx.state.user = decoded;
    
    await next();
  } catch (err) {
    ctx.status = 401;
    if (err.name === "TokenExpiredError") {
      ctx.body = { success: false, message: "登录已过期，请重新登录" };
    } else {
      ctx.body = { success: false, message: "无效的身份凭证" };
    }
  }
}

module.exports = authMiddleware;
