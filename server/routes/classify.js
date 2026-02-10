const Router = require("@koa/router");
const { openai, DEFAULT_MODEL } = require("../openai");
const { CLASSIFY_PROMPT } = require("../prompts");

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

/**
 * 类型识别接口
 * POST /api/classify
 * Body: { text: "事项描述" }
 */
router.post("/api/classify", authMiddleware, async (ctx) => {
  const { text, excludeTags = [] } = ctx.request.body;

  if (!text) {
    ctx.throw(400, "参数错误：请提供待识别的文本 text", {
      code: "INVALID_PARAMS",
    });
  }

  let prompt = CLASSIFY_PROMPT;
  if (excludeTags.length > 0) {
    prompt += `\n\n【强制要求】请绝对不要返回以下任何一个标签：${excludeTags.join("、")}。请提供其他合适的替代标签。`;
  }
  prompt += `\n请返回 3 个最可能的分类标签，用逗号分隔，按相关性排序。`;

  const completion = await openai.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: text,
      },
    ],
    temperature: 0.8,
  });

  const content = completion.choices[0].message.content || "";
  // 更加鲁棒的解析逻辑：支持逗号、分号、换行、顿号分隔
  const categories = content
    .split(/[，,；; \n、]/)
    .map((c) =>
      c
        .replace(/^[\d.、\s]+/, "")
        .replace(/[。.！!]/g, "")
        .trim(),
    )
    .filter((c) => c.length > 0 && c.length <= 20); // 增加长度限制到 20

  ctx.body = {
    text,
    categories,
    usage: completion.usage,
  };
});

module.exports = router;
