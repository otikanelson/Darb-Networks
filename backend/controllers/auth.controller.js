const db = require("../models");
const { createUser, getUserByEmail } = require("../config/firebase");
const User = db.user;
const { sendError } = require("../utils/http");
const bcrypt = require("bcryptjs");

/**
 * STEP 4: Firebase Auth - Signup endpoint
 * 
 * NEW FLOW (Firebase):
 * 1. Frontend creates user in Firebase (email/password)
 * 2. Frontend gets Firebase ID token
 * 3. Frontend sends POST /api/auth/register with Firebase token + profile info
 * 4. Backend verifies token (via firebaseAuth middleware)
 * 5. Backend creates/updates MySQL user profile
 * 
 * Request body:
 * {
 *   firebaseToken: "...",  // Firebase ID token from client
 *   fullName: "John Doe",
 *   companyName: "Acme Inc",
 *   userType: "founder" or "investor",  // Set manually in DB, not from request
 *   phoneNumber: "...",
 *   address: "...",
 *   bvn: "...",
 *   nin: "...",
 *   cacNumber: "...",
 *   accountNumber: "...",
 *   bankName: "..."
 * }
 * 
 * Response: User profile + Firebase ID token
 */
exports.signup = async (req, res) => {
  try {
    // firebaseAuth middleware already verified token and set req.firebaseUid, req.userEmail
    const { fullName, companyName, phoneNumber, address, bvn, nin, cacNumber, accountNumber, bankName } = req.body;
    const firebaseUid = req.firebaseUid;
    const email = req.userEmail;

    if (!fullName) {
      return res.status(400).send({ success: false, message: "Full name is required" });
    }

    if (!email) {
      return res.status(400).send({ success: false, message: "Email not found in Firebase token" });
    }

    // Check if user already has MySQL profile
    const existingUser = await User.findOne({ where: { firebase_uid: firebaseUid } });
    if (existingUser) {
      return res.status(400).send({ success: false, message: "User profile already exists" });
    }

    // Create new user in MySQL (userType set manually in DB, never from request)
    // Default to "investor" for self-registration; "founder" and "admin" set only via backend/admin
    const user = await User.create({
      firebase_uid: firebaseUid,
      email,
      fullName,
      userType: "investor",  // Default for self-registration
      companyName: companyName || null,
      phoneNumber: phoneNumber || null,
      address: address || null,
      bvn: bvn || null,
      nin: nin || null,
      cacNumber: cacNumber || null,
      accountNumber: accountNumber || null,
      bankName: bankName || null,
      isActive: true,
      isVerified: false,
      isEmailVerified: false  // Set by email verification flow
    });

    res.status(201).send({
      success: true,
      message: "User profile created successfully!",
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        companyName: user.companyName,
        isActive: user.isActive,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        firebaseUid: user.firebase_uid
      }
    });
  } catch (error) {
    return sendError(res, 500, "Error creating user profile.", error);
  }
};

/**
 * STEP 4: Firebase Auth - Login endpoint
 * 
 * NEW FLOW (Firebase):
 * 1. Frontend authenticates with Firebase (email/password or OAuth)
 * 2. Frontend gets Firebase ID token
 * 3. Frontend sends POST /api/auth/login with Firebase token
 * 4. Backend verifies token (via firebaseAuth middleware)
 * 5. Backend finds/creates MySQL user and returns profile
 * 
 * Request body:
 * {
 *   firebaseToken: "..."  // Firebase ID token from client
 * }
 * 
 * Response: User profile data
 * Note: Frontend handles token storage; backend verifies on each request
 */
exports.signin = async (req, res) => {
  try {
    // firebaseAuth middleware already verified token and set req.firebaseUid, req.userEmail
    const firebaseUid = req.firebaseUid;
    const email = req.userEmail;

    if (!firebaseUid || !email) {
      return res.status(400).send({
        success: false,
        message: "Firebase authentication required"
      });
    }

    // Find user in MySQL by firebase_uid
    const user = await User.findOne({ where: { firebase_uid: firebaseUid } });

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User profile not found. Please create a profile first via /api/auth/register.",
        code: "PROFILE_NOT_FOUND"
      });
    }

    if (!user.isActive) {
      return res.status(401).send({
        success: false,
        message: "Account is inactive. Please contact support."
      });
    }

    // Update last login timestamp
    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    res.status(200).send({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        companyName: user.companyName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImageUrl: user.profileImageUrl,
        isActive: user.isActive,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return sendError(res, 500, "Some error occurred during login.", error);
  }
};

/**
 * Traditional login with email/password (for admin users)
 * POST /api/auth/login-admin
 * 
 * Request body:
 * {
 *   email: "admin@darb.com",
 *   password: "Admin@123456"
 * }
 */
exports.signinAdmin = async (req, res) => {
  try {
    console.log('[AUTH] Admin login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[AUTH] Missing email or password');
      return res.status(400).send({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user by email
    console.log('[AUTH] Looking up user:', email);
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log('[AUTH] User not found:', email);
      return res.status(401).send({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log('[AUTH] User found, checking type:', user.userType);
    console.log('[AUTH] Stored password hash:', user.password ? user.password.substring(0, 20) + '...' : 'NO HASH');
    console.log('[AUTH] Hash length:', user.password ? user.password.length : 0);

    // Check if user is admin
    if (user.userType !== 'admin') {
      console.log('[AUTH] User is not admin, type:', user.userType);
      return res.status(403).send({
        success: false,
        message: "This endpoint is for admin users only"
      });
    }

    // Verify password
    if (!user.password) {
      console.log('[AUTH] Admin user has no password hash');
      return res.status(401).send({
        success: false,
        message: "Invalid email or password"
      });
    }

    try {
      console.log('[AUTH] Comparing password...');
      console.log('[AUTH] Input password length:', password.length);
      const passwordMatch = bcrypt.compareSync(password, user.password);
      console.log('[AUTH] Password match result:', passwordMatch);

      if (!passwordMatch) {
        console.log('[AUTH] Password mismatch');
        return res.status(401).send({
          success: false,
          message: "Invalid email or password"
        });
      }
    } catch (bcryptError) {
      console.error('[AUTH] Bcrypt comparison error:', bcryptError.message);
      return res.status(401).send({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      console.log('[AUTH] User is not active');
      return res.status(401).send({
        success: false,
        message: "Account is inactive. Please contact support."
      });
    }

    console.log('[AUTH] Admin login successful, updating lastLoginAt');

    // Update last login timestamp
    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    res.status(200).send({
      success: true,
      message: "Admin login successful",
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        companyName: user.companyName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImageUrl: user.profileImageUrl,
        isActive: user.isActive,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('[AUTH] Admin login error:', error.message);
    console.error('[AUTH] Error stack:', error.stack);
    return sendError(res, 500, "Error during admin login.", error);
  }
};

/**
 * STEP 4: Firebase Auth - Verify token endpoint
 * 
 * Returns current user profile based on Firebase ID token
 * No body required; Firebase token verified by middleware
 * 
 * Response: User profile data
 */
exports.verifyToken = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).send({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        companyName: user.companyName,
        phoneNumber: user.phoneNumber,
        address: user.address,
        profileImageUrl: user.profileImageUrl,
        isActive: user.isActive,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return sendError(res, 500, "Error retrieving user.", error);
  }
};

/**
 * STEP 4: Firebase Auth - Verify email endpoint
 * 
 * Marks user's email as verified in MySQL
 * Frontend will manually trigger email verification flow in Firebase
 * Backend tracks verification status in isEmailVerified column
 * 
 * Request body: (empty)
 * 
 * Response: Updated user profile
 * 
 * Note: This is called AFTER Firebase confirms email verification.
 * Frontend flows:
 * 1. User clicks "Verify Email" link from Firebase email
 * 2. Firebase marks email as verified in Firebase Auth
 * 3. Frontend calls this endpoint with verified Firebase token
 * 4. Backend updates isEmailVerified = true
 */
exports.verifyEmail = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    // Update email verification status
    await User.update({ isEmailVerified: true }, { where: { id: userId } });

    // Fetch updated user
    const updatedUser = await User.findByPk(userId);

    res.status(200).send({
      success: true,
      message: "Email verified successfully!",
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        isEmailVerified: updatedUser.isEmailVerified,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    return sendError(res, 500, "Error verifying email.", error);
  }
};

/**
 * STEP 4: Firebase Auth - Logout endpoint
 * 
 * Note: Firebase logout is handled on frontend (clear token from localStorage)
 * Backend doesn't store sessions, so logout is mainly informational
 * This endpoint can track logout events if needed (optional)
 * 
 * Response: Confirmation
 */
exports.logout = async (req, res) => {
  try {
    // Optional: Update lastLogoutAt timestamp for audit trail
    if (req.userId) {
      await User.update({ lastLogoutAt: new Date() }, { where: { id: req.userId } });
    }

    res.status(200).send({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    return sendError(res, 500, "Error during logout.", error);
  }
};

module.exports = {
  signup: exports.signup,
  signin: exports.signin,
  signinAdmin: exports.signinAdmin,
  verifyToken: exports.verifyToken,
  verifyEmail: exports.verifyEmail,
  logout: exports.logout
};
