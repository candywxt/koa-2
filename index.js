const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const { init: initDB, Counter, WorkerMember } = require("./db");
const workerTypeMap = {
  chaigai: '拆改',
  shuidian: '水电',
  nigong: '泥工',
  mugong: '木工',
  yougong: '油工',
  meifeng: '美缝',
  baojie: '保洁'
}

const cloud = require('wx-server-sdk');
cloud.init();

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
  const now = new Date();
  const nowYear = now.getFullYear();

  const newResult = []


  result.forEach(item => {
    const { avatar, uid, birthYear, workerType, name, sex, practice, description } = item;
    const age = nowYear - birthYear;
    newResult.push({
      avatar,
      uid,
      age,
      workerTypeCH: workerTypeMap[workerType],
      name,
      sex,
      practice,
      description,
    })
  });
  ctx.body = {
    code: 0,
    data: newResult,
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
  const { firstName, sex, workerType, description, avatar, lastName, phone,
    wechat,
    wechatCode,
    practice,
    province,
    city,
    zone,
    birthYear,
    albums
  } = result;

  const now = new Date();
  const nowYear = now.getFullYear();
  const age = nowYear - birthYear;

  const user = {
    uid,
    firstName, age, sex, workerType, description, avatar, lastName, phone,
    wechat,
    wechatCode,
    practice,
    province,
    city,
    zone,
    workerTypeCH: workerTypeMap[workerType],
    albums: JSON.parse(albums)
  }
  ctx.body = {
    code: 0,
    data: user
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
    birthYear,
    birthMonth,
    birthDate,
    albums
  } = request.body;
  const openId = ctx.request.headers["x-wx-openid"];
  if (openId) {
    const findUserExist = WorkerMember.findOne({
      where: {
        uid: openId
      }
    })

    if (findUserExist.uid) {
      ctx.body = {
        code: 0,
        msg: "用户信息已存在，请联系管理员修改！",
        data: findUserExist
      }
    } else {
      const user = {
        uid: openId,
        firstName,
        birthYear,
        birthMonth,
        birthDate,
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
        wechatCode,
        albums: JSON.stringify(albums)
      }
      try {
        await WorkerMember.create(user);
        ctx.body = {
          code: 0,
          findUserExist,
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
