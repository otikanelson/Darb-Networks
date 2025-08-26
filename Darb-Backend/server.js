const express = require("express");
const cors = require("cors");
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration - Updated for production
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    process.env.CLIENT_ORIGIN,
    process.env.FRONTEND_URL,
    /\.vercel\.app$/ // Allow any Vercel app
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Origin', 'Accept']
};

app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(express.json({ limit: '10mb' }));

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoints
app.get("/", (req, res) => {
  res.json({ 
    message: "Welcome to Darb Network API.",
    status: "running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "Darb Network API is running",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth/*",
      users: "/api/users/*",
      campaigns: "/api/campaigns/*",
      investments: "/api/investments/*",
      admin: "/api/admin/*"
    },
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for uploads
app.get('/test-static', (req, res) => {
  try {
    const fs = require('fs');
    const uploadDir = path.join(__dirname, 'uploads', 'profiles');
    
    console.log('📁 Upload directory:', uploadDir);
    console.log('📂 Directory exists:', fs.existsSync(uploadDir));
    
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      console.log('📄 Files in directory:', files);
      res.json({
        directory: uploadDir,
        exists: true,
        files: files,
        success: true
      });
    } else {
      res.json({
        directory: uploadDir,
        exists: false,
        files: [],
        success: true
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking uploads directory",
      error: error.message
    });
  }
});

// Database connection
const db = require("./models");

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connection has been established successfully.");
    
    // Only sync in development - avoid in production
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync();
      console.log("Database synchronized successfully");
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    // Don't exit the process in production - let it continue without DB
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Initialize database
initializeDatabase();

// Routes - Load all route modules
try {
  require('./routes/auth.routes')(app);
  require('./routes/user.routes')(app);
  require('./routes/passwordReset.routes')(app);
  require('./routes/campaign.routes')(app);
  require('./routes/admin.routes')(app);
  require('./routes/investment.routes')(app);
  console.log("✅ All routes loaded successfully");
} catch (error) {
  console.error("❌ Error loading routes:", error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/campaigns',
      'POST /api/campaigns'
    ]
  });
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}/api`);
  });
}

// Export for Vercel serverless function
module.exports = app;