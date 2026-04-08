const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'darb_network_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Sample YouTube video IDs (tech/startup related)
const youtubeVideos = [
  'dQw4w9WgXcQ', 'jNQXAC9IVRw', 'ScMzIvxBSi4', 'kJQP7kiw5Fk',
  '9bZkp7q19f0', 'CevxZvSJLk8', 'y8Kyi0WNg40', 'L_jWHffIx5E',
  'fJ9rUzIMcZQ', 'GC-VM5rOKWs', 'Ks-_Mh1QhMc', 'UxxajLWwzqY',
  'ALZHF5UqnU4', 'hTWKbfoikeg', 'uelHwf8o7_U', 'e-ORhEE9VVg',
  'tmY-G6sngk8', 'ZXsQAXx_ao0', 'Ahg6qcgoay4', 'CQ_fc3LRu'
];

// Unsplash image collections for different categories
const imageCollections = {
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b'
  ],
  healthcare: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
    'https://images.unsplash.com/photo-1