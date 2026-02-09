const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const serve = require("koa-static");
const path = require("path");
const os = require("os");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");
const router = require("./routes/index");

dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 3000;

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

// 托管静态资源 (构建后的前端代码)
app.use(serve(path.join(__dirname, "../dist")));

// 解析 Body
app.use(bodyParser());

// 注册路由
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, "0.0.0.0", () => {
  const networkIP = getNetworkIP();
  console.log("\n  🚀 Server is running!");
  console.log(`  > Local:    http://localhost:${PORT}`);
  console.log(`  > Network:  http://${networkIP}:${PORT}\n`);
});
