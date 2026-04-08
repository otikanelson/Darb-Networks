const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Comprehensive campaign data with 25+ campaigns
const campaigns = [
  {
    title: "EcoCharge - Solar Power Revolution",
    description: "<h2>Transforming Energy Access in Nigeria</h2><p>EcoCharge is pioneering affordable solar power solutions for Nigerian homes and businesses. Our innovative solar panels are 40% more efficient than traditional models.</p>",
    category: "Clean Energy",
    location: "Lagos, Nigeria",
    target_amount: 50000000,
    minimum_investment: 100000,
    problem_statement: "<h3>The Energy Crisis</h3><p>Over 85 million Nigerians lack access to reliable electricity. Power outages cost businesses billions annually.</p>",
    solution: "<h3>Our Solution</h