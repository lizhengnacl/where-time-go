const Router = require("@koa/router");
const { openai, DEFAULT_MODEL } = require("../openai");
const createRateLimiter = require("../middleware/rateLimiter");
const authMiddleware = require("../middleware/auth");

const router = new Router();

// 针对聊天接口增加频控
const chatRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 分钟
  max: 15, // 15 次请求
  message: "聊天请求过于频繁，请稍后再试",
});

// OpenAI 聊天接口
router.post("/chat", chatRateLimiter, authMiddleware, async (ctx) => {
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
