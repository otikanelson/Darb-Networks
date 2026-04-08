# PlanetScale Setup Guide for Darb Network

## Step 1: Create PlanetScale Account

1. Go to https://planetscale.com
2. Click "Sign up" or "Get started"
3. Sign up with your GitHub account (easiest)
4. Verify your email if needed

## Step 2: Create a New Database

1. Once logged in, click "Create a new database"
2. **Database name**: `darb-network` (or any name you prefer)
3. **Region**: Choose the closest to your users:
   - US East (Ohio) - `aws-us-east-2`
   - US West (Oregon) - `aws-us-west-2`
   - EU (Frankfurt) - `aws-eu-west-1`
   - Asia Pacific (Mumbai) - `aws-ap-south-1`
4. **Plan**: Select "Hobby" (Free tier)
5. Click "Create database"

## Step 3: Get Connection Credentials

1. After database is created, click on your database name
2. Click "Connect" button (top right)
3. Click "Create password" or "New password"
4. **Name your password**: `vercel-production` (or any name)
5. **Branch**: Select `main`
6. Click "Create password"

## Step 4: Copy Connection Details

You'll see connection details. Select "Node.js" from the dropdown.

Copy these values:
```
Host: aws.connect.psdb.cloud (or your region)
Username: xxxxxxxxxx
Password: pscale_pw_xxxxxxxxxx
Database: darb-network (your database name)
Port: 3306
```

⚠️ **IMPORTANT**: Save the password now! You won't be able to see it again.

## Step 5: Initialize Database Schema

You need to create your database tables. You have two options:

### Option A: Use PlanetScale Console (Recommended)

1. In PlanetScale dashboard, click on your database
2. Click "Console" tab
3. Copy and paste your schema from `backend/database/schema.sql`
4. Click "Execute"

### Option B: Use MySQL Client

If you have MySQL client installed:

```bash
# Connect to PlanetScale
mysql -h aws.connect.psdb.cloud -u your-username -p your-database-name

# Then paste your schema from backend/database/schema.sql
```

## Step 6: Update Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your `darb-networks-backend` project
3. Go to Settings → Environment Variables
4. Add/Update these variables:

```
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=your-planetscale-username
DB_PASSWORD=pscale_pw_xxxxxxxxxx
DB_NAME=darb-network
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-key-here
PAYSTACK_SECRET_KEY=sk_test_ea0d848cec6a2e81e72725d69efed66b8cee91cc
PAYSTACK_PUBLIC_KEY=pk_test_ea0d848cec6a2e81e72725d69efed66b8cee91cc
```

**To generate JWT_SECRET**, run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

5. Make sure to select all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

6. Click "Save" for each variable

## Step 7: Update Local Environment (Optional)

If you want to test locally:

1. Create `backend/.env` file (if it doesn't exist)
2. Add the same variables:

```env
DB_HOST=aws.connect.psdb.cloud
DB_PORT=3306
DB_USER=your-planetscale-username
DB_PASSWORD=pscale_pw_xxxxxxxxxx
DB_NAME=darb-network
NODE_ENV=development
JWT_SECRET=your-jwt-secret
PAYSTACK_SECRET_KEY=sk_test_ea0d848cec6a2e81e72725d69efed66b8cee91cc
PAYSTACK_PUBLIC_KEY=pk_test_ea0d848cec6a2e81e72725d69efed66b8cee91cc
```

## Step 8: Deploy to Vercel

1. Commit and push your code changes:
```bash
git add .
git commit -m "Update database config for PlanetScale"
git push
```

2. Vercel will automatically redeploy

OR manually redeploy:
1. Go to Vercel dashboard
2. Go to Deployments tab
3. Click three dots (...) on latest deployment
4. Click "Redeploy"

## Step 9: Verify Everything Works

1. Wait for deployment to complete
2. Open `test-backend.html` in your browser
3. Click "Run All Tests"
4. All tests should pass ✅

Or test manually:
- Health: https://darb-networks-backend.vercel.app/health
- DB Status: https://darb-networks-backend.vercel.app/api/db-status
- Campaigns: https://darb-networks-backend.vercel.app/api/campaigns

## Troubleshooting

### "Access denied" error
- Double-check username and password
- Make sure you copied the full password (starts with `pscale_pw_`)
- Verify the database name is correct

### "SSL connection error"
- PlanetScale requires SSL in production
- Make sure `NODE_ENV=production` is set in Vercel
- The code has been updated to handle this

### "Table doesn't exist"
- You need to run the schema SQL in PlanetScale Console
- Go to your database → Console tab → Paste schema → Execute

### Routes still returning 404
- Check Vercel function logs for errors
- Verify all environment variables are set
- Make sure database tables are created
- Try redeploying after adding env vars

## PlanetScale Free Tier Limits

✅ 5 GB storage
✅ 1 billion row reads/month
✅ 10 million row writes/month
✅ 1 production branch
✅ 1 development branch

This is more than enough for your application!

## Important Notes

1. **Branching**: PlanetScale uses branches like Git. Your main branch is `main`
2. **Schema Changes**: Use PlanetScale's branching workflow for schema changes
3. **Backups**: Free tier includes automatic backups
4. **Monitoring**: Check your dashboard for usage stats

## Next Steps After Setup

1. Test your frontend at https://darb-networks.vercel.app/dashboard
2. Create some test campaigns
3. Monitor PlanetScale dashboard for queries
4. Set up alerts if needed

## Need Help?

If you encounter issues:
1. Check Vercel function logs
2. Check PlanetScale Insights tab for query errors
3. Use the test-backend.html file to diagnose
4. Check that all environment variables are set correctly

---

**Ready to start?** Follow Step 1 above! 🚀
