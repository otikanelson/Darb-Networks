# Darb Network - Security Hardening Checklist

This document tracks all security improvements implemented in the system.

## ✅ STEP 1: Stop users from making themselves admin

- [x] Auth controller: Only accept "founder" or "investor" in signup
- [x] Reject admin userType with 400 "Invalid user type"
- [x] User controller: Remove userType from allowedFields
- [x] Users cannot change role after signup
- [x] Validation function updated to exclude userType

**Test:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","fullName":"Test","userType":"admin"}'
# Expected: 400 "Invalid user type"
```

---

## ✅ STEP 2: Require a real JWT secret

- [x] auth.config.js: Removed hardcoded fallback secret
- [x] Throws fatal error if JWT_SECRET < 32 characters
- [x] auth.jwt.js: Declared verifyToken with const
- [x] verifySignUp.js: Declared checkDuplicateEmail with const
- [x] .env.example: Added JWT_SECRET documentation

**Action Required:**
- [ ] Generate a new 48-byte JWT secret:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- [ ] Set JWT_SECRET in Vercel environment variables
- [ ] Users will need to log in again with new secret

---

## ✅ STEP 3: Stop the public campaign list from leaking drafts

- [x] getAllCampaigns: Hardcoded WHERE status = 'approved'
- [x] Ignores any ?status= query parameter
- [x] Created optionalToken middleware
- [x] Applied to GET /api/campaigns/:id
- [x] Unapproved campaigns return 404 (not 403)
- [x] Only founder/admin can access own drafts

**Test:**
```bash
# Public can only see approved
curl http://localhost:5000/api/campaigns

# Draft campaign without token returns 404
curl http://localhost:5000/api/campaigns/123
# Expected: { success: false, message: "Campaign not found" }
```

---

## ✅ STEP 4: Remove debug endpoints

- [x] Deleted /test endpoint
- [x] Deleted /api/cloudinary-status endpoint
- [x] Deleted /api/route-status endpoint
- [x] Reduced /api/db-status to minimal response (dev-only)
- [x] Reduced /health to { success, status }
- [x] Updated 404 handler to not list endpoints
- [x] Removed startup env detail logs

**Test:**
```bash
curl http://localhost:5000/test  # 404
curl http://localhost:5000/api/cloudinary-status  # 404
curl http://localhost:5000/api/route-status  # 404
```

---

## ✅ STEP 5: Tighten CORS

- [x] Removed /\.vercel\.app$/ regex allowlist
- [x] Added ALLOWED_ORIGINS env var (comma-separated)
- [x] Always include localhost:5173 in development
- [x] Optional VERCEL_PREVIEW_PATTERN for preview URLs
- [x] Removed duplicate CORS header blocks from all route files
- [x] Updated .env.example with CORS variables

**Environment Variables:**
```env
ALLOWED_ORIGINS=https://darb-network.vercel.app
VERCEL_PREVIEW_PATTERN=https://darb-network-[a-z0-9]+-preview\.vercel\.app
```

**Test:**
```bash
# Blocked origin
curl -H "Origin: https://evil.com" http://localhost:5000/api/campaigns
# Expected: CORS error

# Allowed origin (dev)
curl -H "Origin: http://localhost:5173" http://localhost:5000/api/campaigns
# Expected: Success
```

---

## ✅ STEP 6: Stop leaking internal errors

- [x] Created backend/utils/http.js with sendError() helper
- [x] Updated auth.controller.js to use sendError()
- [x] Updated user.controller.js to use sendError()
- [x] Updated campaign.controller.js (removed 21 error leaks)
- [x] Updated admin.controller.js (removed 7 error leaks)
- [x] Updated investment.controller.js (removed 8 error leaks)
- [x] Server error handler logs full error, returns generic message

**Test:**
```bash
# Production: Generic error message
NODE_ENV=production curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"bad@test.com","password":"wrong"}'
# Expected: { success: false, message: "..." } (no details)

# Development: May include error field with details
NODE_ENV=development curl ...
# Expected: { success: false, message: "...", error: { message: "...", stack: "..." } }
```

---

## ✅ STEP 7: Basic hardening middleware

- [x] Added helmet to server.js
- [x] Added express-rate-limit configuration
- [x] General limiter: 100 requests/15 min per IP
- [x] Auth limiter: 10 requests/15 min per IP
- [x] Applied to /api/auth/login, /register, /forgot-password, /reset-password
- [x] Set app.set('trust proxy', 1) for Vercel
- [x] Reduced JSON body limit from 10mb to 1mb
- [x] Increased bcrypt cost from 8 to 12 in all controllers
- [x] Enforced 8-char minimum password everywhere

**Dependencies to Install:**
```bash
npm install helmet express-rate-limit
```

**Test:**
```bash
# Rate limiting (10 attempts in 15 min)
for i in {1..11}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
done
# Expected: 11th request returns 429 (in production)

# Helmet headers
curl -I http://localhost:5000/health
# Expected: X-Frame-Options, X-Content-Type-Options headers present

# Password validation
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass"}'
# Expected: 400 "at least 8 characters"
```

---

## ✅ STEP 8: Payment safety

- [x] Removed silent mock PaystackService fallback
- [x] Throws error at startup if PaystackService fails to load
- [x] Added PAYSTACK_SECRET_KEY check in initiateInvestmentWithPayment
- [x] Returns 503 if payments not configured
- [x] Updated webhook handler to verify signature on raw body
- [x] Added express.raw({ type: 'application/json' }) for webhook route
- [x] Added amount validation in verifyPayment
- [x] Checks that paid amount equals stored investment amount
- [x] Removed adminAuth fallback || (() => {}) pattern in routes

**Test:**
```bash
# Missing PAYSTACK_SECRET_KEY
NODE_ENV=production node server.js &
curl -X POST http://localhost:5000/api/investments/create \
  -H "Content-Type: application/json" \
  -d '{"campaignId":1,"amount":50000}'
# Expected: 503 "Payments unavailable"

# Webhook signature verification
# Use real Paystack webhook with valid signature
# Server logs should show verification pass/fail
```

---

## ✅ STEP 9: Verify reCAPTCHA on the server

- [x] Created backend/middlewares/verifyCaptcha.js
- [x] Verifies token with Google's reCAPTCHA API
- [x] Applied to POST /api/auth/register
- [x] In production: Required and fails if missing
- [x] In development: Skipped if RECAPTCHA_SECRET_KEY not set
- [x] Checks score < 0.5 for reCAPTCHA v3
- [x] Returns 400 on verification failure

**Environment Variables:**
```env
RECAPTCHA_SECRET_KEY=your_secret_key_here
```

**Test:**
```bash
# Dev mode without secret: captcha skipped
NODE_ENV=development RECAPTCHA_SECRET_KEY= node server.js &
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","fullName":"Test","userType":"founder"}'
# Expected: May succeed (captcha skipped in dev)

# Production without secret: fails
NODE_ENV=production node server.js &
# Expected: Server fails to start or returns 503

# With valid token: succeeds
# (requires token from actual reCAPTCHA widget)
```

---

## ✅ STEP 10: Protect sensitive personal data

- [x] Created backend/utils/dataProtection.js
- [x] maskBVN(): Shows last 4 digits, hides rest
- [x] maskAccountNumber(): Shows last 4 digits, hides rest
- [x] formatSafeUserData(): Masks sensitive fields, adds hasBvn/hasAccountNumber flags
- [x] Updated getProfile to use formatSafeUserData()
- [x] Updated updateProfile to use formatSafeUserData()
- [x] Updated admin getCampaignForReview to mask founder_bvn
- [x] Added TODO comment for AES-256-GCM encryption at rest

**Test:**
```bash
# Get profile shows masked data
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/users/profile
# Expected:
# {
#   "bvn": "*******1234",
#   "hasBvn": true,
#   "accountNumber": "****5678",
#   "hasAccountNumber": true
# }

# Admin view shows masked data
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:5000/api/admin/campaigns/123
# Expected: founder_bvn masked, has_founder_bvn boolean present
```

---

## ✅ STEP 11: Remove published credentials

- [x] Removed "Default Login Credentials" section from README
- [x] Removed admin@darbnetwork.com / admin2025
- [x] Removed otikanelson29@gmail.com / 292025
- [x] Removed otikanelson / 2025
- [x] Added "Setting Up Your Admin Account" with secure instructions
- [x] Documented bcrypt hashing with cost=12
- [x] Added security best practices for admin accounts

**Action Required:**
- [ ] Change admin account password if using old credentials
  ```bash
  # Generate new bcrypt hash
  node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourSecurePassword123', 12));"
  
  # Update database
  mysql -u root -p darb_network
  UPDATE users SET password = 'HASH_HERE' WHERE email = 'admin@darbnetwork.com';
  ```

---

## ✅ STEP 12: Security smoke tests

- [x] Created backend/scripts/security-smoke-test.sh (Bash)
- [x] Created backend/scripts/security-smoke-test.js (Node.js)
- [x] Tests all 11 security steps
- [x] Provides colored output (pass/fail/warning)
- [x] Returns exit code 0 on success, 1 on failure

**Run Tests:**
```bash
# Bash version
bash backend/scripts/security-smoke-test.sh http://localhost:5000

# Node.js version
node backend/scripts/security-smoke-test.js http://localhost:5000
```

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Generate a new JWT_SECRET (48 bytes)
- [ ] Set JWT_SECRET in Vercel environment
- [ ] Configure ALLOWED_ORIGINS for your domain
- [ ] Set up reCAPTCHA and get keys from Google
- [ ] Set RECAPTCHA_SECRET_KEY in environment
- [ ] Change admin account password
- [ ] Verify no published credentials remain in git history
- [ ] Run security smoke tests
- [ ] Review all environment variables are set
- [ ] Enable HTTPS/SSL on production domain
- [ ] Set up automated log monitoring
- [ ] Configure backup strategy
- [ ] Test login and basic flows
- [ ] Review rate limiting thresholds for production traffic
- [ ] Verify CORS origins match your domains

---

## Production Environment Variables

```env
# Required for security
NODE_ENV=production
JWT_SECRET=<48_character_hex_secret>
RECAPTCHA_SECRET_KEY=<your_recaptcha_secret>
PAYSTACK_SECRET_KEY=<your_paystack_secret>

# CORS
ALLOWED_ORIGINS=https://darb-network.vercel.app,https://yourdomain.com
VERCEL_PREVIEW_PATTERN=https://darb-network-[a-z0-9]+-preview\.vercel\.app

# Database
DB_HOST=<production_host>
DB_USER=<production_user>
DB_PASSWORD=<secure_password>
DB_NAME=darb_network

# Other required vars
FRONTEND_URL=https://yourdomain.com
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

---

## Monitoring & Auditing

### Log for Security Events

- Failed login attempts
- Admin actions (approve/reject campaigns, manage users)
- Access to sensitive endpoints
- Rate limit violations
- JWT verification failures

### Regular Security Tasks

- [ ] Weekly: Review admin access logs
- [ ] Monthly: Audit user accounts with sensitive data
- [ ] Quarterly: Rotate JWT_SECRET (requires user re-login)
- [ ] Quarterly: Rotate API keys (Paystack, Cloudinary)
- [ ] Annually: Security audit and penetration test

---

## References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
