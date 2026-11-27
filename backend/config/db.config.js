require('dotenv').config();

module.exports = {
  HOST: process.env.DB_HOST,
  PORT: parseInt(process.env.DB_PORT || '3306'),
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "mysql",

  // TiDB/Aiven requires SSL - always enable when DB_SSL is set
  dialectOptions: {
    ssl: (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production') ? {
      require: true,
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    } : undefined,
    connectTimeout: 20000, // Reduced to 20 seconds for faster failure detection
    enableKeepAlive: true,
    keepAliveInitialDelayMsecs: 0,
    // TiDB specific settings
    dateStrings: true,
    typeCast: true
  },

  // Serverless-optimized pool settings
  pool: {
    max: 2, // Reduced for serverless (each connection is expensive)
    min: 0,
    acquire: 20000, // 20 seconds
    idle: 5000,
    evict: 5000,
    validate: (connection) => {
      return connection.query({ sql: 'SELECT 1', timeout: 5000 })
        .then(() => true)
        .catch(() => false);
    }
  },

  retry: {
    max: 2 // Reduced retries
  },

  logging: false
};