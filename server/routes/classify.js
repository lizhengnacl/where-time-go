const Router = require("@koa/router");
const { openai, OPENAI_API_KEY } = require("../openai");

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
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "你是一个高效的任务分类专家。请分析用户输入的事项描述，并返回一个简短的分类标签（例如：运动、工作、学习、饮食、休息、娱乐等）。只需输出标签名，不要输出任何多余的解释或标点符号。"
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.1, // 使用低随机性以获得更一致的分类
    });

    const category = completion.choices[0].message.content.replace(/[。.，,]/g, "").trim();

    ctx.body = {
      text,
      category,
      usage: completion.usage
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
