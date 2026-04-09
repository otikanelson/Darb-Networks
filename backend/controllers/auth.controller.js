const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  try {
    const { email, password, fullName, userType } = req.body;

    if (!email || !password || !fullName || !userType) {
      return res.status(400).send({ success: false, message: "Email, password, full name, and user type are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).send({ success: false, message: "Email is already in use" });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const user = await User.create({
      email, password: hashedPassword, fullName, userType,
      companyName: req.body.companyName || null,
      phoneNumber: req.body.phoneNumber || null,
      address: req.body.address || null,
      bvn: req.body.bvn || null,
      nin: req.body.nin || null,
      cacNumber: req.body.cacNumber || null,
      accountNumber: req.body.accountNumber || null,
      bankName: req.body.bankName || null,
      isActive: true,
      isVerified: false
    });

    const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: config.expiresIn });

    res.status(201).send({
      success: true,
      message: "User registered successfully!",
      data: {
        id: user.id, email: user.email, fullName: user.fullName,
        userType: user.userType, companyName: user.companyName,
        isActive: user.isActive, isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message || "Some error occurred during registration." });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).send({ success: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).send({ success: false, message: "Account is inactive. Please contact support." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, config.secret, { expiresIn: config.expiresIn });

    await User.update({ lastLoginAt: new Date() }, { where: { id: user.id } });

    res.status(200).send({
      success: true,
      message: "Login successful",
      data: {
        id: user.id, email: user.email, fullName: user.fullName,
        userType: user.userType, companyName: user.companyName,
        phoneNumber: user.phoneNumber, address: user.address,
        profileImageUrl: user.profileImageUrl, isActive: user.isActive,
        isVerified: user.isVerified, createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message || "Some error occurred during login." });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).send({ success: false, message: "No user ID in token" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    res.status(200).send({
      success: true,
      data: {
        id: user.id, email: user.email, fullName: user.fullName,
        userType: user.userType, companyName: user.companyName,
        phoneNumber: user.phoneNumber, address: user.address,
        profileImageUrl: user.profileImageUrl, isActive: user.isActive,
        isVerified: user.isVerified, createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message || "Error retrieving user." });
  }
};

module.exports = {
  signup: exports.signup,
  signin: exports.signin,
  verifyToken: exports.verifyToken
};
