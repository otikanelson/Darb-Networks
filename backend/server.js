const express = require("express");
const cors = require("cors");
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();

console.log("🚀 Starting Darb Network API...");

// CORS configuration - Updated for production
const corsOptions = {
  origin: [
    "http://localhost:5173", 
    "http://localhost:3000",
    process.env.CLIENT_ORIGIN,
    process.env.FRONTEND_URL,
    /\.vercel\.app$/ // Allow any Vercel app
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Origin', 'Accept']
};

app.use(cors(corsOptions));

// Parse requests with larger limits for production
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files middleware with error handling
try {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
} catch (error) {
  console.warn("⚠️ Static files setup failed:", error.message);
}

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoints - These should work without database
app.get("/", (req, res) => {
  res.status(200).json({ 
    success: true,
    message: "Darb Network API is running",
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({ 
    success: true,
    message: "Darb Network API endpoints",
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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint without database dependency
app.get('/test', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Test endpoint working",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDbHost: !!process.env.DB_HOST,
        hasJwtSecret: !!process.env.JWT_SECRET,
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Test endpoint failed",
      error: error.message
    });
  }
});

// Initialize database with error handling
let dbInitialized = false;
let dbError = null;

const initializeDatabase = async () => {
  try {
    console.log("🔧 Attempting to initialize database...");
    
    // Only try to connect to database if we have the required environment variables
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error("Missing required database environment variables");
    }
    
    const db = require("./models");
    
    console.log("🔧 Database config check:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      hasPassword: !!process.env.DB_PASSWORD
    });
    
    await db.sequelize.authenticate();
    console.log("✅ Database connection established successfully");
    
    // Only sync in development
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ alter: false });
      console.log("✅ Database synchronized successfully");
    }
    
    dbInitialized = true;
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    dbError = error;
    return false;
  }
};

// Database status endpoint
app.get("/api/db-status", (req, res) => {
  res.status(200).json({
    success: true,
    database: {
      initialized: dbInitialized,
      error: dbError ? dbError.message : null,
      hasConfig: {
        host: !!process.env.DB_HOST,
        user: !!process.env.DB_USER,
        database: !!process.env.DB_NAME,
        password: !!process.env.DB_PASSWORD
      }
    }
  });
});

// Middleware to check database connection for routes that need it
const requireDatabase = (req, res, next) => {
  if (!dbInitialized) {
    return res.status(503).json({
      success: false,
      message: "Database not available",
      error: dbError ? dbError.message : "Database not initialized"
    });
  }
  next();
};

// Initialize database (don't block startup if it fails)
initializeDatabase();

// File structure check endpoint
app.get('/test', (req, res) => {
  try {
    const fs = require('fs');
    
    // Check what's in the current directory
    const currentDir = fs.readdirSync('./');
    const hasRoutes = fs.existsSync('./routes');
    
    let routeFiles = [];
    if (hasRoutes) {
      routeFiles = fs.readdirSync('./routes');
    }
    
    res.status(200).json({
      success: true,
      message: "File structure check",
      currentDirectory: __dirname,
      filesInRoot: currentDir,
      hasRoutesFolder: hasRoutes,
      filesInRoutes: routeFiles,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Load routes with error handling
const loadRoutes = () => {
  try {
    console.log("🔧 Loading routes...");
    
    const routes = [
      { name: 'passwordReset', path: './routes/passwordReset.routes', requiresDb: false },
      { name: 'auth', path: './routes/auth.routes', requiresDb: true },
      { name: 'user', path: './routes/user.routes', requiresDb: true },
      { name: 'campaign', path: './routes/campaign.routes', requiresDb: true },
      { name: 'admin', path: './routes/admin.routes', requiresDb: true },
      { name: 'investment', path: './routes/investment.routes', requiresDb: true }
    ];
    
    routes.forEach(route => {
      try {
        // Simply require and call the route function with app
        // The route files themselves handle their own middleware
        require(route.path)(app);
        console.log(`✅ ${route.name} routes loaded`);
      } catch (error) {
        console.error(`❌ Failed to load ${route.name} routes:`, error.message);
        console.error(error.stack);
        
        // Create fallback routes for failed modules
        app.all(`/api/${route.name}/*`, (req, res) => {
          res.status(503).json({
            success: false,
            message: `${route.name} service unavailable`,
            error: error.message
          });
        });
      }
    });
    
    console.log("✅ All routes loaded successfully");
    
  } catch (error) {
    console.error("❌ Critical error loading routes:", error);
  }
};

// Load routes
loadRoutes();

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    path: req.path,
    timestamp: new Date().toISOString(),
    error: process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: err
    } : undefined
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
      'GET /health',
      'GET /test',
      'GET /api/db-status',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/campaigns'
    ],
    timestamp: new Date().toISOString()
  });
});

// For local development only
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 API available at http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  });
}

// Export for Vercel serverless function
module.exports = app;