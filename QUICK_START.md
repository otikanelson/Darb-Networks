# Quick Start Guide - Firebase Authentication

## 60-Second Setup

### 1. Get Firebase Credentials (5 min)
```
1. Go to https://console.firebase.google.com/
2. Select project: darb-61805
3. Click Settings (gear) > Project Settings
4. Find Web app config and copy values
```

### 2. Create `.env.local` (1 min)
**Frontend** - `frontend/.env.local`:
```env
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=darb-61805.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darb-61805
VITE_FIREBASE_STORAGE_BUCKET=darb-61805.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend** - `backend/.env`:
```env
FIREBASE_PROJECT_ID=darb-61805
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@darb-61805.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=darb_network
PORT=5000
```

### 3. Start Backend (1 min)
```bash
cd backend
npm run dev
```
✅ Should start on http://localhost:5000

### 4. Start Frontend (1 min)
```bash
cd frontend
npm install  # First time only
npm run dev
```
✅ Should start on http://localhost:5173

### 5. Test (10 min)
1. Go to http://localhost:5173
2. Click Register
3. Fill form with:
   - Email: `test@example.com`
   - Password: `TestPassword123!` (must be strong)
   - Full Name: `Test User`
4. Click Register
5. Should redirect to dashboard
6. Click Campaign to view
7. Logout and try login

---

## Command Reference

```bash
# Backend
cd backend
npm run dev              # Start dev server
npm test               # Run tests
npm run start          # Start production

# Frontend  
cd frontend
npm run dev            # Start dev server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Check code style
npm run lint:fix       # Fix code style
```

---

## File Locations

| File | Purpose |
|------|---------|
| `frontend/src/config/firebaseConfig.js` | Firebase initialization |
| `frontend/src/services/firebaseAuthService.js` | Auth methods |
| `frontend/src/context/AuthContext.jsx` | Auth provider |
| `backend/config/firebase.js` | Backend Firebase setup |
| `backend/middlewares/firebaseAuth.js` | Token verification |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Firebase not initialized" | Check `.env.local` exists and has all variables. Restart dev server. |
| "Invalid ID token" | Backend needs Firebase credentials in `.env` or Vercel env vars |
| Cannot register | Check both backend and frontend are running |
| 503 errors on API | Backend not initialized. Check logs. |
| Dashboard empty | Make sure you're logged in. Try refreshing. |

---

## Documentation

- **Setup Details**: `frontend/FIREBASE_SETUP.md`
- **Implementation Status**: `FIREBASE_STATUS.md`
- **Deployment Guide**: `DEPLOYMENT_CHECKLIST.md`
- **Environment Variables**: `ENV_VARIABLES_GUIDE.md`

---

## What's New

✅ Users register with Firebase (email/password)
✅ Users login with Firebase credentials
✅ Dashboard shows campaigns for authenticated users
✅ Campaign views tracked in database
✅ All API calls use Firebase tokens
✅ Email verification controls access to campaigns

---

## Success = 

✅ Can register
✅ Can login
✅ Dashboard loads
✅ Campaigns visible
✅ Can logout

---

## Next

After local testing works:
1. Add env vars to Vercel
2. Deploy backend to Vercel
3. Deploy frontend to Vercel
4. Test production URLs

**Questions?** Check documentation in root directory.
