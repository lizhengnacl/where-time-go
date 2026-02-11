const Router = require("@koa/router");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const createRateLimiter = require("../middleware/rateLimiter");

const router = new Router({ prefix: "/api/auth" });

// 针对登录和注册接口增加频控，防止暴力破解
const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 分钟
  max: 10, // 10 次请求
  message: "操作过于频繁，请稍后再试",
});

router.use(authRateLimiter);

const DATA_DIR = path.join(__dirname, "../data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

/**
 * 确保数据目录和用户文件存在
 */
async function ensureDataFile() {
  try {
    const fsSync = require("fs");
    if (!fsSync.existsSync(DATA_DIR)) {
      fsSync.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fsSync.existsSync(USERS_FILE)) {
      fsSync.writeFileSync(USERS_FILE, "[]", "utf-8");
    }
  } catch (error) {
    console.error("Failed to initialize users file:", error);
  }
}

// 初始化
ensureDataFile();

/**
 * 辅助函数：读取用户数据
 */
async function readUsers() {
  try {
    const content = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

/**
 * 辅助函数：保存用户数据
 */
async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

/**
 * 辅助函数：加密密码
 */
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

/**
 * 登录/注册合一
 * POST /api/auth/authenticate
 */
router.post("/authenticate", async (ctx) => {
  const { username, password } = ctx.request.body;
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { success: false, message: "用户名和密码不能为空" };
    return;
  }

  const users = await readUsers();
  let user = users.find((u) => u.username === username);

  if (user) {
    // 如果用户存在，校验密码进行登录
    if (user.password !== hashPassword(password)) {
      ctx.status = 401;
      ctx.body = { success: false, message: "用户名已存在且密码错误" };
      return;
    }
  } else {
    // 如果用户不存在，自动注册
    user = {
      id: crypto.randomUUID(),
      username,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    await saveUsers(users);
  }

  ctx.body = {
    success: true,
    data: {
      id: user.id,
      username: user.username,
      token: user.id, // 简单起见，直接用 ID 作为 token
    },
    message: user.createdAt ? "欢迎加入迹时！" : "欢迎回来！",
  };
});

module.exports = router;
