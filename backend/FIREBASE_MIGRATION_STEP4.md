# Firebase Authentication Migration - STEP 4: Auth Routes

## Overview

Updated auth routes and controller to use Firebase ID token authentication instead of JWT. All auth endpoints now verify Firebase tokens and manage MySQL user profiles.

## Files Modified

### 1. `backend/controllers/auth.controller.js`

Completely refactored with 5 Firebase-compatible endpoints:

#### **signup** - POST /api/auth/register
Creates or updates user profile in MySQL after Firebase authentication.

**Flow:**
1. Frontend creates user in Firebase (email/password signup or OAuth)
2. Frontend gets Firebase ID token
3. Frontend sends POST /api/auth/register with Firebase token + profile info
4. Backend verifies token via `firebaseAuth.verifyFirebaseTokenAllowNoProfile` middleware
5. Backend creates MySQL user profile linked to firebase_uid
6. Response: User profile + Firebase UID

**Request:**
```bash
POST /api/auth/register
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
  "fullName": "John Doe",
  "companyName": "Acme Inc",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "bvn": "...",
  "nin": "...",
  "cacNumber": "...",
  "accountNumber": "...",
  "bankName": "..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User profile created successfully!",
  "data": {
    "id": 123,
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "investor",
    "isEmailVerified": false,
    "firebaseUid": "firebase_uid_here"
  }
}
```

**Key Changes:**
- Removed password hashing (Firebase handles passwords)
- Default userType: "investor" (founders/admins set only via backend)
- Uses `firebase_uid` from token instead of password-based auth
- Tracks `isEmailVerified` separately
- Checks for duplicate firebase_uid, not email (Firebase enforces unique emails)

---

#### **signin** - POST /api/auth/login
Authenticates user and returns profile; profile must already exist in MySQL.

**Flow:**
1. Frontend authenticates with Firebase (email/password or OAuth)
2. Frontend gets Firebase ID token
3. Frontend sends POST /api/auth/login with Firebase token
4. Backend verifies token via `firebaseAuth.verifyFirebaseToken` middleware
5. Backend finds user by firebase_uid and returns profile
6. Response: User profile data

**Request:**
```bash
POST /api/auth/login
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{} # Empty body; authentication is in token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 123,
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "investor",
    "isEmailVerified": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Cases:**
- 403: No Firebase token provided
- 401: Invalid token OR user profile not found (must register first via /api/auth/register)
- 401: Account inactive

**Key Changes:**
- No password validation (Firebase handles authentication)
- Requires MySQL profile; returns PROFILE_NOT_FOUND if missing
- Updates `lastLoginAt` timestamp
- No JWT token returned (Firebase token is returned by frontend)

---

#### **verifyToken** - GET /api/auth/profile
Returns current authenticated user's profile.

**Flow:**
1. Frontend includes Firebase ID token in Authorization header
2. Backend verifies token via `firebaseAuth.verifyFirebaseToken` middleware
3. Backend fetches user profile from MySQL by firebase_uid
4. Response: User profile

**Request:**
```bash
GET /api/auth/profile
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "investor",
    "isEmailVerified": false,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Cases:**
- 403: No Firebase token
- 401: Invalid token
- 404: User not found

---

#### **verifyEmail** - POST /api/auth/verify-email
Marks user's email as verified in MySQL after Firebase confirms verification.

**Flow:**
1. User clicks "Verify Email" link from Firebase email
2. Firebase marks email as verified in Firebase Auth
3. Frontend calls this endpoint with verified Firebase token
4. Backend updates `isEmailVerified = true` in MySQL
5. Response: Updated user profile

**Request:**
```bash
POST /api/auth/verify-email
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{} # Empty body
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "data": {
    "id": 123,
    "email": "user@example.com",
    "fullName": "John Doe",
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Key Points:**
- Firebase handles email verification flow (sending emails, verifying links)
- Backend just tracks verification status in MySQL `isEmailVerified` column
- Used by `firebaseAuth.requireVerifiedEmail` middleware for sensitive endpoints
- Example: Investments/campaigns require verified email

---

#### **logout** - POST /api/auth/logout
Logs out user; frontend handles token cleanup.

**Flow:**
1. Frontend deletes Firebase ID token from localStorage
2. Frontend sends POST /api/auth/logout
3. Backend updates `lastLogoutAt` timestamp (optional, for audit trail)
4. Response: Confirmation

**Request:**
```bash
POST /api/auth/logout
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{} # Empty body
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Key Points:**
- Backend does NOT invalidate tokens (Firebase tokens are stateless)
- Frontend responsible for clearing token from storage
- Backend endpoint optional; mainly for audit logging
- Alternative: Frontend can skip backend logout call entirely

---

### 2. `backend/routes/auth.routes.js`

Updated middleware usage and documentation:

| Route | Method | Old Middleware | New Middleware | Purpose |
|-------|--------|----------------|-----------------|---------|
| /api/auth/register | POST | verifySignUp.checkDuplicateEmail | firebaseAuth.verifyFirebaseTokenAllowNoProfile | Firebase-based registration |
| /api/auth/login | POST | (none) | firebaseAuth.verifyFirebaseToken | Firebase-based login |
| /api/auth/profile | GET | authJwt.verifyToken | firebaseAuth.verifyFirebaseToken | Get current user profile |
| /api/auth/verify-email | POST | (none) | firebaseAuth.verifyFirebaseToken | Mark email verified |
| /api/auth/logout | POST | authJwt.verifyToken | firebaseAuth.verifyFirebaseToken | Logout event |

**Key Changes:**
- Replaced `authJwt.verifyToken` with `firebaseAuth.verifyFirebaseToken`
- Replaced `verifySignUp.checkDuplicateEmail` with `firebaseAuth.verifyFirebaseTokenAllowNoProfile`
- Removed inline fallback handlers (all logic now in controller)
- Added comprehensive route documentation

---

## Implementation Summary

### Authentication Flow (Firebase)

**Registration:**
```
Frontend creates Firebase user (email/password signup)
         ↓
Frontend gets Firebase ID token
         ↓
POST /api/auth/register with Firebase token + profile info
         ↓
firebaseAuth.verifyFirebaseTokenAllowNoProfile middleware
         ↓
Backend creates MySQL user profile (firebase_uid → user.id)
         ↓
Response: Profile + firebase_uid
```

**Login:**
```
Frontend authenticates with Firebase (email/password or OAuth)
         ↓
Frontend gets Firebase ID token
         ↓
POST /api/auth/login with Firebase token
         ↓
firebaseAuth.verifyFirebaseToken middleware
         ↓
Backend finds user by firebase_uid
         ↓
Backend updates lastLoginAt
         ↓
Response: User profile
```

**Subsequent Requests:**
```
Frontend includes Firebase token in Authorization header
         ↓
Any request to protected endpoint (e.g., GET /api/campaigns)
         ↓
firebaseAuth.verifyFirebaseToken middleware
         ↓
Backend verifies token signature + expiration
         ↓
Backend finds user by firebase_uid
         ↓
req.userId, req.firebaseUid, req.userEmail set
         ↓
Controller accesses req.userId
```

### Key Architectural Changes

| Aspect | Before (JWT) | After (Firebase) |
|--------|------------|-----------------|
| **Password Storage** | Hashed in DB | Firebase handles securely |
| **Token Verification** | Symmetric (shared secret) | Asymmetric (Firebase public keys) |
| **Token Signing** | Backend signs JWT | Firebase signs ID token |
| **User Lookup** | id from JWT | firebase_uid from Firebase token |
| **Email Verification** | Manual backend logic | Firebase + isEmailVerified tracking |
| **Password Reset** | Custom endpoint | Firebase handles entirely |
| **OAuth Integration** | Manual implementation | Firebase built-in |
| **Session Invalidation** | Via blacklist/logout | Stateless; expired tokens invalid |

### Request Augmentation by Middleware

After `firebaseAuth.verifyFirebaseToken`, request object contains:
```javascript
req.userId        // MySQL user ID (1-based integer)
req.firebaseUid   // Firebase UID (string, 128 chars max)
req.userEmail     // User email (string)
req.userType      // User type: "founder", "investor", or "admin"
```

Controllers and other middlewares can safely access these values.

---

## Testing Instructions

### 1. Manual Testing with cURL

**Setup:** Have Firebase project credentials in `.env` and Firebase user created

#### Test Profile Verification
```bash
# Get Firebase ID token (from Firebase Console → Authentication → Users → Copy ID token)
export FIREBASE_TOKEN="your_firebase_id_token_here"

# Test /api/auth/profile endpoint
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -H "Content-Type: application/json"
```

Expected: 200 with user profile (or 401 if no MySQL user yet)

#### Test Registration
```bash
export FIREBASE_TOKEN="your_firebase_id_token_here"

curl -X POST http://localhost:5000/api/auth/register \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "companyName": "Acme Inc",
    "phoneNumber": "+1234567890"
  }'
```

Expected: 201 with new user profile

#### Test Login
```bash
export FIREBASE_TOKEN="your_firebase_id_token_here"

curl -X POST http://localhost:5000/api/auth/login \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: 200 with user profile

---

### 2. Automated Integration Tests (Coming in STEP 7)

Full test suite will include:
- Create Firebase user
- Get Firebase ID token
- Register profile
- Login
- Verify email
- Logout
- Access protected endpoints

---

## Migration Checklist

- [x] Updated auth controller with Firebase flow
- [x] Updated auth routes with Firebase middleware
- [x] Removed JWT generation (now Firebase ID tokens)
- [x] Added isEmailVerified tracking
- [x] Added firebase_uid lookup
- [x] Maintained backward compatibility with JWT routes elsewhere
- [ ] **NEXT:** Test with real Firebase project
- [ ] **NEXT (STEP 5):** Update user profile routes
- [ ] **NEXT (STEP 6):** Update campaign/investment routes
- [ ] **NEXT (STEP 7):** Add integration tests

---

## Common Issues & Solutions

### Issue: "No token provided!" on /api/auth/register

**Cause:** Frontend not sending Firebase ID token in Authorization header

**Solution:**
1. Frontend must create user in Firebase first (via Firebase SDK)
2. Frontend must get ID token: `const token = await user.getIdToken()`
3. Frontend must send in header: `Authorization: Bearer ${token}`

---

### Issue: "User not found in database" on /api/auth/login

**Cause:** User created Firebase account but hasn't registered profile yet

**Solution:**
1. User must call POST /api/auth/register first to create MySQL profile
2. Then can use POST /api/auth/login

**Two-Step Flow:**
```
Step 1: Frontend creates Firebase user + calls /api/auth/register
Step 2: Frontend uses /api/auth/login for subsequent logins
```

---

### Issue: "Invalid or expired token" on any endpoint

**Cause:** Firebase ID token expired (1 hour default) or invalid signature

**Solution:**
1. Frontend must refresh token: `await user.getIdToken(true)`
2. Frontend uses fresh token for requests
3. OR: User logs in again to get fresh token

---

## Next Steps: STEP 5

Update user profile routes to work with Firebase authentication:
- GET /api/users/:id – Fetch user profile
- PUT /api/users/:id – Update user profile
- GET /api/users/:id/kyc – KYC status
- POST /api/users/:id/kyc – Submit KYC
- PUT /api/users/:id/bank-details – Update bank info

Similar pattern: Replace `authJwt.verifyToken` with `firebaseAuth.verifyFirebaseToken`
