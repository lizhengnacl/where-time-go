const Router = require("@koa/router");
const fs = require("fs").promises;
const path = require("path");

const router = new Router({ prefix: "/api/schedule" });
const DATA_FILE = path.join(__dirname, "../data.json");

/**
 * 辅助函数：读取本地数据文件
 */
async function readData() {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // 如果文件不存在，返回初始数据
    return { history: {}, tags: null };
  }
}

/**
 * 辅助函数：写入本地数据文件
 */
async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * 获取历史记录
 * GET /api/schedule/history
 */
router.get("/history", async (ctx) => {
  const data = await readData();
  ctx.body = {
    success: true,
    data: data.history || {},
  };
});

/**
 * 保存历史记录
 * POST /api/schedule/history
 */
router.post("/history", async (ctx) => {
  const { history } = ctx.request.body;
  const data = await readData();
  data.history = history;
  await writeData(data);
  ctx.body = { success: true };
});

/**
 * 获取自定义标签
 * GET /api/schedule/tags
 */
router.get("/tags", async (ctx) => {
  const data = await readData();
  ctx.body = {
    success: true,
    tags: data.tags,
  };
});

/**
 * 保存自定义标签
 * POST /api/schedule/tags
 */
router.post("/tags", async (ctx) => {
  const { tags } = ctx.request.body;
  const data = await readData();
  data.tags = tags;
  await writeData(data);
  ctx.body = { success: true };
});

module.exports = router;
