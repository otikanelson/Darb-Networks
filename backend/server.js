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

// Health check endpoint with environment diagnostics
app.get("/debug/env-status", async (req, res) => {
  console.log("🔍 /debug/env-status called");

  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      vars: {
        DB_HOST: !!process.env.DB_HOST,
        DB_USER: !!process.env.DB_USER,
        DB_PASSWORD: !!process.env.DB_PASSWORD,
        DB_NAME: !!process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT || "not set",
        DB_SSL: process.env.DB_SSL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "not set",
        PAYSTACK_SECRET_KEY: !!process.env.PAYSTACK_SECRET_KEY
      },
      database: {
        initialized: dbInitialized,
        error: dbError ? {
          message: dbError.message,
          name: dbError.name,
          code: dbError.code
        } : null,
        waitTime: 0
      }
    }
  });
});

// Test database connection endpoint
app.get("/debug/db-test", async (req, res) => {
  console.log("🧪 /debug/db-test called - testing database connection...");

  try {
    if (!process.env.DB_HOST) {
      throw new Error("DB_HOST not set");
    }

    console.log("Creating test connection to", process.env.DB_HOST);
    const Sequelize = require("sequelize");
    const testSeq = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        dialectModule: require('mysql2'),
        dialectOptions: {
          ssl: process.env.DB_SSL === 'true' ? {
            require: true,
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
          } : undefined,
          connectTimeout: 10000
        },
        logging: (sql) => console.log("SQL:", sql),
        benchmark: true
      }
    );

    console.log("Authenticating...");
    await testSeq.authenticate();
    console.log("✅ Connection successful!");

    res.status(200).json({
      success: true,
      message: "Database connection successful",
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true'
      }
    });
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      code: error.code
    });
  }
});


// Initialize database with error handling
let dbInitialized = false;
let dbError = null;
let initPromise = null; // Track the initialization promise

const initializeDatabase = async () => {
  // Prevent multiple simultaneous initialization attempts
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      console.log("🔧 [DB] Attempting to initialize database...");
      console.log("🔧 [DB] Process ID:", process.pid);
      console.log("🔧 [DB] Environment:", process.env.NODE_ENV);
      console.log("🔧 [DB] Vercel:", !!process.env.VERCEL ? "Yes" : "No");

      // Log which env vars are set (without showing values for security)
      console.log("📝 [DB] Environment variables status:");
      console.log("  - DB_HOST:", !!process.env.DB_HOST ? `✅ set (${process.env.DB_HOST})` : "❌ missing");
      console.log("  - DB_USER:", !!process.env.DB_USER ? `✅ set (${process.env.DB_USER.substring(0, 20)}...)` : "❌ missing");
      console.log("  - DB_PASSWORD:", !!process.env.DB_PASSWORD ? "✅ set (length: " + process.env.DB_PASSWORD.length + ")" : "❌ missing");
      console.log("  - DB_NAME:", !!process.env.DB_NAME ? `✅ set (${process.env.DB_NAME})` : "❌ missing");
      console.log("  - DB_PORT:", process.env.DB_PORT || "not set (will use default)");
      console.log("  - DB_SSL:", process.env.DB_SSL || "not set");

      // Only try to connect to database if we have the required environment variables
      if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
        console.error("❌ [DB] Missing critical database env vars:", {
          DB_HOST: !!process.env.DB_HOST,
          DB_USER: !!process.env.DB_USER,
          DB_NAME: !!process.env.DB_NAME
        });
        throw new Error("Missing required database environment variables");
      }

      console.log("📍 [DB] Connection parameters:");
      console.log("   Host:", process.env.DB_HOST);
      console.log("   Port:", process.env.DB_PORT || 3306);
      console.log("   Database:", process.env.DB_NAME);
      console.log("   User:", process.env.DB_USER.substring(0, 20) + "...");
      console.log("   SSL:", process.env.DB_SSL === 'true' ? "enabled" : "disabled");

      console.log("⏳ [DB] Loading models...");
      let db;
      try {
        const modelStart = Date.now();
        db = require("./models");
        const modelDuration = Date.now() - modelStart;
        console.log("✅ [DB] Models loaded successfully (took " + modelDuration + "ms)");
      } catch (modelError) {
        console.error("❌ [DB] FAILED to load models!");
        console.error("   Error type:", modelError.constructor.name);
        console.error("   Error message:", modelError.message);
        console.error("   Stack:", modelError.stack);
        throw new Error(`Model loading failed: ${modelError.message}`);
      }

      console.log("⏳ [DB] Attempting to authenticate with database...");
      const start = Date.now();
      try {
        console.log("   - Starting connection attempt to", process.env.DB_HOST + ":" + (process.env.DB_PORT || 3306));
        const authPromise = db.sequelize.authenticate();

        // Add a timeout promise to race against
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('AUTH_TIMEOUT_EXCEEDED_20S')), 21000);
        });

        await Promise.race([authPromise, timeoutPromise]);

        const duration = Date.now() - start;
        console.log("✅ [DB] Authentication successful! Connection took " + duration + "ms");
        console.log("   - Connected to:", process.env.DB_HOST + ":" + (process.env.DB_PORT || 3306));
      } catch (authError) {
        const duration = Date.now() - start;
        console.error("❌ [DB] FAILED to authenticate after " + duration + "ms!");
        console.error("   Error type:", authError.constructor.name);
        console.error("   Error message:", authError.message);
        console.error("   Error code:", authError.code);

        // Check if it's a timeout
        if (authError.message.includes('ETIMEDOUT')) {
          console.error("   ⚠️  TIMEOUT ERROR - Connection to TiDB timed out");
          console.error("   - Possible causes:");
          console.error("     1. Network/firewall issue between Vercel and TiDB");
          console.error("     2. TiDB server is unreachable or down");
          console.error("     3. DNS resolution failing for", process.env.DB_HOST);
          console.error("     4. Connection timeout is too short (20s)");
        } else if (authError.message.includes('ECONNREFUSED')) {
          console.error("   ⚠️  CONNECTION REFUSED - TiDB rejected the connection");
          console.error("     Check if TiDB is accepting connections and IP is whitelisted");
        } else if (authError.message.includes('ENOTFOUND')) {
          console.error("   ⚠️  DNS RESOLUTION FAILED");
          console.error("     Cannot resolve hostname:", process.env.DB_HOST);
        }

        console.error("   Stack trace:", authError.stack);
        if (authError.original) {
          console.error("   === ORIGINAL ERROR ===");
          console.error("   Type:", authError.original.constructor.name);
          console.error("   Message:", authError.original.message);
          console.error("   Code:", authError.original.code);
          console.error("   Stack:", authError.original.stack);
        }
        if (authError.sql) {
          console.error("   SQL:", authError.sql);
        }
        throw authError;
      }

      // Only sync in development
      if (process.env.NODE_ENV !== 'production') {
        console.log("⏳ [DB] Syncing models (development only)...");
        await db.sequelize.sync({ alter: false });
        console.log("✅ [DB] Models synchronized successfully");
      }

      dbInitialized = true;
      console.log("🎉 [DB] Database initialization complete!");
      return true;
    } catch (error) {
      console.error("❌❌❌ [DB] DATABASE INITIALIZATION FAILED ❌❌❌");
      console.error("Timestamp:", new Date().toISOString());
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error errno:", error.errno);
      console.error("Full stack:", error.stack);
      if (error.original) {
        console.error("\n=== ORIGINAL/UNDERLYING ERROR ===");
        console.error("Type:", error.original.constructor.name);
        console.error("Message:", error.original.message);
        console.error("Code:", error.original.code);
        console.error("Errno:", error.original.errno);
        console.error("Stack:", error.original.stack);
      }
      dbError = error;
      return false;
    }
  })();

  return initPromise;
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

// Initialize database async - don't block route loading
// But ensure it starts immediately
initializeDatabase().catch(err => {
  console.error("❌ Failed to initialize database at startup:", err.message);
});

// Wait for the database to be ready on every API request (cold starts)
const dbReadyMiddleware = async (req, res, next) => {
  if (!dbInitialized && req.path.startsWith('/api/')) {
    console.log("⏳ Database not initialized, waiting...");

    // If initialization hasn't started, start it now
    if (!initPromise) {
      await initializeDatabase();
    } else {
      // Wait for ongoing initialization to complete
      await initPromise;
    }

    if (!dbInitialized) {
      console.error("❌ Database init failed:", dbError?.message);
      return res.status(503).json({
        success: false,
        message: "Database not available",
        error: dbError ? dbError.message : "Database initialization failed"
      });
    }
    console.log("✅ Database is now ready");
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


// Register routes synchronously so they come BEFORE the 404 handler below.
// (Registering them after an async DB wait put them behind the catch-all 404.)
// Database readiness is enforced per request by dbReadyMiddleware above.
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
    console.error(`❌ Failed to load ${route.name} routes:`, error.message);
    app.all(`/api/${route.name}*`, (req, res) => {
      res.status(503).json({
        success: false,
        message: `${route.name} service unavailable`
      });
    });
  }
});

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