# Environment Variables Reference

This document lists all environment variables required to run Darb Network in production.

## Backend (server)

### Database
- `DB_HOST` — MySQL host (e.g., `trolley.proxy.rlwy.net`)
- `DB_PORT` — MySQL port (default: `3306`)
- `DB_USER` — MySQL username
- `DB_PASSWORD` — MySQL password
- `DB_NAME` — Database name (e.g., `darb_network`)
- `DB_SSL` — Enable SSL for production databases (e.g., `true`)

### Firebase Admin SDK
- `FIREBASE_PROJECT_ID` — Your Firebase project ID
- `FIREBASE_CLIENT_EMAIL` — Service account email
- `FIREBASE_PRIVATE_KEY` — Service account private key (with literal `\n` for newlines)

### JWT & Security
- `JWT_SECRET` — Secret key for signing tokens (minimum 32 characters)
  ```bash
  # Generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- `NODE_ENV` — Environment (`development` or `production`)

### Payments
- `PAYSTACK_SECRET_KEY` — Paystack secret key (must start with `sk_test_` for test mode)
- `PAYSTACK_PUBLIC_KEY` — Paystack public key (optional, for reference)

### File Uploads
- `CLOUDINARY_CLOUD_NAME` — Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret

### URLs & CORS
- `FRONTEND_URL` — Frontend URL for CORS and redirects (e.g., `http://localhost:5173`)
- `CLIENT_ORIGIN` — Alternative name for frontend URL
- `ALLOWED_ORIGINS` — Comma-separated list of allowed origins
  - Example: `http://localhost:5173,https://darb-network.vercel.app`
- `VERCEL_PREVIEW_PATTERN` — Regex for Vercel preview URLs (optional)
  - Example: `https://darb-network-[a-z0-9]+-preview\.vercel\.app`

### Server
- `PORT` — Server port (default: `5000`)

---

## Frontend (client)

### API
- `VITE_API_URL` — Backend API base URL
  - Development: `http://localhost:5000/api`
  - Production: `https://your-backend.vercel.app/api`

### Paystack
- `VITE_PAYSTACK_PUBLIC_KEY` — Paystack public key (must start with `pk_test_` for test mode)

### reCAPTCHA (optional, currently disabled)
- `VITE_RECAPTCHA_SITE_KEY` — reCAPTCHA site key (optional)

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Generate new JWT_SECRET
- [ ] Use Paystack test keys (they start with `sk_test_` and `pk_test_`)
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS with actual domain
- [ ] Store Firebase service account JSON securely (never in git)
- [ ] Set DATABASE credentials for production database
- [ ] Configure CLOUDINARY credentials
- [ ] Test payment flow in test mode
- [ ] Review CORS settings
- [ ] Enable HTTPS/SSL on frontend domain

---

## Example Configuration

### Local Development (.env)

```env
# Database (local)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_password
DB_NAME=darb_network

# Firebase (get from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...\n-----END PRIVATE KEY-----"

# JWT (generate: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
JWT_SECRET=d807649e80ce746d9ca844c97111376f7e2c5b6dec0e9b9c64f452337bb7ca54

# Paystack (test keys from https://dashboard.paystack.com)
PAYSTACK_SECRET_KEY=sk_test_ea0d848cec6a2e81e72725d69efed66b8cee91cc
PAYSTACK_PUBLIC_KEY=pk_test_ea0d848cec6a2e81e72725d69efed66b8cee91cc

# Cloudinary
CLOUDINARY_CLOUD_NAME=dqwa8w9wb
CLOUDINARY_API_KEY=549813351582393
CLOUDINARY_API_SECRET=fJ7vajUs2OXUuguNpX3U69F2f34

# URLs
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
NODE_ENV=development
PORT=5000
```

### Production Deployment (Vercel)

Set these variables in Vercel project settings:

```env
# Database
DB_HOST=production-database-host
DB_PORT=3306
DB_USER=prod_user
DB_PASSWORD=secure_password_here
DB_NAME=darb_network
DB_SSL=true

# Firebase
FIREBASE_PROJECT_ID=production-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@prod-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# JWT (NEW SECRET, not development one)
JWT_SECRET=new_production_secret_48_chars_or_more

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxx  # Still test keys unless you go live
PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=prod_cloud_name
CLOUDINARY_API_KEY=prod_api_key
CLOUDINARY_API_SECRET=prod_api_secret

# URLs
FRONTEND_URL=https://darb-network.vercel.app
ALLOWED_ORIGINS=https://darb-network.vercel.app
VERCEL_PREVIEW_PATTERN=https://darb-network-[a-z0-9]+-preview\.vercel\.app
NODE_ENV=production
```

---

## Never Commit to Git

- `.env` files (use `.env.example` templates)
- `firebase-adminsdk-*.json` service account files
- Any API keys, passwords, or secrets
- Local database backups

Always use `.gitignore` to exclude these files.
