const { verifySignUp, authJwt } = require("../middlewares");
const verifyCaptcha = require("../middlewares/verifyCaptcha");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  // Registration route
  app.post(
    "/api/auth/register",
    [verifyCaptcha, verifySignUp.checkDuplicateEmail],
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