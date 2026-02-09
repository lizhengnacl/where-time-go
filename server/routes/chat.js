const Router = require("@koa/router");
const { openai, OPENAI_API_KEY, DEFAULT_MODEL } = require("../openai");

const router = new Router();

// OpenAI 聊天接口
router.post("/chat", async (ctx) => {
  try {
    const { messages, model } = ctx.request.body;

    if (!OPENAI_API_KEY) {
      ctx.status = 400;
      ctx.body = { error: "缺少OPENAI_API_KEY" };
      return;
    }

    if (!Array.isArray(messages)) {
      ctx.status = 400;
      ctx.body = { error: "messages需为数组" };
      return;
    }

    const completion = await openai.chat.completions.create({
      model: model || DEFAULT_MODEL,
      messages,
    });

    ctx.body = completion;
  } catch (e) {
    console.error("OpenAI API Error:", e);
    ctx.status = e.status || 500;
    ctx.body = {
      error: e.message || "服务器内部错误",
      type: e.type,
      code: e.code,
    };
  }
});

module.exports = router;
