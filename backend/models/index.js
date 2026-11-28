const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    dialectModule: require('mysql2'), // Explicitly require mysql2
    operatorsAliases: 0,
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle,
      evict: dbConfig.pool.evict,
      validate: dbConfig.pool.validate
    },
    retry: dbConfig.retry,
    logging: (sql, timing) => {
      if (process.env.DEBUG_SQL === 'true') {
        console.log(`[DB-SQL] (${timing}ms) ${sql}`);
      }
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);

module.exports = db;