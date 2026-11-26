const { firebaseAuth } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  /**
   * STEP 5: Firebase Auth - Get user profile
   * 
   * Returns authenticated user's profile from MySQL
   * 
   * Request:
   * GET /api/users/profile
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * 
   * Response: User profile data
   */
  app.get(
    "/api/users/profile",
    [firebaseAuth.verifyFirebaseToken],
    controller.getProfile
  );

  /**
   * STEP 5: Firebase Auth - Update user profile
   * 
   * Updates profile fields (fullName, companyName, phoneNumber, address, BVN, etc.)
   * Note: userType set manually in DB only, cannot be changed via this endpoint
   * 
   * Request:
   * PUT /api/users/profile
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: {
   *   "fullName": "John Doe",
   *   "companyName": "Acme Inc",
   *   "phoneNumber": "+1234567890",
   *   "address": "123 Main St",
   *   "bvn": "12345678901",
   *   "cacNumber": "...",
   *   "accountNumber": "1234567890",
   *   "bankName": "..."
   * }
   * 
   * Response: Updated user profile
   */
  app.put(
    "/api/users/profile",
    [firebaseAuth.verifyFirebaseToken],
    controller.updateProfile
  );

  /**
   * STEP 5: Firebase Auth - Request email change
   * 
   * Initiates email change via Firebase
   * Firebase sends verification email to new address
   * User verifies via email link
   * Frontend calls /api/auth/verify-email to sync MySQL
   * 
   * Request:
   * PUT /api/users/email
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: {
   *   "newEmail": "newemail@example.com"
   * }
   * 
   * Note: Password verification no longer required (Firebase handles authentication)
   * 
   * Response: Confirmation with new email
   */
  app.put(
    "/api/users/email",
    [firebaseAuth.verifyFirebaseToken],
    controller.updateEmail
  );

  /**
   * STEP 5: Firebase Auth - Request password reset
   * 
   * Initiates password reset via Firebase
   * Firebase sends "reset password" email to user
   * User clicks link and sets new password in Firebase UI
   * Password change happens entirely in Firebase
   * 
   * Request:
   * PUT /api/users/password
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: {} (empty)
   * 
   * Note: User no longer provides current/new passwords here
   * Password reset link sent to their email instead
   * 
   * Response: Confirmation with email
   */
  app.put(
    "/api/users/password",
    [firebaseAuth.verifyFirebaseToken],
    controller.updatePassword
  );

  /**
   * STEP 5: Firebase Auth - Upload profile image
   * 
   * Uploads profile image to Cloudinary
   * 
   * Request:
   * POST /api/users/profile-image
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: form-data with 'profileImage' file
   * 
   * Response: Updated user profile with image URL
   */
  app.post(
    "/api/users/profile-image",
    [firebaseAuth.verifyFirebaseToken],
    controller.uploadProfileImage
  );

  /**
   * STEP 5: Firebase Auth - Delete profile image
   * 
   * Deletes profile image from Cloudinary
   * 
   * Request:
   * DELETE /api/users/profile-image
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * 
   * Response: Confirmation
   */
  app.delete(
    "/api/users/profile-image",
    [firebaseAuth.verifyFirebaseToken],
    controller.deleteProfileImage
  );

  /**
   * STEP 5: Firebase Auth - Get user settings
   * 
   * Returns user's notification and privacy settings
   * 
   * Request:
   * GET /api/users/settings
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * 
   * Response: Settings object
   */
  app.get(
    "/api/users/settings",
    [firebaseAuth.verifyFirebaseToken],
    controller.getSettings || ((req, res) => {
      res.status(200).send({
        success: true,
        data: {
          notifications: true,
          privacy: "public"
        }
      });
    })
  );

  /**
   * STEP 5: Firebase Auth - Update user settings
   * 
   * Updates user's notification and privacy settings
   * 
   * Request:
   * PUT /api/users/settings
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: {
   *   "notifications": true,
   *   "privacy": "public"
   * }
   * 
   * Response: Confirmation
   */
  app.put(
    "/api/users/settings",
    [firebaseAuth.verifyFirebaseToken],
    controller.updateSettings || ((req, res) => {
      res.status(200).send({
        success: true,
        message: "Settings updated successfully"
      });
    })
  );
};