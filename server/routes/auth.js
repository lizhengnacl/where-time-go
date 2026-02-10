const Router = require("@koa/router");
const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");

const router = new Router({ prefix: "/api/auth" });
const USERS_FILE = path.join(__dirname, "../data/users.json");

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
 * 注册
 */
router.post("/signup", async (ctx) => {
  const { username, password } = ctx.request.body;
  if (!username || !password) {
    ctx.status = 400;
    ctx.body = { success: false, message: "用户名和密码不能为空" };
    return;
  }

  const users = await readUsers();
  if (users.find((u) => u.username === username)) {
    ctx.status = 400;
    ctx.body = { success: false, message: "用户名已存在" };
    return;
  }

  const newUser = {
    id: crypto.randomUUID(),
    username,
    password: hashPassword(password),
  };

  users.push(newUser);
  await saveUsers(users);

  ctx.body = {
    success: true,
    data: {
      id: newUser.id,
      username: newUser.username,
      token: newUser.id, // 简单起见，直接用 ID 作为 token
    },
  };
});

/**
 * 登录
 */
router.post("/login", async (ctx) => {
  const { username, password } = ctx.request.body;
  const users = await readUsers();
  const user = users.find(
    (u) => u.username === username && u.password === hashPassword(password),
  );

  if (!user) {
    ctx.status = 401;
    ctx.body = { success: false, message: "用户名或密码错误" };
    return;
  }

  ctx.body = {
    success: true,
    data: {
      id: user.id,
      username: user.username,
      token: user.id,
    },
  };
});

module.exports = router;
