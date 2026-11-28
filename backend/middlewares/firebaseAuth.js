const { verifyIdToken, getUserByEmail } = require("../config/firebase");
const db = require("../models");
const User = db.user;
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

/**
 * Middleware: Verify Firebase ID token and attach user to request
 * Required middleware - returns 403 if no token, 401 if invalid
 * Sets req.userId (MySQL user ID) and req.firebaseUid on success
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header or x-access-token
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    // Remove 'Bearer ' prefix if present
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    if (!token) {
      return res.status(403).send({
        message: "No token provided!"
      });
    }

    // Try Firebase token first
    try {
      const decodedToken = await verifyIdToken(token);
      const firebaseUid = decodedToken.uid;

      // Look up user in MySQL by firebase_uid
      const user = await User.findOne({
        where: { firebase_uid: firebaseUid }
      });

      if (!user) {
        return res.status(401).send({
          message: "User not found in database. Profile creation may be needed."
        });
      }

      // Attach user info to request
      req.userId = user.id;
      req.firebaseUid = firebaseUid;
      req.userEmail = user.email;
      req.userType = user.userType; // founder, investor, or admin

      return next();
    } catch (firebaseError) {
      // Firebase verification failed, try JWT token for admin users
      console.warn("Firebase token verification failed, trying JWT...", firebaseError.message);

      try {
        const decoded = jwt.verify(token, config.secret);

        // Look up user in MySQL by ID
        const user = await User.findByPk(decoded.id);

        if (!user) {
          return res.status(401).send({
            message: "User not found in database."
          });
        }

        // Only allow admin users to authenticate via JWT
        if (user.userType !== 'admin') {
          return res.status(401).send({
            message: "JWT authentication only available for admin users. Please use Firebase authentication."
          });
        }

        // Attach user info to request
        req.userId = user.id;
        req.firebaseUid = null; // No Firebase UID for JWT auth
        req.userEmail = user.email;
        req.userType = user.userType;

        return next();
      } catch (jwtError) {
        // Both Firebase and JWT failed
        return res.status(401).send({
          message: "Unauthorized! Invalid or expired token.",
          error: firebaseError.message
        });
      }
    }
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).send({
      message: "Unauthorized! Invalid or expired token.",
      error: error.message
    });
  }
};

/**
 * Middleware: Verify Firebase ID token but don't require matching MySQL profile
 * Useful for endpoints that allow unregistered Firebase users (e.g., profile creation)
 * Sets req.firebaseUid on success; req.userId is undefined if no MySQL user found
 */
const verifyFirebaseTokenAllowNoProfile = async (req, res, next) => {
  try {
    // Extract token from Authorization header or x-access-token
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    // Remove 'Bearer ' prefix if present
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    if (!token) {
      return res.status(403).send({
        message: "No token provided!"
      });
    }

    // Verify Firebase ID token
    const decodedToken = await verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Try to find user in MySQL, but don't fail if not found
    const user = await User.findOne({
      where: { firebase_uid: firebaseUid }
    });

    // Attach available info to request
    req.firebaseUid = firebaseUid;
    req.userEmail = decodedToken.email || null;

    if (user) {
      req.userId = user.id;
      req.userType = user.userType;
    }

    next();
  } catch (error) {
    console.error("Firebase token verification error:", error.message);
    return res.status(401).send({
      message: "Unauthorized! Invalid or expired token.",
      error: error.message
    });
  }
};

/**
 * Middleware: Optional Firebase token verification
 * Does not reject if no token; sets req.userId and req.firebaseUid if valid token present
 * Useful for endpoints that work for both authenticated and guest users
 */
const optionalFirebaseToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header or x-access-token
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    // Remove 'Bearer ' prefix if present
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    // Try to verify Firebase ID token
    const decodedToken = await verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Try to find user in MySQL
    const user = await User.findOne({
      where: { firebase_uid: firebaseUid }
    });

    // Attach available info to request
    req.firebaseUid = firebaseUid;
    req.userEmail = decodedToken.email || null;

    if (user) {
      req.userId = user.id;
      req.userType = user.userType;
    }

    next();
  } catch (error) {
    // Log error but don't reject; treat as unauthenticated
    console.warn("Optional Firebase token verification failed:", error.message);
    next();
  }
};

/**
 * Middleware: Verify Firebase token AND email verification status
 * Ensures user has verified their email before accessing endpoint
 * Required middleware - returns 403 if email not verified
 */
const requireVerifiedEmail = async (req, res, next) => {
  try {
    // This middleware should be used AFTER verifyFirebaseToken middleware
    if (!req.userId) {
      return res.status(401).send({
        message: "Authentication required. Use verifyFirebaseToken middleware first."
      });
    }

    // Look up user to check email verification status
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(401).send({
        message: "User not found."
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).send({
        message: "Email verification required. Please verify your email before accessing this resource."
      });
    }

    next();
  } catch (error) {
    console.error("Email verification check error:", error.message);
    return res.status(500).send({
      message: "Internal server error while checking email verification status.",
      error: error.message
    });
  }
};

// Export the middleware functions
module.exports = {
  verifyFirebaseToken,
  verifyFirebaseTokenAllowNoProfile,
  optionalFirebaseToken,
  requireVerifiedEmail
};
