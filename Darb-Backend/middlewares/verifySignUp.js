// Add debug logging to your middlewares/verifySignUp.js

const db = require("../models");
const User = db.user;

checkDuplicateEmail = (req, res, next) => {
  // Check if email already exists
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(user => {
    
    if (user) {
      console.log("🔧 MIDDLEWARE: Email already exists, sending 400");
      res.status(400).send({
        message: "Failed! Email is already in use!"
      });
      return;
    }

    next();
  }).catch(error => {
    console.error("🔧 MIDDLEWARE: Database error:", error);
    res.status(500).send({
      message: "Database error checking email"
    });
  });
};

// Export the middleware functions
module.exports = {
  checkDuplicateEmail
};