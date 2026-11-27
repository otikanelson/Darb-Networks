# Deployment to Vercel Guide

## Overview
This guide walks through deploying both backend and frontend to Vercel with Firebase authentication.

---

## Prerequisites

- [ ] GitHub account with code pushed
- [ ] Vercel account
- [ ] Firebase project (darb-61805) created
- [ ] MySQL database ready (or use Vercel Postgres)
- [ ] All environment variables prepared

---

## Step 1: Prepare Credentials

### Get Firebase Base64-Encoded Credentials

For backend deployment, you need Base64-encoded Firebase service account:

**Windows PowerShell:**
```powershell
$json = Get-Content 'backend/darb-61805-firebase-adminsdk-fbsvc-e4b77cf671.json' -Raw
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($json))
```

**Linux/Mac:**
```bash
cat backend/darb-61805-firebase-adminsdk-fbsvc-e4b77cf671.json | base64
```

Copy the entire Base64 string - you'll need it for Vercel.

### Collect All Required Variables

**Backend Variables:**
- `FIREBASE_CREDENTIALS_BASE64` (Base64-encoded service account)
- `DB_HOST` (your MySQL host)
- `DB_USER` (database user)
- `DB_PASSWORD` (database password)
- `DB_NAME` (database name, e.g., darb_network)
- `PORT` (should be 3000 for Vercel)
- `NODE_ENV` (set to production)
- `VERCEL` (set to true)
- `ALLOWED_ORIGINS` (frontend URL)
- `RECAPTCHA_SECRET_KEY` (from Google reCAPTCHA)
- `SMTP_USER`, `SMTP_PASSWORD` (email credentials)
- `CLOUDINARY_*` (image upload credentials)

**Frontend Variables:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_API_BASE_URL` (backend Vercel URL)

---

## Step 2: Deploy Backend to Vercel

### 2.1 Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Select your GitHub repository (Darb-Networks)
4. Click "Import"

### 2.2 Configure Backend Project
1. **Framework Preset:** Select "Other" or "Node.js"
2. **Root Directory:** Set to `backend`
3. **Build Command:** Leave default or use `npm run build`
4. **Output Directory:** `.` (current directory)
5. **Install Command:** `npm install`

### 2.3 Add Environment Variables
In Vercel Project Settings > Environment Variables, add:

```
FIREBASE_CREDENTIALS_BASE64=eyJwcm9qZWN0X2lkIjogImRhcmItNjE4MDUiLCAi...
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=darb_network
DB_POOL=10
PORT=3000
NODE_ENV=production
VERCEL=true
ALLOWED_ORIGINS=https://your-frontend-vercel-url.vercel.app,https://darbnetwork.com
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Copy the deployment URL (e.g., https://darb-backend.vercel.app)
4. Test backend: `https://your-backend-url/api/campaigns`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Frontend Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Select the same GitHub repository
4. Configure for frontend

### 3.2 Configure Frontend Project
1. **Framework Preset:** Select "Vite"
2. **Root Directory:** Set to `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### 3.3 Add Environment Variables
In Vercel Project Settings > Environment Variables, add:

```
VITE_FIREBASE_API_KEY=AIzaSyC7E1W_T7vZ9kL2m9N3o5P6q8R9s0T1u2V
VITE_FIREBASE_AUTH_DOMAIN=darb-61805.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=darb-61805
VITE_FIREBASE_STORAGE_BUCKET=darb-61805.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
VITE_API_BASE_URL=https://your-backend-vercel-url.vercel.app/api
```

**Important:** Replace `your-backend-vercel-url` with actual backend URL from Step 2!

### 3.4 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test frontend: Visit the deployment URL

---

## Step 4: Test Production Deployment

### Test Registration
1. Go to your frontend Vercel URL
2. Click Register
3. Fill in form:
   - Email: `test@example.com`
   - Password: `TestPassword123!` (must be strong)
   - Full Name: `Test User`
   - User Type: Select one
4. Click Register
5. Should redirect to dashboard
6. Check [Firebase Console](https://console.firebase.google.com/) for new user

### Test Login
1. Go to login page
2. Enter credentials from registration
3. Should redirect to dashboard
4. Dashboard should show campaigns

### Test Campaign View
1. Click on any campaign
2. Campaign details should load
3. View should be tracked in database

### Test Logout
1. Click logout in navbar
2. Should redirect to home
3. Try accessing dashboard - should redirect to login

---

## Step 5: Update Backend ALLOWED_ORIGINS

After frontend deployment, update backend:

1. Go to Vercel > Backend Project > Settings > Environment Variables
2. Update `ALLOWED_ORIGINS`:
   ```
   https://your-frontend-vercel-url.vercel.app,https://darbnetwork.com
   ```
3. Redeploy backend

---

## Step 6: Configure Custom Domains (Optional)

### Add Backend Custom Domain
1. Backend project > Settings > Domains
2. Add `api.darbnetwork.com`
3. Add DNS records as shown by Vercel

### Add Frontend Custom Domain
1. Frontend project > Settings > Domains
2. Add `darbnetwork.com` or `www.darbnetwork.com`
3. Add DNS records as shown by Vercel

---

## Troubleshooting

### "Cannot find module 'firebase-admin'"
- Backend missing firebase-admin
- Check `backend/package.json` has firebase-admin
- Run `npm install` in backend

### "Firebase not initialized"
- Backend missing `FIREBASE_CREDENTIALS_BASE64`
- Check Vercel env vars
- Redeploy after adding env var

### "Cannot find Firebase credentials"
- Base64 encoding might be wrong
- Try encoding again
- Verify JSON file is valid

### "Database connection failed"
- Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` are correct
- Verify database is accessible from Vercel
- Check firewall rules

### "CORS errors"
- Frontend URL not in `ALLOWED_ORIGINS`
- Update backend env var and redeploy
- Check frontend URL matches exactly

### "Cannot GET /api/campaigns"
- Backend routes not registered
- Check backend is running
- Look at Vercel logs for errors

### "503 Service Unavailable"
- Backend not initialized
- Check logs for Firebase errors
- Verify all env vars are set

---

## Monitoring

### Check Vercel Logs
1. Go to Vercel > Project
2. Click "Deployments"
3. Click latest deployment
4. Go to "Logs" tab
5. Look for errors

### Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select darb-61805 project
3. Go to Authentication > Users
4. Verify new users appear after registration

### Check Database
1. Connect to your MySQL database
2. Query `SELECT * FROM users;`
3. Verify user profiles created with `firebase_uid`

---

## Rollback Plan

If deployment fails:
1. Backend: Go to Deployments > select previous version > click "Redeploy"
2. Frontend: Same process

---

## Post-Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Firebase credentials configured
- [ ] Database accessible from Vercel
- [ ] Can register new user
- [ ] User appears in Firebase Console
- [ ] User profile appears in MySQL
- [ ] Can login with credentials
- [ ] Dashboard loads and shows campaigns
- [ ] Campaign views tracked
- [ ] Can logout
- [ ] No 503 errors
- [ ] No CORS errors
- [ ] Custom domains configured (optional)

---

## Success Indicators

✅ Registration works with Firebase
✅ User appears in Firebase Console
✅ User profile appears in MySQL
✅ Login works with Firebase token
✅ Dashboard loads campaigns
✅ Campaign views tracked
✅ Logout clears authentication
✅ No authentication errors
✅ Production URL accessible

---

## Support

If issues occur:
1. Check Vercel deployment logs
2. Check Firebase Console
3. Check database connection
4. Review env variables
5. Check ALLOWED_ORIGINS
6. Review error messages carefully

---

## Next Steps After Deployment

1. **Monitor for issues** - Check logs daily
2. **Test all flows** - Register, login, campaigns, logout
3. **Gather feedback** - From users
4. **Plan enhancements** - Password reset, two-factor auth, etc.
5. **Monitor performance** - Check response times

---

**Deployment Guide Complete**
Good luck with your production deployment!
