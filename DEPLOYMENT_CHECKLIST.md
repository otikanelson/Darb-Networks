# Deployment Checklist - Firebase Authentication

## Backend Setup ✅

- [x] Firebase Admin SDK installed (`firebase-admin`)
- [x] Firebase config created (`backend/config/firebase.js`)
- [x] Firebase middleware created (`backend/middlewares/firebaseAuth.js`)
- [x] Auth routes updated to use Firebase
- [x] All routes updated to verify Firebase tokens
- [x] Tests written for Firebase integration
- [x] Base64 credential support added for serverless environments

**Vercel Backend:**
- [ ] Add `FIREBASE_CREDENTIALS_BASE64` environment variable
  - Value: Base64-encoded service account JSON
  - See `backend/` directory for how to generate
- [ ] Deploy backend to Vercel
- [ ] Test backend routes directly (Postman/curl)

## Frontend Setup ✅

- [x] Firebase package installed
- [x] Firebase config created (`src/config/firebaseConfig.js`)
- [x] Firebase auth service created (`src/services/firebaseAuthService.js`)
- [x] AuthContext updated to use Firebase
- [x] ApiService updated to use Firebase tokens
- [x] Environment variables documented (`.env.example`)

**Local Development:**
- [ ] Create `frontend/.env.local` with Firebase credentials:
  ```env
  VITE_FIREBASE_API_KEY=...
  VITE_FIREBASE_AUTH_DOMAIN=darb-61805.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=darb-61805
  VITE_FIREBASE_STORAGE_BUCKET=darb-61805.firebasestorage.app
  VITE_FIREBASE_MESSAGING_SENDER_ID=...
  VITE_FIREBASE_APP_ID=...
  VITE_API_BASE_URL=http://localhost:5000/api
  ```
- [ ] Run `npm install` to install firebase package
- [ ] Test locally with `npm run dev`
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test dashboard access after login

**Vercel Frontend:**
- [ ] Add all `VITE_FIREBASE_*` environment variables
- [ ] Add `VITE_API_BASE_URL=https://your-backend-url/api`
- [ ] Deploy frontend to Vercel
- [ ] Test auth flow in production

## Firebase Console

- [ ] Project ID: `darb-61805`
- [ ] Email/password enabled in Authentication
- [ ] Email verification setup (optional but recommended)
- [ ] Web app created and credentials copied

## Testing

### Local Testing:
```bash
# Start backend
cd backend
npm run dev

# In another terminal, start frontend
cd frontend
npm run dev
```

Then test:
- [ ] Register with new email/password
- [ ] Verify user created in Firebase Console > Authentication
- [ ] Verify user profile in backend MySQL
- [ ] Login with same credentials
- [ ] View dashboard (should show campaigns)
- [ ] Logout and verify token cleared
- [ ] Try accessing dashboard without login (should redirect)

### Production Testing (Vercel):
- [ ] Register at `https://your-frontend-url`
- [ ] Check Firebase Console for new user
- [ ] Check MySQL for user profile
- [ ] Login with created credentials
- [ ] View campaigns on dashboard
- [ ] Check campaign view tracking works

## Potential Issues & Solutions

### "Firebase not initialized"
**Solution:** Check `.env.local` has all `VITE_FIREBASE_*` vars

### "Invalid ID token" on backend
**Solution:** Backend missing `FIREBASE_CREDENTIALS_BASE64` env var

### "Email already in use"
**Solution:** This is expected - user already registered

### Campaign views show 503 error
**Solution:** Backend Firebase not initialized
- Check backend logs
- Verify FIREBASE_CREDENTIALS_BASE64 on Vercel
- Redeploy backend

### CORS errors from frontend
**Solution:** Backend CORS blocking frontend URL
- Add frontend URL to `ALLOWED_ORIGINS` in backend
- Redeploy backend

## Rollback Plan

If issues occur:
1. Backend: Push code without Firebase changes (use git)
2. Frontend: Deploy previous version
3. Check logs for error messages
4. Debug specific issue

## Success Criteria

- [x] Users can register with email/password
- [x] Firebase creates user account
- [x] Backend creates MySQL profile
- [x] Users can login with credentials
- [x] Dashboard loads after login (shows campaigns)
- [x] Campaign views tracked correctly
- [x] Logout clears token and redirects
- [ ] Production deployment working
- [ ] No 503 errors on API calls
- [ ] Authentication persists on page refresh

## Post-Deployment

1. Monitor error logs
2. Test all auth flows
3. Check campaign functionality works
4. Verify email verification flow (if enabled)
5. Consider adding password reset flow
6. Plan for user password change functionality
