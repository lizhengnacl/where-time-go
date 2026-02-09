const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const serve = require("koa-static");
const mount = require("koa-mount");
const path = require("path");
const os = require("os");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");
const router = require("./routes/index");

dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 3001;
const BASE_PATH = "/time";

/**
 * 获取本机局域网 IP
 */
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 过滤 IPv4 和 非回环地址
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// 错误处理
app.use(errorHandler);

// 解析 Body
app.use(bodyParser());

// 使用 koa-mount 将所有逻辑挂载到 /time 子路径下
const mainApp = new Koa();

// 1. 托管静态资源 (挂载到 /time)
mainApp.use(serve(path.join(__dirname, "../dist")));

// 2. 注册路由 (挂载到 /time/api 等)
mainApp.use(router.routes()).use(router.allowedMethods());

// 3. 处理 SPA 路由兜底 (如果访问 /time/xxx 找不到资源，返回 index.html)
mainApp.use(async (ctx, next) => {
  if (ctx.status === 404 && !ctx.path.startsWith("/api/")) {
    await serve(path.join(__dirname, "../dist"))(
      Object.assign(ctx, { path: "index.html" }),
      next,
    );
  } else {
    await next();
  }
});

app.use(mount(BASE_PATH, mainApp));

app.listen(PORT, "0.0.0.0", () => {
  const networkIP = getNetworkIP();
  console.log("\n  🚀 Server is running with base path: " + BASE_PATH);
  console.log(`  > Local:    http://localhost:${PORT}${BASE_PATH}`);
  console.log(`  > Network:  http://${networkIP}:${PORT}${BASE_PATH}\n`);
});
