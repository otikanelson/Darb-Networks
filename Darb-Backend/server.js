const express = require("express");
const cors = require("cors");
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Origin', 'Accept']
};

app.use(cors(corsOptions));

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/uploads', (req, res, next) => {
  console.log('🖼️ Static file request:', req.path);
  console.log('📁 Looking for file at:', path.join(__dirname, 'uploads', req.path));
  next();
});


app.get('/test-static', (req, res) => {
  const fs = require('fs');
  const uploadDir = path.join(__dirname, 'uploads', 'profiles');
  
  console.log('📁 Upload directory:', uploadDir);
  console.log('📂 Directory exists:', fs.existsSync(uploadDir));
  
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir);
    console.log('📄 Files in directory:', files);
    res.json({
      directory: uploadDir,
      exists: true,
      files: files
    });
  } else {
    res.json({
      directory: uploadDir,
      exists: false,
      files: []
    });
  }
});

require('./routes/user.routes')(app);

// Database
const db = require("./models");

// Log database configuration
console.log("Database configuration:", {
  host: db.sequelize.config.host,
  database: db.sequelize.config.database,
  username: db.sequelize.config.username,
  // Don't log the password for security reasons
  dialect: db.sequelize.options.dialect
});

// Test database connection
db.sequelize.authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    
    // In development, you might want to sync the database (this will recreate tables)
    db.sequelize.sync()
      .then(() => {
        console.log("Database synchronized successfully");
      })
      .catch(err => {
        console.error("Failed to synchronize the database:", err);
      });
  })
  .catch(err => {
    console.error("Unable to connect to the database:", err);
  });

  // Simple route
  app.get("/", (req, res) => {
    res.json({ message: "Welcome to Darb Network API." });
  });



// Routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/passwordReset.routes')(app);
require('./routes/campaign.routes')(app);
require('./routes/admin.routes')(app);
require('./routes/investment.routes')(app);


// Set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
}); 