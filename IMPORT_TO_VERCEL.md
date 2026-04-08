# How to Import Environment Variables to Vercel

## Step 1: Fill in Your Values

Open `backend/.env.production` and fill in these required values:

### Required Variables:

1. **DB_USER** - Your PlanetScale username (from PlanetScale Connect page)
2. **DB_PASSWORD** - Your PlanetScale password (starts with `pscale_pw_`)
3. **DB_NAME** - Your database name (e.g., `darb-network`)
4. **JWT_SECRET** - Generate by running:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
5. **PAYSTACK_SECRET_KEY** - Your Paystack secret key (from Paystack dashboard)
6. **PAYSTACK_PUBLIC_KEY** - Your Paystack public key (from Paystack dashboard)

### Optional Variables:
- **CLIENT_ORIGIN** - Leave empty (handled by regex)
- **FRONTEND_URL** - Leave empty (handled by regex)
- **EMAIL_USER** - Your email for password resets
- **EMAIL_PASS** - Your email app password

## Step 2: Import to Vercel

### Method 1: Import .env File (Easiest)

1. Go to https://vercel.com/dashboard
2. Select your `darb-networks-backend` project
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar
5. Click the **three dots menu** (⋮) in the top right
6. Select **"Import .env"**
7. Upload your filled `backend/.env.production` file
8. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
9. Click **Import**

### Method 2: Manual Entry

If import doesn't work, add each variable manually:

1. Go to Settings → Environment Variables
2. Click **"Add Environment Variable"**
3. For each variable:
   - Enter **Key** (e.g., `DB_HOST`)
   - Enter **Value** (e.g., `aws.connect.psdb.cloud`)
   - Select all environments (Production, Preview, Development)
   - Click **Save**

## Step 3: Verify Variables

After importing, you should see these variables in Vercel:

```
✅ DB_HOST
✅ DB_PORT
✅ DB_USER
✅ DB_PASSWORD
✅ DB_NAME
✅ NODE_ENV
✅ JWT_SECRET
✅ PAYSTACK_SECRET_KEY
✅ PAYSTACK_PUBLIC_KEY
```

Optional:
```
⚪ CLIENT_ORIGIN
⚪ FRONTEND_URL
⚪ EMAIL_USER
⚪ EMAIL_PASS
```

## Step 4: Redeploy

After adding environment variables:

1. Go to **Deployments** tab
2. Click the **three dots** (⋮) on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

## Step 5: Test

After redeployment, test these endpoints:

```bash
# Health check
curl https://darb-networks-backend.vercel.app/health

# Database status
curl https://darb-networks-backend.vercel.app/api/db-status

# Campaigns (should return empty array, not 404)
curl https://darb-networks-backend.vercel.app/api/campaigns
```

Or open `test-backend.html` in your browser and click "Run All Tests".

## Troubleshooting

### Variables not showing up
- Make sure you saved each variable
- Check that you selected the right environments
- Try refreshing the page

### Still getting 404 errors
- Verify all database variables are correct
- Check PlanetScale connection credentials
- Make sure you ran the schema in PlanetScale Console
- Check Vercel function logs for errors

### Database connection errors
- Double-check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- Ensure password starts with `pscale_pw_`
- Verify database exists in PlanetScale
- Check that tables are created

## Security Notes

⚠️ **Never commit .env files with real values to Git!**

The `.env.production` file is in `.gitignore` to prevent accidental commits.

## Quick Checklist

Before importing:
- [ ] PlanetScale database created
- [ ] Database schema executed in PlanetScale Console
- [ ] All required values filled in `.env.production`
- [ ] JWT_SECRET generated (64+ characters)
- [ ] Paystack keys copied from dashboard

After importing:
- [ ] All variables visible in Vercel dashboard
- [ ] Redeployed the backend
- [ ] Tested health endpoint
- [ ] Tested db-status endpoint
- [ ] Tested campaigns endpoint
- [ ] Frontend can load campaigns

---

**Ready?** Fill in `backend/.env.production` and import it to Vercel! 🚀
