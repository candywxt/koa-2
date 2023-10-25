const { Sequelize, DataTypes } = require("sequelize");

// 从环境变量中读取数据库配置
const { MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;

const [host, port] = MYSQL_ADDRESS.split(":");

const sequelize = new Sequelize("nodejs_demo", MYSQL_USERNAME, MYSQL_PASSWORD, {
  host,
  port,
  dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
});

// 定义数据模型
const Counter = sequelize.define("Counter", {
  type: {
    type: DataTypes.STRING,
  },
  openId: {
    type: DataTypes.STRING,
  }
});

const WorkerMember = sequelize.define("WorkerMember", {
  uid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  birthYear: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthMonth: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  birthDate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sex: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  workerType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  practice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  province: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  zone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
  publicStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NO',
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wechat: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wechatCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  albums: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

// 数据库初始化方法
async function init() {
  try {
    await Counter.sync({ alter: true });
    await WorkerMember.sync({ alter: true });
  } catch (error) {
    console.log('error wxt:, ', error)
  }

}

// 导出初始化方法和模型
module.exports = {
  init,
  Counter,
  WorkerMember,
};
