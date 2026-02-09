const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const serve = require("koa-static");
const path = require("path");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/errorHandler");
const router = require("./routes/index");

dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 3000;

// 错误处理
app.use(errorHandler);

// 托管静态资源 (构建后的前端代码)
app.use(serve(path.join(__dirname, "../dist")));

// 解析 Body
app.use(bodyParser());

// 注册路由
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Koa server listening on http://localhost:${PORT}`);
});
