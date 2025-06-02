// controllers/auth.controller.js - Fixed version with better error handling
const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  
  try {
    console.log("🔥 Signup request received:", {
      email: req.body.email,
      fullName: req.body.fullName,
      userType: req.body.userType,
    });

    // Validate required fields
    const { email, password, fullName, userType } = req.body;
    
    console.log("🔍 Validating fields...");
    console.log("Email:", email);
    console.log("Password length:", password ? password.length : 'undefined');
    console.log("Full name:", fullName);
    console.log("User type:", userType);
    
    if (!email || !password || !fullName || !userType) {
      console.log("❌ Missing required fields");
      console.log("Missing fields:", {
        email: !email,
        password: !password,
        fullName: !fullName,
        userType: !userType
      });
      return res.status(400).send({
        success: false,
        message: "Email, password, full name, and user type are required"
      });
    }

    console.log("✅ All required fields present");

    // Import models
    const db = require("../models");
    const User = db.user;
    console.log("📦 Models imported, User model exists:", !!User);

    // Check if user already exists
    console.log("🔍 Checking if user exists...");
    const existingUser = await User.findOne({
      where: { email: email }
    });

    if (existingUser) {
      console.log("❌ User already exists");
      return res.status(400).send({
        success: false,
        message: "Email is already in use"
      });
    }

    console.log("✅ User does not exist, proceeding with creation");

    // Hash password
    console.log("🔐 Hashing password...");
    const bcrypt = require("bcryptjs");
    const hashedPassword = bcrypt.hashSync(password, 8);
    console.log("✅ Password hashed successfully");

    // Create user
    console.log("👤 Creating user...");
    console.log("📝 User data to create:", {
      email: email,
      fullName: fullName,
      userType: userType,
      companyName: req.body.companyName || null,
      phoneNumber: req.body.phoneNumber || null,
      address: req.body.address || null,
      bvn: req.body.bvn || null,
      cacNumber: req.body.cacNumber || null,
      accountNumber: req.body.accountNumber || null,
      bankName: req.body.bankName || null,
      isActive: true,
      isVerified: false
    });

    const user = await User.create({
      email: email,
      password: hashedPassword,
      fullName: fullName,
      userType: userType,
      companyName: req.body.companyName || null,
      phoneNumber: req.body.phoneNumber || null,
      address: req.body.address || null,
      bvn: req.body.bvn || null,
      cacNumber: req.body.cacNumber || null,
      accountNumber: req.body.accountNumber || null,
      bankName: req.body.bankName || null,
      isActive: true,
      isVerified: false
    });

    console.log("✅ User created successfully:", {
      id: user.id,
      email: user.email
    });

    // Generate token
    console.log("🎫 Generating token...");
    const jwt = require("jsonwebtoken");
    const config = require("../config/auth.config");
    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.expiresIn // 24 hours
    });
    console.log("✅ Token generated successfully");

    const response = {
      success: true,
      message: "User registered successfully!",
      data: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType: user.userType,
        companyName: user.companyName,
        isActive: user.isActive,
        isVerified: user.isVerified
      },
      token: token
    };

    console.log("📤 Sending response:", response);

    res.status(201).send(response);

  } catch (error) {
    console.error("❌❌❌ SIGNUP ERROR:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    
    res.status(500).send({
      success: false,
      message: error.message || "Some error occurred during registration."
    });
  }
};

exports.signin = async (req, res) => {
  try {
    console.log("🔥 Login request received:", {
      email: req.body.email,
    });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(400).send({
        success: false,
        message: "Email and password are required"
      });
    }

    console.log("🔍 Looking for user in database...");
    const user = await User.findOne({
      where: { email: email }
    });

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).send({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log("✅ User found:", {
      id: user.id,
      email: user.email,
      userType: user.userType,
      isActive: user.isActive
    });

    // Check if user is active
    if (!user.isActive) {
      console.log(`❌ User account is inactive: ${email}`);
      return res.status(401).send({
        success: false,
        message: "Account is inactive. Please contact support."
      });
    }

    // Verify password
    console.log("🔐 Verifying password...");
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      console.log(`❌ Invalid password for user: ${email}`);
      return res.status(401).send({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Generate token
    console.log("🎫 Generating token...");
    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.expiresIn // 24 hours
    });

    // Update last login
    await User.update(
      { lastLoginAt: new Date() },
      { where: { id: user.id } }
    );

    console.log(`✅ User logged in successfully: ${user.email}`);
    console.log(`🖼️ Profile image URL: ${user.profileImageUrl}`);

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
        createdAt: user.createdAt
      },
      token: token
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).send({
      success: false,
      message: error.message || "Some error occurred during login."
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const userId = req.userId;

    console.log("🎫 Token verification for user ID:", userId);

    if (!userId) {
      return res.status(401).send({
        success: false,
        message: "No user ID in token"
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      console.log("❌ User not found during token verification");
      return res.status(404).send({
        success: false,
        message: "User not found"
      });
    }

    console.log("✅ Token verification - returning user:", {
      id: user.id,
      email: user.email,
      profileImageUrl: user.profileImageUrl
    });

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
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("❌ Token verification error:", error);
    res.status(500).send({
      success: false,
      message: error.message || "Error retrieving user."
    });
  }
};


module.exports = {
  signup: exports.signup,
  signin: exports.signin,
  verifyToken: exports.verifyToken
};