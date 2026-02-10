const Router = require("@koa/router");
const fs = require("fs").promises;
const path = require("path");

const router = new Router({ prefix: "/api/schedule" });
const DATA_DIR = path.join(__dirname, "../data");

/**
 * 确保数据目录存在
 */
function ensureDataDir() {
  const fsSync = require("fs");
  if (!fsSync.existsSync(DATA_DIR)) {
    fsSync.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// 初始化
ensureDataDir();

/**
 * 获取用户的据文件路径
 */
function getUserDataFile(userId) {
  return path.join(DATA_DIR, `user_${userId}.json`);
}

/**
 * 辅助函数：读取本地数据文件
 */
async function readData(userId) {
  if (!userId) return { history: {}, tags: null };
  const dataFile = getUserDataFile(userId);
  try {
    const content = await fs.readFile(dataFile, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // 如果文件不存在，返回初始数据
    return { history: {}, tags: null };
  }
}

/**
 * 辅助函数：写入本地数据文件
 */
async function writeData(userId, data) {
  if (!userId) return;
  const dataFile = getUserDataFile(userId);
  await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf-8");
}

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
  const token = authHeader.split(" ")[1];
  // 简单起见，token 就是 userId
  ctx.state.userId = token;
  await next();
}

/**
 * 获取历史记录
 * GET /api/schedule/history
 */
router.get("/history", authMiddleware, async (ctx) => {
  const data = await readData(ctx.state.userId);
  ctx.body = {
    success: true,
    data: data.history || {},
  };
});

/**
 * 保存历史记录
 * POST /api/schedule/history
 */
router.post("/history", authMiddleware, async (ctx) => {
  const { history } = ctx.request.body;
  const data = await readData(ctx.state.userId);
  data.history = history;
  await writeData(ctx.state.userId, data);
  ctx.body = { success: true };
});

/**
 * 获取自定义标签
 * GET /api/schedule/tags
 */
router.get("/tags", authMiddleware, async (ctx) => {
  const data = await readData(ctx.state.userId);
  ctx.body = {
    success: true,
    tags: data.tags,
  };
});

/**
 * 保存自定义标签
 * POST /api/schedule/tags
 */
router.post("/tags", authMiddleware, async (ctx) => {
  const { tags } = ctx.request.body;
  const data = await readData(ctx.state.userId);
  data.tags = tags;
  await writeData(ctx.state.userId, data);
  ctx.body = { success: true };
});

module.exports = router;
