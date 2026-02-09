const Router = require("@koa/router");
const { openai, OPENAI_API_KEY, DEFAULT_MODEL } = require("../openai");
const { CLASSIFY_PROMPT } = require("../prompts");

const router = new Router();

/**
 * 类型识别接口
 * POST /classify
 * Body: { text: "事项描述" }
 */
router.post("/classify", async (ctx) => {
  try {
    const { text } = ctx.request.body;

    if (!text) {
      ctx.status = 400;
      ctx.body = { error: "参数错误：请提供待识别的文本 text" };
      return;
    }

    if (!OPENAI_API_KEY) {
      ctx.status = 500;
      ctx.body = { error: "配置错误：API Key 未设置" };
      return;
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
      temperature: 0.1, // 使用低随机性以获得更一致的分类
    });

    const category = completion.choices[0].message.content
      .replace(/[。.，,]/g, "")
      .trim();

    ctx.body = {
      text,
      category,
      usage: completion.usage,
    };
  } catch (e) {
    console.error("Classification API Error:", e);
    ctx.status = e.status || 500;
    ctx.body = {
      error: e.message || "分类识别过程发生错误",
    };
  }
});

module.exports = router;
