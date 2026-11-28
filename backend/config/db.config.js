require('dotenv').config();

console.log("[DB-CONFIG] Loading database configuration...");

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
    connectTimeout: 30000, // Increased to 30 seconds for Vercel cold starts
    enableKeepAlive: true,
    // TiDB specific settings
    dateStrings: true,
    typeCast: true
  },

  // Serverless-optimized pool settings
  pool: {
    max: 1, // Reduced to 1 for serverless (each connection is expensive)
    min: 0,
    acquire: 30000, // 30 seconds
    idle: 5000,
    evict: 5000,
    validate: (connection) => {
      console.log("[DB-POOL] Validating connection...");
      return connection.query({ sql: 'SELECT 1', timeout: 5000 })
        .then(() => {
          console.log("[DB-POOL] Connection validation successful");
          return true;
        })
        .catch((err) => {
          console.error("[DB-POOL] Connection validation failed:", err.message);
          return false;
        });
    }
  },

  retry: {
    max: 3 // Increased retries
  },

  logging: (sql, timing) => {
    console.log(`[DB-SQL] (${timing}ms) ${sql}`);
  }
};
