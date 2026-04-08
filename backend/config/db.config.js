require('dotenv').config();

module.exports = {
  HOST: process.env.DB_HOST,
  PORT: parseInt(process.env.DB_PORT || '3306'),
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  dialect: "mysql",
  
  // Aiven MySQL SSL configuration
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false // Accept self-signed certificates for Aiven
    } : undefined,
    connectTimeout: 60000, // 60 seconds timeout
    charset: 'utf8mb4'
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