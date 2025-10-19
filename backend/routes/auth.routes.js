const { verifySignUp, authJwt } = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
  // CORS headers for all auth routes
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // Registration route
  app.post(
    "/api/auth/register",
    [verifySignUp.checkDuplicateEmail],
    controller.signup
  );

  // Login route
  app.post(
    "/api/auth/login", 
    controller.signin
  );
  
  // Profile/Token verification route
  app.get(
    "/api/auth/profile", 
    [authJwt.verifyToken], 
    controller.verifyToken || ((req, res) => {
      res.status(200).send({
        success: true,
        message: "Token is valid",
        data: {
          id: req.userId,
          email: req.userEmail
        }
      });
    })
  );

  // Email verification route (if you have this functionality)
  app.post(
    "/api/auth/verify-email",
    controller.verifyEmail || ((req, res) => {
      res.status(501).send({ message: "Email verification not implemented yet" });
    })
  );

  // Logout route (optional - mainly for clearing server-side sessions if needed)
  app.post(
    "/api/auth/logout",
    [authJwt.verifyToken],
    controller.logout || ((req, res) => {
      res.status(200).send({
        success: true,
        message: "Logged out successfully"
      });
    })
  );
};