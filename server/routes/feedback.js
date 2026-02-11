const Router = require("@koa/router");
const fs = require("fs").promises;
const path = require("path");
const createRateLimiter = require("../middleware/rateLimiter");

const router = new Router({ prefix: "/api/feedback" });
const DATA_DIR = path.join(__dirname, "../data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

/**
 * 确保数据目录和反馈文件存在
 */
async function ensureFeedbackFile() {
  try {
    const fsSync = require("fs");
    if (!fsSync.existsSync(DATA_DIR)) {
      fsSync.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fsSync.existsSync(FEEDBACK_FILE)) {
      fsSync.writeFileSync(FEEDBACK_FILE, "[]", "utf-8");
    }
  } catch (error) {
    console.error("Failed to initialize feedback file:", error);
  }
}

ensureFeedbackFile();

// 针对反馈接口增加频控，防止被刷
const feedbackRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 5,                   // 每个用户每小时最多 5 条
  message: "感谢您的热情反馈，请稍后再试",
});

/**
 * 提交反馈
 * POST /api/feedback
 */
router.post("/", feedbackRateLimiter, async (ctx) => {
  const { content, contact, type } = ctx.request.body;

  if (!content || content.length < 5) {
    ctx.status = 400;
    ctx.body = { success: false, message: "反馈内容太短啦，多写一点吧~" };
    return;
  }

  try {
    const fileContent = await fs.readFile(FEEDBACK_FILE, "utf-8");
    const feedbacks = JSON.parse(fileContent);

    const newFeedback = {
      id: Date.now().toString(36),
      type: type || "suggestion",
      content,
      contact: contact || "anonymous",
      userAgent: ctx.headers["user-agent"],
      createdAt: new Date().toISOString(),
      ip: ctx.ip,
    };

    feedbacks.push(newFeedback);
    await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2), "utf-8");

    ctx.body = {
      success: true,
      message: "反馈已收到，感谢您的建议！",
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: "服务器忙，请稍后再试" };
  }
});

module.exports = router;
