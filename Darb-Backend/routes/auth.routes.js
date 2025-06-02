// Replace your entire routes/auth.routes.js with this debug version

const { verifySignUp, authJwt } = require("../middlewares");
const controller = require("../controllers/auth.controller");

// Debug: Check what's in the controller
console.log("🔧 AUTH ROUTES: Controller methods available:", Object.keys(controller));
console.log("🔧 AUTH ROUTES: signup function type:", typeof controller.signup);
console.log("🔧 AUTH ROUTES: signin function type:", typeof controller.signin);
console.log("🔧 AUTH ROUTES: verifyToken function type:", typeof controller.verifyToken);

module.exports = function(app) {
  console.log("🔧 AUTH ROUTES: Setting up auth routes...");
  
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // Debug middleware for auth routes
  app.use('/api/auth', (req, res, next) => {
    console.log(`🔧 AUTH ROUTES: ${req.method} ${req.url} hit auth route middleware`);
    next();
  });

  // Register route with debug logging
  console.log("🔧 AUTH ROUTES: Setting up POST /api/auth/register");
  app.post(
    "/api/auth/register",
    (req, res, next) => {
      console.log("🔧 REGISTER ROUTE: Hit register route!");
      console.log("🔧 REGISTER ROUTE: Request body exists:", !!req.body);
      console.log("🔧 REGISTER ROUTE: About to call checkDuplicateEmail");
      next();
    },
    [verifySignUp.checkDuplicateEmail],
    (req, res, next) => {
      console.log("🔧 REGISTER ROUTE: Passed checkDuplicateEmail, calling controller.signup");
      console.log("🔧 REGISTER ROUTE: Controller signup exists:", !!controller.signup);
      next();
    },
    controller.signup
  );

  // Login route with debug logging
  console.log("🔧 AUTH ROUTES: Setting up POST /api/auth/login");
  app.post("/api/auth/login", (req, res, next) => {
    console.log("🔧 LOGIN ROUTE: Hit login route!");
    next();
  }, controller.signin);
  
  // Verify token route
  console.log("🔧 AUTH ROUTES: Setting up GET /api/auth/profile");
  if (typeof controller.verifyToken === 'function') {
    app.get(
      "/api/auth/profile", 
      [authJwt.verifyToken], 
      controller.verifyToken
    );
  } else {
    console.error("🔧 AUTH ROUTES: verifyToken function is not defined in the controller!");
    app.get("/api/auth/profile", [authJwt.verifyToken], (req, res) => {
      res.status(501).send({ message: "Not implemented" });
    });
  }

  console.log("🔧 AUTH ROUTES: All auth routes configured");
};