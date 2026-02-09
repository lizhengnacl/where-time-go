const Router = require("@koa/router");
const healthRouter = require("./health");
const chatRouter = require("./chat");

const router = new Router();

// 汇总所有路由
router.use(healthRouter.routes());
router.use(chatRouter.routes());

module.exports = router;
