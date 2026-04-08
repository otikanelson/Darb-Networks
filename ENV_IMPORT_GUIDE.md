# Environment Variables Import Guide

## 📋 Overview

You have 4 env files. 2 are for local development (already on your computer), and 2 need to be imported to Vercel.

---

## 🏠 LOCAL FILES (Already Set Up - No Action Needed)

### ✅ `backend/.env`
- **Purpose**: Local backend development
- **Action**: None - already configured
- **Note**: Backend will run on port 5001 locally

### ✅ `frontend/.env`
- **Purpose**: Local frontend development  
- **Action**: None - already configured
- **Note**: Points to localhost:5001 backend

---

## ☁️ VERCEL DEPLOYMENT (Action Required)

### 1️⃣ Backend Environment Variables

**Import to**: Vercel project `darb-networks-backend`

**How to import**:
1. Go to https://vercel.com/dashboard
2. Click on `darb-networks-backend` project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add Environment Variable"** for each variable below
5. Select all environments: ✅ Production ✅ Preview ✅ Development

**Variables to add** (from `backend/.env.production`):

```
DB_HOST=mysql-372a7e61-otikanelson29-ffb4.a.aivencloud.com
DB_PORT=25252
DB_USER=avnadmin
DB_PASSWORD=AVNS_i3gMw7Dh2un4SeZZeup
DB_NAME=defaultdb
NODE_ENV=production
JWT_SECRET=dab0fb4a067372e5e2de50617548cea614ab627ad09bfe3493d5867a425635eabaa7cb786353281017b6d920951807ca33d53eb5a5c1c26bce0956ce4955eb16
PAYSTACK_SECRET_KEY=sk_test_0e737eaf365875434c3d2da3cd908f8425ec85c3
PAYSTACK_PUBLIC_KEY=pk_test_62f4a7c53f40e5882a61d25f6c573edc45b07dc0
```

**Optional** (leave empty for now):
```
CLIENT_ORIGIN=
FRONTEND_URL=
EMAIL_USER=
EMAIL_PASS=
```

---

### 2️⃣ Frontend Environment Variables

**Import to**: Vercel project `darb-networks` (your frontend)

**How to import**:
1. Go to https://vercel.com/dashboard
2. Click on `darb-networks` project (frontend)
3. Go to **Settings** → **Environment Variables**
4. Click **"Add Environment Variable"** for each variable below
5. Select all environments: ✅ Production ✅ Preview ✅ Development

**Variables to add** (from `frontend/.env.production`):

```
VITE_API_URL=https://darb-networks-backend.vercel.app/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_62f4a7c53f40e5882a61d25f6c573edc45b07dc0
```

---

## 🚀 After Importing

### Step 1: Redeploy Backend
1. Go to `darb-networks-backend` project
2. Click **Deployments** tab
3. Click **⋮** (three dots) on latest deployment
4. Click **"Redeploy"**
5. Wait for deployment to complete

### Step 2: Redeploy Frontend
1. Go to `darb-networks` project
2. Click **Deployments** tab
3. Click **⋮** (three dots) on latest deployment
4. Click **"Redeploy"**
5. Wait for deployment to complete

### Step 3: Test Your App
1. Open your frontend URL: `https://darb-networks-xxx.vercel.app`
2. Go to Dashboard page
3. Campaigns should load without 404 errors! 🎉

---

## 🔍 Verification

Test these backend endpoints:
- ✅ Health: https://darb-networks-backend.vercel.app/health
- ✅ DB Status: https://darb-networks-backend.vercel.app/api/db-status
- ✅ Campaigns: https://darb-networks-backend.vercel.app/api/campaigns

All should return 200 OK (not 404)!

---

## 📝 Summary

| File | Location | Action |
|------|----------|--------|
| `backend/.env` | Local only | ✅ Already set up |
| `frontend/.env` | Local only | ✅ Already set up |
| `backend/.env.production` | → Vercel Backend | ⚠️ Import manually |
| `frontend/.env.production` | → Vercel Frontend | ⚠️ Import manually |

---

## ⚠️ Important Notes

1. **Never commit .env files to git** - they're in `.gitignore`
2. **Backend has 10 variables** - frontend has only 2
3. **Must redeploy** after adding environment variables
4. **Test endpoints** after deployment to verify

---

## 🆘 Troubleshooting

### Backend still returns 404
- Check all 10 environment variables are added
- Verify DB_PASSWORD is correct
- Check Vercel function logs for errors
- Redeploy after adding variables

### Frontend can't connect to backend
- Verify VITE_API_URL points to correct backend URL
- Check backend is deployed and running
- Test backend health endpoint first

### Database connection errors
- Verify all DB_* variables are correct
- Check Aiven database is running
- Test connection with `/api/db-status` endpoint

---

**Ready?** Start with Step 1️⃣ (Backend) above! 🚀
