const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const { init: initDB, Counter, WorkerMember } = require("./db");

const router = new Router();

const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});

// 更新计数
router.post("/api/count", async (ctx) => {
  const { request } = ctx;
  const { action } = request.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }

  ctx.body = {
    code: 0,
    data: await Counter.count(),
  };
});

// 获取计数
router.get("/api/count", async (ctx) => {
  const result = await Counter.count();

  ctx.body = {
    code: 0,
    data: result,
  };
});

// 小程序调用，获取微信 Open ID
router.get("/api/wx_openid", async (ctx) => {
  if (ctx.request.headers["x-wx-source"]) {
    ctx.body = ctx.request.headers["x-wx-openid"];
  }
});

router.get("/api/workerList", async (ctx) => {
  const result = await WorkerMember.findAll({ limit: 100 });
  ctx.body = {
    code: 0,
    data: result,
  };
});

router.post("/api/workerDetailByUid", async (ctx) => {
  const { request } = ctx;
  const { uid } = request.body;
  const result = await WorkerMember.findOne({
    where: {
      uid: uid ? uid : 1
    }
  });
  // result 需要看一下是不是把workerType 给映射一下
  ctx.body = {
    code: 0,
    data: result
  };
});

// 上传图片
router.post("/api/uploadImage", async (ctx) => {
  ctx.body = {
    code: 0,
    data: "SUCCESS"
  };
});


router.post("/api/createWorker", async (ctx) => {
  const { request } = ctx;
  const { firstName, age, sex, workerType, description, avatar, lastName, phone,
    wechat,
    wechatCode,
    practice,
    province,
    city,
    zone,
  } = request.body;
  const openId = ctx.request.headers["x-wx-openid"];
  if (openId) {
    const findUserExist = WorkerMember.findOne({
      where: {
        uid: openId
      }
    })
    if (findUserExist) {
      ctx.body = {
        code: 0,
        data: '用户信息已存在，请联系管理员修改！'
      }
    } else {
      const user = {
        uid: openId,
        firstName,
        age,
        sex,
        workerType,
        description,
        avatar,
        lastName,
        practice,
        province,
        city,
        zone,
        name: lastName + '师傅',
        publicStatus: 'NO',
        phone,
        wechat,
        wechatCode
      }
      try {
        await WorkerMember.create(user);
        ctx.body = {
          code: 0,
          data: 'SUCCESS'
        }
      } catch (error) {
        ctx.body = {
          code: -1,
          data: {
            error,
          }
        }
      }
    }
  } else {
    ctx.body = {
      code: 0,
      data: '用户登录信息不存在，请在小程序内登录后重新创建'
    }
  }
});

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功!", port);
  });
}
bootstrap();
