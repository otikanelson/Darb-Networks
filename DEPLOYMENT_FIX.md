# Backend Deployment Fix Guide

## Issues Fixed

1. **Vercel.json Configuration**: Updated to use `api/index.js` as the entry point instead of `server.js`
2. **Route Loading**: Simplified path resolution to use relative paths consistently
3. **Frontend API URL**: Updated to point to the correct backend URL (`darb-networks-backend.vercel.app`)
4. **CORS Configuration**: Added your frontend domain to allowed origins

## Steps to Deploy

### 1. Backend Deployment (Vercel)

1. Push the updated code to your repository
2. In Vercel dashboard, go to your backend project settings
3. Verify these environment variables are set:
   - `DB_HOST` - Your database host
   - `DB_USER` - Your database username
   - `DB_PASSWORD` - Your database password
   - `DB_NAME` - Your database name
   - `DB_PORT` - Database port (usually 3306)
   - `NODE_ENV` - Set to `production`
   - `JWT_SECRET` - Your JWT secret key
   - `FRONTEND_URL` - Your frontend URL

4. Redeploy the backend by triggering a new deployment

### 2. Frontend Deployment (Vercel)

1. Push the updated frontend code
2. In Vercel dashboard, go to your frontend project settings
3. Verify the environment variable:
   - `VITE_API_URL` - Should be `https://darb-networks-backend.vercel.app/api`
   - `VITE_PAYSTACK_PUBLIC_KEY` - Your Paystack public key

4. Redeploy the frontend

### 3. Testing

After deployment, test these endpoints:

1. **Health Check**: `https://darb-networks-backend.vercel.app/health`
2. **API Info**: `https://darb-networks-backend.vercel.app/api`
3. **Campaigns**: `https://darb-networks-backend.vercel.app/api/campaigns`

## Common Issues

### If campaigns still return 404:

1. Check Vercel logs for the backend deployment
2. Verify database connection by visiting: `/api/db-status`
3. Check that all route files are included in the deployment
4. Ensure environment variables are correctly set

### If CORS errors occur:

1. Verify your frontend URL is in the CORS whitelist
2. Check that credentials are being sent with requests
3. Ensure the backend is receiving the correct Origin header

### Database Connection Issues:

1. Verify all DB environment variables are set
2. Check that SSL is enabled for production database
3. Test connection using the `/api/db-status` endpoint
4. Ensure your database allows connections from Vercel IPs

## Quick Commands

```bash
# Test backend health
curl https://darb-networks-backend.vercel.app/health

# Test campaigns endpoint
curl https://darb-networks-backend.vercel.app/api/campaigns

# Check database status
curl https://darb-networks-backend.vercel.app/api/db-status
```

## Next Steps

1. Commit and push all changes
2. Wait for Vercel to automatically redeploy
3. Test the endpoints above
4. Check your frontend to see if campaigns load
5. Monitor Vercel logs for any errors
