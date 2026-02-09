const Router = require("@koa/router");
const { openai, DEFAULT_MODEL } = require("../openai");
const { CLASSIFY_PROMPT } = require("../prompts");

const router = new Router();

/**
 * 类型识别接口
 * POST /classify
 * Body: { text: "事项描述" }
 */
router.post("/classify", async (ctx) => {
  const { text } = ctx.request.body;

  if (!text) {
    ctx.throw(400, "参数错误：请提供待识别的文本 text", {
      code: "INVALID_PARAMS",
    });
  }

  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content: CLASSIFY_PROMPT,
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0.1,
  });

  const category = completion.choices[0].message.content
    .replace(/[。.，,]/g, "")
    .trim();

  ctx.body = {
    text,
    category,
    usage: completion.usage,
  };
});

module.exports = router;
