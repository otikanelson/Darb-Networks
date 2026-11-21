const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  // Remove 'Bearer ' if present
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

const optionalToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  // Remove 'Bearer ' if present
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  // If no token, just continue (user is not authenticated)
  if (!token) {
    return next();
  }

  // Try to verify token if present
  jwt.verify(token, config.secret, (err, decoded) => {
    if (!err && decoded) {
      // Token is valid, set userId
      req.userId = decoded.id;
    }
    // Whether token is valid or not, continue (do not reject)
    next();
  });
};

// Export the middleware functions
module.exports = {
  verifyToken,
  optionalToken
};