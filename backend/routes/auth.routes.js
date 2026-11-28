const { firebaseAuth } = require("../middlewares");
const verifyCaptcha = require("../middlewares/verifyCaptcha");
const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  /**
   * STEP 4: Firebase Auth - Signup route
   * 
   * NEW FLOW:
   * 1. User creates account in Firebase (frontend)
   * 2. Frontend gets Firebase ID token
   * 3. POST /api/auth/register with Firebase token + profile info
   * 4. Backend creates MySQL user profile
   * 
   * Request:
   * POST /api/auth/register
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: {
   *   fullName: "John Doe",
   *   companyName: "Acme Inc",
   *   userType: "founder|investor" (NOTE: set manually in DB, not from request)
   *   phoneNumber: "...",
   *   address: "...",
   *   bvn: "...",
   *   nin: "...",
   *   cacNumber: "...",
   *   accountNumber: "...",
   *   bankName: "..."
   * }
   */
  app.post(
    "/api/auth/register",
    [verifyCaptcha, firebaseAuth.verifyFirebaseTokenAllowNoProfile],
    controller.signup
  );

  /**
   * STEP 4: Firebase Auth - Login route
   * 
   * NEW FLOW:
   * 1. User authenticates with Firebase (frontend)
   * 2. Frontend gets Firebase ID token
   * 3. POST /api/auth/login with Firebase token
   * 4. Backend finds user and returns profile
   * 
   * Request:
   * POST /api/auth/login
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: {} (empty)
   * 
   * Response: User profile data
   */
  app.post(
    "/api/auth/login",
    [firebaseAuth.verifyFirebaseToken],
    controller.signin
  );

  /**
   * Traditional login for admin users
   * POST /api/auth/login-admin
   * 
   * Request:
   * {
   *   email: "admin@darb.com",
   *   password: "Admin@123456"
   * }
   * 
   * Response: User profile data
   */
  app.post(
    "/api/auth/login-admin",
    controller.signinAdmin
  );

  /**
   * STEP 4: Firebase Auth - Profile/Token verification route
   * 
   * Returns current user profile based on Firebase ID token
   * 
   * Request:
   * GET /api/auth/profile
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * 
   * Response: User profile data
   */
  app.get(
    "/api/auth/profile",
    [firebaseAuth.verifyFirebaseToken],
    controller.verifyToken
  );

  /**
   * STEP 4: Firebase Auth - Email verification route
   * 
   * Marks email as verified in MySQL (after Firebase confirms)
   * 
   * Request:
   * POST /api/auth/verify-email
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: {} (empty)
   * 
   * Response: Updated user profile
   */
  app.post(
    "/api/auth/verify-email",
    [firebaseAuth.verifyFirebaseToken],
    controller.verifyEmail
  );

  /**
   * STEP 4: Firebase Auth - Logout route
   * 
   * Note: Frontend handles token cleanup in localStorage
   * Backend can track logout events if needed
   * 
   * Request:
   * POST /api/auth/logout
   * Headers: Authorization: Bearer <FIREBASE_ID_TOKEN>
   * Body: {} (empty)
   * 
   * Response: Confirmation
   */
  app.post(
    "/api/auth/logout",
    [firebaseAuth.verifyFirebaseToken],
    controller.logout
  );
};