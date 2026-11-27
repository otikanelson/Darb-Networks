# Firebase Frontend Setup Guide

## Overview
The frontend now uses Firebase Authentication (email/password) for user registration and login. Firebase credentials are configured via environment variables.

## Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **darb-61805**
3. Click **Settings** (gear icon) > **Project Settings**
4. Go to the **Your apps** section
5. Find or create a **Web** app
6. Copy the config object that looks like:
```javascript
{
  apiKey: "...",
  authDomain: "darb-61805.firebaseapp.com",
  projectId: "darb-61805",
  storageBucket: "darb-61805.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
}
```

## Step 2: Create `.env.local` file

In the `frontend/` directory, create a `.env.local` file (or `.env` for development):

```env
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=darb-61805.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darb-61805
VITE_FIREBASE_STORAGE_BUCKET=darb-61805.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend API
VITE_API_BASE_URL=http://localhost:5000/api
```

**Note:** Vite environment variables must start with `VITE_` to be exposed to the client.

## Step 3: Configure Backend Firebase Credentials on Vercel

Your backend also needs Firebase credentials to verify ID tokens.

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your Darb Networks project
3. Go to **Settings** > **Environment Variables**
4. Add: `FIREBASE_CREDENTIALS_BASE64`
   - Use the Base64-encoded credentials from your backend setup
   - See backend Firebase setup guide for how to generate this

## How It Works

### Registration Flow:
1. User enters email, password, and profile info
2. Frontend creates account in Firebase (email/password)
3. Firebase returns ID token
4. Frontend sends token + profile data to backend
5. Backend verifies token with Firebase Admin SDK
6. Backend creates MySQL user profile linked to Firebase UID
7. User is logged in locally with Firebase token

### Login Flow:
1. User enters email/password
2. Frontend authenticates with Firebase
3. Firebase returns ID token
4. Frontend sends token to backend
5. Backend verifies token and returns MySQL user profile
6. User is logged in with Firebase token

### Authentication:
- All API requests include Firebase ID token in `Authorization: Bearer <token>` header
- Backend middleware verifies token before allowing access
- If token expires, user is logged out automatically

## Testing

### Local Development:

```bash
cd frontend
npm install
npm run dev
```

Then visit `http://localhost:5173` and try:
1. **Register** - Create new account with Firebase
2. **Login** - Log in with email/password
3. **View Profile** - Check your user data
4. **Logout** - Sign out

### On Vercel:

1. Add `FIREBASE_CREDENTIALS_BASE64` env var to Vercel
2. Deploy frontend
3. Test registration/login at your Vercel URL

## Troubleshooting

### "Firebase not initialized"
- Check `.env.local` has all `VITE_FIREBASE_*` variables
- Make sure they match your Firebase project

### "Invalid ID token"
- Backend doesn't have Firebase credentials configured
- Check `FIREBASE_CREDENTIALS_BASE64` on Vercel
- Or local `backend/.env` for development

### "Email already in use"
- User already registered with that email
- Try logging in instead

### CORS errors
- Backend CORS is blocking frontend domain
- Check backend `server.js` CORS configuration
- Add your frontend URL to `ALLOWED_ORIGINS`

## Files Modified

- `frontend/src/config/firebaseConfig.js` - Firebase initialization
- `frontend/src/services/firebaseAuthService.js` - Authentication service
- `frontend/src/context/AuthContext.jsx` - Auth context provider
- `frontend/src/services/apiService.js` - Updated to use Firebase tokens
- `frontend/.env.example` - Example environment variables

## Next Steps

1. Create `.env.local` with Firebase credentials
2. Run `npm install` to ensure firebase package is installed
3. Test locally with `npm run dev`
4. Deploy to Vercel and add env vars there
5. Test production deployment
