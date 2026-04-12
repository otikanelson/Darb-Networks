require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('Testing Cloudinary Configuration...\n');

console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET (hidden)' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET (hidden)' : 'NOT SET');

const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

console.log('\nConfiguration Status:', cloudinaryConfigured ? '✅ CONFIGURED' : '❌ NOT CONFIGURED');

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  console.log('\nCloudinary Config Object:');
  console.log('cloud_name:', cloudinary.config().cloud_name);
  console.log('api_key:', cloudinary.config().api_key ? 'SET' : 'NOT SET');
  
  console.log('\n✅ Cloudinary is properly configured!');
  console.log('You can now upload images to your Cloudinary account.');
} else {
  console.log('\n❌ Cloudinary is NOT configured!');
  console.log('Please check your .env file and ensure all three variables are set.');
}
