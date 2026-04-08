require('dotenv').config();

module.exports = {
  HOST: process.env.DB_HOST,
  PORT: parseInt(process.env.DB_PORT || '3306'),
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "mysql",
  
  // Aiven requires SSL - always enable when DB_SSL is set
  dialectOptions: {
    ssl: (process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production') ? {
      require: true,
      rejectUnauthorized: false
    } : undefined,
    connectTimeout: 60000
  },
  
  pool: {
    max: 5,
    min: 0,
    acquire: 60000, // 60 seconds
    idle: 10000,
    evict: 10000
  },
  
  retry: {
    max: 3
  },
  
  logging: process.env.NODE_ENV === 'development' ? console.log : false
};