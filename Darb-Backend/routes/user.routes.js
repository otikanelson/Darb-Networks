const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, Authorization"
    );
    next();
  });

  // Get user profile
  app.get(
    "/api/users/profile",
    [authJwt.verifyToken],
    controller.getProfile
  );

  // Update user profile (general fields)
  app.put(
    "/api/users/profile",
    [authJwt.verifyToken],
    controller.updateProfile
  );

  // Update email (requires password verification)
  app.put(
    "/api/users/email",
    [authJwt.verifyToken],
    controller.updateEmail
  );

  // Update password
  app.put(
    "/api/users/password",
    [authJwt.verifyToken],
    controller.updatePassword
  );

  // Upload profile image
  app.post(
    "/api/users/profile-image",
    [authJwt.verifyToken],
    controller.uploadProfileImage
  );

  // Delete profile image
  app.delete(
    "/api/users/profile-image",
    [authJwt.verifyToken],
    controller.deleteProfileImage
  );
};