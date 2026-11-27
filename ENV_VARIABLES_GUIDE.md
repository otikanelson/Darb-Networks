# Environment Variables Guide

## Overview
Firebase credentials are configured via environment variables for security. Never commit `.env` files or secrets to git.

---

## Backend Variables

### Local Development: `backend/.env`

Create this file in `backend/` directory:

```env
# MySQL Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=darb_network
DB_POOL=10

# Firebase Credentials (Option 1: Individual variables)
FIREBASE_PROJECT_ID=darb-61805
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@darb-61805.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# OR Option 2: Base64-encoded credentials (for Vercel)
# FIREBASE_CREDENTIALS_BASE64=eyJwcm9qZWN0X2lkIjogImRhcmItNjE4MDUiLCAi...

# Server Configuration
PORT=5000
NODE_ENV=development
VERCEL=false

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Captcha
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Email (Nodemailer)
EMAIL_FROM=noreply@darbnetwork.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Cloudinary (Image uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Vercel Production: Environment Variables

Go to Vercel > Project Settings > Environment Variables and add:

```env
# Firebase (Base64-encoded service account)
FIREBASE_CREDENTIALS_BASE64=eyJwcm9qZWN0X2lkIjogImRhcmItNjE4MDUiLCAi...

# Database
DB_HOST=your_mysql_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=darb_network
DB_POOL=10

# Server
PORT=3000
NODE_ENV=production
VERCEL=true

# CORS
ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,https://darbnetwork.com

# Other services...
RECAPTCHA_SECRET_KEY=...
SMTP_USER=...
SMTP_PASSWORD=...
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Note:** Use `FIREBASE_CREDENTIALS_BASE64` for Vercel (serverless environment)

---

## Frontend Variables

### Local Development: `frontend/.env.local`

Create this file in `frontend/` directory:

```env
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSyC7E1W_...
VITE_FIREBASE_AUTH_DOMAIN=darb-61805.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darb-61805
VITE_FIREBASE_STORAGE_BUCKET=darb-61805.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789

# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000

# Optional: Enable debug logging
VITE_DEBUG=false
```

**Important:** Vite requires `VITE_` prefix for client-side variables!

### Vercel Production: Environment Variables

Go to Vercel > Project Settings > Environment Variables and add:

```env
# Firebase (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSyC7E1W_...
VITE_FIREBASE_AUTH_DOMAIN=darb-61805.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darb-61805
VITE_FIREBASE_STORAGE_BUCKET=darb-61805.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789

# API Configuration
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
VITE_API_TIMEOUT=30000
```

**Note:** Use your actual backend Vercel URL!

---

## Getting Firebase Credentials

### For Local Development:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project **darb-61805**
3. Click Settings (gear icon) > Project Settings

#### For Backend (Server):
1. Go to **Service Accounts** tab
2. Download JSON key (or use existing one)
3. Use credentials from JSON file:
   ```json
   {
     "project_id": "darb-61805",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-fbsvc@darb-61805.iam.gserviceaccount.com",
     ...
   }
   ```

#### For Frontend (Client):
1. Click **Your apps** section
2. Find your **Web** app
3. Copy the config:
   ```javascript
   {
     apiKey: "AIzaSyC7E1W_...",
     authDomain: "darb-61805.firebaseapp.com",
     projectId: "darb-61805",
     storageBucket: "darb-61805.firebasestorage.app",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456ghi789"
   }
   ```

---

## Converting Service Account to Base64 (For Vercel Backend)

```bash
# On Linux/Mac:
cat backend/darb-61805-firebase-adminsdk-fbsvc-e4b77cf671.json | base64

# On Windows PowerShell:
$json = Get-Content 'path/to/service-account.json' -Raw
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))
```

Then use this Base64 string as `FIREBASE_CREDENTIALS_BASE64` env var on Vercel.

---

## Environment Variable Checklist

### Backend - Local
- [ ] DB_HOST
- [ ] DB_USER
- [ ] DB_PASSWORD
- [ ] DB_NAME
- [ ] FIREBASE_PROJECT_ID
- [ ] FIREBASE_CLIENT_EMAIL
- [ ] FIREBASE_PRIVATE_KEY
- [ ] PORT
- [ ] NODE_ENV=development
- [ ] ALLOWED_ORIGINS

### Backend - Vercel
- [ ] FIREBASE_CREDENTIALS_BASE64
- [ ] DB_HOST
- [ ] DB_USER
- [ ] DB_PASSWORD
- [ ] DB_NAME
- [ ] ALLOWED_ORIGINS (include frontend URL)
- [ ] RECAPTCHA_SECRET_KEY
- [ ] SMTP credentials
- [ ] Cloudinary credentials

### Frontend - Local
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID
- [ ] VITE_API_BASE_URL=http://localhost:5000/api

### Frontend - Vercel
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID
- [ ] VITE_API_BASE_URL=https://your-backend-url/api

---

## Security Notes

### Never commit:
- `.env` files
- `.env.local` files
- Service account JSON files
- Private keys
- Database passwords
- API secrets

### Store in .gitignore:
```
.env
.env.local
.env.*.local
backend/.env
frontend/.env.local
*.json (service accounts)
```

### Safe to commit:
- `.env.example` (without actual values)
- `env.sample.md` (documentation only)

---

## Troubleshooting

### "Cannot find module 'firebase'"
- Run `npm install firebase` in frontend directory

### "Firebase not initialized"
- Check `.env.local` exists and has all variables
- Restart dev server after creating `.env.local`

### "Invalid VITE_ variable"
- Vite variables must start with `VITE_`
- Restart dev server after changing `.env.local`

### "Cannot find FIREBASE_CREDENTIALS_BASE64"
- Vercel backend needs Base64-encoded credentials
- Add to Vercel project settings

### "Invalid credentials"
- Check Base64 encoding is correct
- Verify service account JSON is valid
- Check all fields are present

---

## Example .env Files

### backend/.env.example
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=darb_network

# Firebase
FIREBASE_PROJECT_ID=darb-61805
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@darb-61805.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n

# Server
PORT=5000
NODE_ENV=development
```

### frontend/.env.example
```env
# Firebase
VITE_FIREBASE_API_KEY=AIzaSyC7E1W_...
VITE_FIREBASE_AUTH_DOMAIN=darb-61805.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darb-61805
VITE_FIREBASE_STORAGE_BUCKET=darb-61805.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789

# API
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Need Help?

Refer to:
- Backend guide: `backend/FIREBASE_SETUP_CHECKLIST.md`
- Frontend guide: `frontend/FIREBASE_SETUP.md`
- Deployment checklist: `DEPLOYMENT_CHECKLIST.md`
