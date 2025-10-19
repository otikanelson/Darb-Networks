const controller = require("../controllers/passwordReset.controller");

module.exports = function(app) {
  // CORS headers
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // Request password reset
  app.post(
    "/api/auth/forgot-password", 
    controller.requestPasswordReset
  );

  // Reset password with token
  app.post(
    "/api/auth/reset-password", 
    controller.resetPassword
  );

  // Verify reset token (optional - for checking if token is valid)
  app.get(
    "/api/auth/verify-reset-token/:token",
    controller.verifyResetToken || ((req, res) => {
      res.status(501).send({ 
        success: false,
        message: "Token verification not implemented yet" 
      });
    })
  );
};