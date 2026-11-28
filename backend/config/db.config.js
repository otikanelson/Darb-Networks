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
    enableKeepAlive: false, // Disable keep-alive - create fresh connections
    dateStrings: true,
    typeCast: true,
    decimalNumbers: true
  },

  // For serverless: minimal pool, aggressively recycle connections
  // TiDB closes idle connections after ~30 minutes, so we recycle much sooner
  pool: {
    max: 1,        // Only 1 connection at a time (serverless)
    min: 0,        // Don't pre-allocate
    acquire: 30000,
    idle: 30000,   // Close idle connections after 30 seconds
    evict: 30000,  // Check and evict every 30 seconds
    validate: (connection) => {
      // Simple validation without async - Sequelize will handle connection testing
      // Just return true and let Sequelize test the connection
      return true;
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
