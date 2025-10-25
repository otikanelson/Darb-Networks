const mysql = require('mysql2/promise');

const testConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'YOUR_RAILWAY_HOST',
      port: 3306,
      user: 'root',
      password: 'GUvbHioVYfXSdHDRyKuRiAilavqnSFqT',
      database: 'railway',
      connectTimeout: 20000,
      ssl: {
        rejectUnauthorized: false // Railway requires SSL
      }
    });
    
    console.log('✅ Database connected successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test passed:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

testConnection();
