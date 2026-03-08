# Vercel Automatic Domain Handling

## How It Works

Your backend now automatically accepts requests from ANY `.vercel.app` domain, so you don't need to update environment variables when Vercel generates new preview URLs.

## Vercel System Environment Variables

Vercel automatically provides these variables (you don't need to set them):

- `VERCEL_URL` - The domain of the current deployment (e.g., `your-app-abc123.vercel.app`)
- `VERCEL_ENV` - The environment: `production`, `preview`, or `development`
- `VERCEL_GIT_COMMIT_SHA` - The git commit SHA
- `VERCEL_GIT_COMMIT_REF` - The git branch name

## CORS Configuration

The backend now uses a function-based CORS origin check that:
1. Allows localhost for development
2. Allows any domain ending in `.vercel.app` (all your deployments)
3. Allows specific domains if you set `CLIENT_ORIGIN` or `FRONTEND_URL`

This means:
- ✅ All preview deployments work automatically
- ✅ Production deployment works automatically
- ✅ No need to update env vars for each deployment
- ✅ Still secure (only Vercel domains are allowed)

## Optional: Set Production Domain

If you want to restrict to only your production frontend domain, you can set:

```
CLIENT_ORIGIN=https://your-custom-domain.com
```

But for Vercel deployments, leaving it empty works perfectly!

## What Changed

1. **CORS**: Now accepts any `.vercel.app` domain automatically
2. **Callback URLs**: Uses `VERCEL_URL` as fallback for payment callbacks
3. **Reset URLs**: Uses `VERCEL_URL` as fallback for password reset links

## Testing

All these URLs will now work with your backend:
- `https://darb-networks-eculloaju-obikanelsons-projects.vercel.app`
- `https://darb-networks-git-main-obikanelsons-projects.vercel.app`
- `https://darb-networks-abc123.vercel.app` (any preview deployment)

No configuration needed!
