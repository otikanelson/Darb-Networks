const controller = require("../controllers/passwordReset.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // Request password reset
  app.post("/api/auth/forgot-password", controller.requestPasswordReset);

  // Reset password with token
  app.post("/api/auth/reset-password", controller.resetPassword);
};