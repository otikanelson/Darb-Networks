# Frontend Firebase Setup - Next Steps

## What Was Done ✅

The frontend is now **fully configured** for Firebase authentication:

1. ✅ Firebase package installed
2. ✅ Firebase config created
3. ✅ Firebase auth service created with:
   - User registration
   - User login
   - Logout
   - Token verification
   - Profile management
4. ✅ AuthContext updated to use Firebase
5. ✅ API service updated to send Firebase tokens
6. ✅ Login/Register pages already compatible (no changes needed)
7. ✅ Documentation created

## What You Need to Do

### Step 1: Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project **darb-61805**
3. Click Settings (gear icon) > Project Settings
4. Find your Web app and copy the config:
```javascript
{
  apiKey: "YOUR_API_KEY",
  authDomain: "darb-61805.firebaseapp.com",
  projectId: "darb-61805",
  storageBucket: "darb-61805.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
}
```

### Step 2: Create `.env.local` File
In `frontend/` directory, create `.env.local`:
```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=darb-61805.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darb-61805
VITE_FIREBASE_STORAGE_BUCKET=darb-61805.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 3: Test Locally

**Start Backend:**
```bash
cd backend
npm run dev
# Should start on http://localhost:5000
```

**In another terminal, start Frontend:**
```bash
cd frontend
npm install  # If not done already
npm run dev
# Should start on http://localhost:5173
```

**Test Registration:**
1. Go to http://localhost:5173/register
2. Fill in form with:
   - Email: `test@example.com`
   - Password: `TestPassword123!` (must meet strength requirements)
   - Full Name: `Test User`
   - User Type: Select one
3. Click Register
4. Should see success message
5. Check Firebase Console > Authentication > Users (should see new user)
6. Check backend MySQL (should see user profile)

**Test Login:**
1. Go to http://localhost:5173/login
2. Enter email and password
3. Should redirect to dashboard
4. Dashboard should load campaigns

**Test Logout:**
1. Click logout in navbar
2. Should redirect to home
3. Try accessing dashboard directly - should redirect to login

### Step 4: Fix Any Issues

If you get errors:

**"Firebase not initialized"**
- Check `.env.local` exists and has all variables
- Restart dev server after creating `.env.local`

**"Invalid ID token"**
- Backend issue (not frontend)
- Backend needs `FIREBASE_CREDENTIALS_BASE64` env var
- Check backend logs for Firebase errors

**"Email already in use"**
- User already registered
- Try different email or delete user from Firebase Console

**Dashboard shows 503 errors**
- Backend Firebase issue
- Check backend logs
- Make sure backend has Firebase credentials configured

### Step 5: Deploy to Vercel

**Frontend:**
1. Push code to GitHub (someone will push backend)
2. Vercel auto-deploys
3. Add environment variables in Vercel project settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_API_BASE_URL=https://your-backend-url/api` (once backend is deployed)

**Backend:**
1. Add `FIREBASE_CREDENTIALS_BASE64` to Vercel env vars
2. Deploy to Vercel
3. Test API endpoints with Postman

## File Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── firebaseConfig.js          ← NEW: Firebase initialization
│   ├── services/
│   │   ├── firebaseAuthService.js     ← NEW: Firebase auth methods
│   │   └── apiService.js              ← MODIFIED: Updated token handling
│   ├── context/
│   │   └── AuthContext.jsx            ← MODIFIED: Switched to Firebase
│   ├── pages/
│   │   ├── Login.jsx                  ← No changes needed
│   │   └── Register.jsx               ← No changes needed
│   └── ...
├── .env.example                        ← NEW: Example env vars
└── FIREBASE_SETUP.md                   ← NEW: Setup guide
```

## Key Changes Summary

### How Authentication Works Now

**Before:** JWT tokens stored locally, no Firebase
**After:** Firebase tokens + MySQL profiles

**Registration Flow:**
1. User enters email, password, profile info
2. Frontend creates user in Firebase (email/password)
3. Firebase returns ID token
4. Frontend sends token + profile to backend
5. Backend verifies token with Firebase Admin SDK
6. Backend creates MySQL user profile
7. Frontend stores token locally
8. User redirected to dashboard

**Login Flow:**
1. User enters email, password
2. Frontend authenticates with Firebase
3. Firebase returns ID token
4. Frontend sends token to backend
5. Backend returns MySQL user profile
6. Frontend stores token and profile
7. User redirected to dashboard

**API Calls:**
- All requests include `Authorization: Bearer <firebase_token>` header
- Backend middleware verifies token before allowing access
- If token invalid/expired, returns 401 Unauthorized

## Troubleshooting Quick Links

1. **Firebase Setup Guide:** `frontend/FIREBASE_SETUP.md`
2. **Implementation Details:** `FRONTEND_FIREBASE_IMPLEMENTATION.md`
3. **Deployment Checklist:** `DEPLOYMENT_CHECKLIST.md`
4. **Backend Firebase Setup:** `backend/FIREBASE_SETUP_CHECKLIST.md`

## Questions?

Check these files for detailed info:
- `frontend/FIREBASE_SETUP.md` - Complete setup guide
- `frontend/src/services/firebaseAuthService.js` - Method documentation
- `frontend/src/config/firebaseConfig.js` - Firebase config
- Backend `FIREBASE_MIGRATION_COMPLETE.md` - Backend implementation

## Success Indicators

✅ Users can register
✅ Users can login
✅ Dashboard shows campaigns after login
✅ Campaign views are tracked
✅ Logout works
✅ No 503 errors on API calls
✅ Token persists on page refresh
