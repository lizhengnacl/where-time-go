const Router = require("@koa/router");
const { openai, DEFAULT_MODEL } = require("../openai");

const router = new Router();

/**
 * 中间件：验证用户身份
 */
async function authMiddleware(ctx, next) {
  const authHeader = ctx.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    ctx.status = 401;
    ctx.body = { success: false, message: "未登录" };
    return;
  }
  await next();
}

// OpenAI 聊天接口
router.post("/chat", authMiddleware, async (ctx) => {
  const { messages, model } = ctx.request.body;

  if (!Array.isArray(messages)) {
    ctx.throw(400, "参数错误：messages 需为数组", { code: "INVALID_PARAMS" });
  }

  const completion = await openai.chat.completions.create({
    model: model || DEFAULT_MODEL,
    messages,
  });

  ctx.body = completion;
});

module.exports = router;
