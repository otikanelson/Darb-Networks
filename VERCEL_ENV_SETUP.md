# Vercel Environment Variables Setup Guide

## Required Environment Variables for Backend

You need to add these environment variables to your Vercel backend project:

### Database Configuration (Required)
```
DB_HOST=your-database-host.railway.app
DB_PORT=3306
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=railway
```

### Application Configuration (Required)
```
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-key-here
```

### Frontend/CORS Configuration (Required)
```
CLIENT_ORIGIN=https://darb-networks-eculloaju-obikanelsons-projects.vercel.app
FRONTEND_URL=https://darb-networks-eculloaju-obikanelsons-projects.vercel.app
```

### Payment Configuration (Required for payments)
```
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### Email Configuration (Optional - for password reset)
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## How to Add Environment Variables in Vercel

### Step 1: Access Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your backend project: `darb-networks-backend`
3. Click on "Settings" tab
4. Click on "Environment Variables" in the left sidebar

### Step 2: Add Each Variable
For each variable above:
1. Click "Add Environment Variable" button
2. Enter the variable name (e.g., `DB_HOST`)
3. Enter the value
4. Select which environments to apply to:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click "Save"

### Step 3: Get Your Database Credentials

From your Railway dashboard (shown in your screenshot):
1. Go to your Railway project
2. Click on your MySQL database
3. Go to "Variables" or "Connect" tab
4. Copy these values:
   - `MYSQLHOST` → Use as `DB_HOST`
   - `MYSQLPORT` → Use as `DB_PORT` (usually 3306)
   - `MYSQLUSER` → Use as `DB_USER`
   - `MYSQLPASSWORD` → Use as `DB_PASSWORD`
   - `MYSQLDATABASE` → Use as `DB_NAME`

### Step 4: Generate JWT Secret
Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and use it as your `JWT_SECRET`

### Step 5: Get Paystack Keys
1. Go to https://dashboard.paystack.com
2. Navigate to Settings → API Keys & Webhooks
3. Copy your test keys:
   - Public Key → `PAYSTACK_PUBLIC_KEY`
   - Secret Key → `PAYSTACK_SECRET_KEY`

## After Adding Variables

### 1. Redeploy
After adding all environment variables:
1. Go to "Deployments" tab
2. Click the three dots (...) on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

### 2. Verify Setup
Test these endpoints to verify everything is working:

```bash
# Check health
curl https://darb-networks-backend.vercel.app/health

# Check database status
curl https://darb-networks-backend.vercel.app/api/db-status

# Check API info
curl https://darb-networks-backend.vercel.app/api

# Test campaigns endpoint
curl https://darb-networks-backend.vercel.app/api/campaigns
```

### 3. Check Logs
If something isn't working:
1. Go to your Vercel project
2. Click on "Deployments"
3. Click on the latest deployment
4. Click "View Function Logs"
5. Look for error messages

## Common Issues

### Database Connection Failed
- Verify all DB_* variables are correct
- Check that Railway database allows external connections
- Ensure SSL is enabled in production

### JWT Errors
- Make sure JWT_SECRET is set
- Use a long, random string (at least 32 characters)

### CORS Errors
- Verify CLIENT_ORIGIN and FRONTEND_URL match your frontend domain
- Include both with and without trailing slashes if needed

### 404 on API Routes
- Check that routes are loading in function logs
- Verify database is connected (routes won't load without DB)

## Quick Checklist

Before redeploying, verify you have:
- [ ] All 5 database variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
- [ ] NODE_ENV set to "production"
- [ ] JWT_SECRET with a secure random string
- [ ] CLIENT_ORIGIN with your frontend URL
- [ ] FRONTEND_URL with your frontend URL
- [ ] PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY
- [ ] All variables applied to Production, Preview, and Development

## Example Values (DO NOT USE THESE - REPLACE WITH YOUR OWN)

```
DB_HOST=containers-us-west-123.railway.app
DB_PORT=3306
DB_USER=root
DB_PASSWORD=AbCdEfGh123456
DB_NAME=railway
NODE_ENV=production
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
CLIENT_ORIGIN=https://darb-networks-eculloaju-obikanelsons-projects.vercel.app
FRONTEND_URL=https://darb-networks-eculloaju-obikanelsons-projects.vercel.app
PAYSTACK_SECRET_KEY=sk_test_1234567890abcdef
PAYSTACK_PUBLIC_KEY=pk_test_1234567890abcdef
```
