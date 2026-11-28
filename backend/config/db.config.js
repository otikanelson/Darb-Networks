require('dotenv').config();

console.log("[DB-CONFIG] Loading database configuration...");

module.exports = {
  HOST: process.env.DB_HOST,
  PORT: parseInt(process.env.DB_PORT || '4000'),
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "mysql",

  // TiDB/Aiven requires SSL - always enable in production
  dialectOptions: {
    ssl: (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production') ? {
      require: true,
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    } : undefined,
    connectTimeout: 30000,
    enableKeepAlive: true,
    dateStrings: true,
    typeCast: true,
    decimalNumbers: true
  },

  // Serverless-optimized pool settings
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 5000,
    evict: 5000,
    validate: (connection) => {
      return connection.query({ sql: 'SELECT 1', timeout: 5000 })
        .then(() => true)
        .catch(() => false);
    }
  },

  retry: {
    max: 3
  },

  logging: (sql, timing) => {
    if (process.env.DEBUG_SQL === 'true') {
      console.log(`[DB-SQL] (${timing}ms) ${sql}`);
    }
  }
};
