const express = require("express");
const cors = require("cors");
const path = require('path');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Load environment variables only in non-production environments
// Vercel automatically injects environment variables, so dotenv is not needed there
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  require('dotenv').config();
  console.log('📝 Loaded environment variables from .env file');
}

// Serverless function export for Vercel
if (process.env.VERCEL) {
  console.log('🔷 Running on Vercel serverless');
}

const app = express();

console.log("🚀 Starting Darb Network API...");

// Parse CORS allowlist from environment
function getAllowedOrigins() {
  const allowedOrigins = [];

  // Always allow localhost in development
  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
  }

  // Add configured origins
  if (process.env.ALLOWED_ORIGINS) {
    const configuredOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
    allowedOrigins.push(...configuredOrigins);
  }

  return allowedOrigins;
}

// CORS configuration - Updated for security
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = getAllowedOrigins();
    const previewPattern = process.env.VERCEL_PREVIEW_PATTERN;

    // Check if origin is in the allowlist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Check if origin matches Vercel preview pattern (if configured)
    if (previewPattern) {
      try {
        const regex = new RegExp(previewPattern);
        if (regex.test(origin)) {
          return callback(null, true);
        }
      } catch (err) {
        console.warn('Invalid VERCEL_PREVIEW_PATTERN regex:', previewPattern);
      }
    }

    // Reject by default with proper CORS error handler
    callback(new Error('CORS_REJECTED'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Origin', 'Accept']
};

app.use(cors(corsOptions));

// Handle CORS rejections with proper JSON response
app.use((err, req, res, next) => {
  if (err.message === 'CORS_REJECTED') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  next(err);
});

// Add security headers
app.use(helmet());

// Trust proxy for accurate IP in Vercel
app.set('trust proxy', 1);

// Register raw body middleware for Paystack webhook BEFORE json parsing
// This captures the raw body for signature verification
app.use('/api/webhooks/paystack', express.raw({ type: 'application/json' }));

// Parse requests with lower limits for security
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

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
    status: "healthy"
  });
});


// Initialize database with error handling
let dbInitialized = false;
let dbError = null;

const initializeDatabase = async () => {
  try {
    console.log("🔧 Attempting to initialize database...");

    // Only try to connect to database if we have the required environment variables
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      console.error("❌ Missing database env vars:", {
        DB_HOST: !!process.env.DB_HOST,
        DB_USER: !!process.env.DB_USER,
        DB_NAME: !!process.env.DB_NAME
      });
      throw new Error("Missing required database environment variables");
    }

    console.log("📍 Connecting to database:", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER ? process.env.DB_USER.substring(0, 10) + "..." : "undefined",
      database: process.env.DB_NAME
    });

    const db = require("./models");

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
    console.error("Stack:", error.stack);
    dbError = error;
    return false;
  }
};

// Database status endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  app.get("/api/db-status", (req, res) => {
    res.status(200).json({
      success: true,
      database: {
        initialized: dbInitialized
      }
    });
  });
}

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

// Initialize database async - don't block route loading
initializeDatabase().catch(() => { });

// Add a middleware to wait for database to be ready on campaign endpoints
const dbReadyMiddleware = async (req, res, next) => {
  if (!dbInitialized && req.path.startsWith('/api/campaigns')) {
    // Wait up to 10 seconds for database to initialize
    let attempts = 0;
    while (!dbInitialized && attempts < 100) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    if (!dbInitialized) {
      return res.status(503).json({
        success: false,
        message: "Service initializing, please try again",
        error: dbError ? dbError.message : "Database initialization in progress"
      });
    }
  }
  next();
};

app.use(dbReadyMiddleware);

// Configure rate limiters
// General rate limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: false,
  skip: (req) => {
    // Don't rate limit in development
    if (process.env.NODE_ENV !== 'production') return true;
    // Don't rate limit webhook endpoints
    if (req.path.startsWith('/api/webhooks/')) return true;
    return false;
  }
});

// Strict rate limiter for auth endpoints: 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later' },
  standardHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production' // disable in development
});

// Apply general rate limiter to all /api routes
app.use('/api/', generalLimiter);

// Apply strict rate limiter to auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);


// Load routes with error handling
const loadRoutes = () => {
  try {
    const routes = [
      { name: 'passwordReset', path: './routes/passwordReset.routes' },
      { name: 'auth', path: './routes/auth.routes' },
      { name: 'user', path: './routes/user.routes' },
      { name: 'campaign', path: './routes/campaign.routes' },
      { name: 'admin', path: './routes/admin.routes' },
      { name: 'investment', path: './routes/investment.routes' }
    ];

    routes.forEach(route => {
      try {
        require(route.path)(app);
        console.log(`✅ ${route.name} routes loaded`);
      } catch (error) {
        console.error(`❌ Failed to load ${route.name} routes:`, error.message, error.stack);
        app.all(`/api/${route.name}*`, (req, res) => {
          res.status(503).json({
            success: false,
            message: `${route.name} service unavailable`
          });
        });
      }
    });

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

  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || 500;
  const message = isProduction ? 'Internal server error' : (err.message || 'Internal server error');

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  });
});

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
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