const Router = require("@koa/router");
const router = new Router();

// 健康检查
router.get("/health", async (ctx) => {
  ctx.body = { status: "ok" };
});

module.exports = router;
