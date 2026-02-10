const Router = require("@koa/router");
const healthRouter = require("./health");
const chatRouter = require("./chat");
const classifyRouter = require("./classify");
const scheduleRouter = require("./schedule");
const authRouter = require("./auth");

const router = new Router();

// 汇总所有路由
router.use(healthRouter.routes());
router.use(chatRouter.routes());
router.use(classifyRouter.routes());
router.use(scheduleRouter.routes());
router.use(authRouter.routes());

module.exports = router;
