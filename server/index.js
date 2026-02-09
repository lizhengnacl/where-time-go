const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const dotenv = require("dotenv");
const router = require("./routes/index");

dotenv.config();

const app = new Koa();
const PORT = process.env.PORT || 3000;

app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`Koa server listening on http://localhost:${PORT}`);
});
