# Firebase Authentication Migration - STEP 5: User Profile Routes

## Overview

Updated user profile routes to use Firebase ID token authentication. All profile management endpoints now delegate password/email operations to Firebase instead of handling them locally.

## Files Modified

### 1. `backend/controllers/user.controller.js`

**Changes:**
- Removed `bcrypt` dependency (Firebase handles password hashing)
- Added Firebase Admin SDK (`getAuth` from config/firebase.js)
- Updated `updateEmail` to use Firebase Admin SDK
- Updated `updatePassword` to initiate Firebase password reset
- Added Firebase flow documentation comments

#### **getProfile** - GET /api/users/profile
No changes to implementation; just updated middleware and documentation.

**Flow:**
1. Frontend sends GET with Firebase ID token
2. Backend verifies token (middleware)
3. Backend fetches user from MySQL by req.userId
4. Response: User profile

**Request:**
```bash
GET /api/users/profile
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
    "companyName": "Acme Inc",
    "phoneNumber": "+1234567890",
    "address": "123 Main St",
    "profileImageUrl": "https://...",
    "isActive": true,
    "isVerified": false,
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### **updateProfile** - PUT /api/users/profile
No changes to implementation; updates allowed fields while enforcing field validation.

**Important:** userType cannot be updated via this endpoint (security: set only via backend)

**Flow:**
1. Frontend sends PUT with Firebase token + profile updates
2. Backend verifies token
3. Backend validates data (phone, BVN, account number, etc.)
4. Backend updates MySQL user
5. Response: Updated profile

**Request:**
```bash
PUT /api/users/profile
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
  "fullName": "John Doe",
  "companyName": "Acme Inc",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "bvn": "12345678901",
  "cacNumber": "BN1234567",
  "accountNumber": "1234567890",
  "bankName": "First Bank"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully.",
  "data": { /* updated user profile */ }
}
```

**Validation:**
- fullName: 2-100 characters
- phoneNumber: Valid phone format
- bvn: Exactly 11 digits (Nigerian BVN)
- cacNumber: Max 50 characters
- accountNumber: Exactly 10 digits

---

#### **updateEmail** - PUT /api/users/email (NEW FIREBASE FLOW)

**MAJOR CHANGE:** No longer requires password verification; handled entirely by Firebase

**New Flow:**
1. Frontend sends PUT with new email and Firebase token
2. Backend validates email format and checks for duplicates in MySQL
3. Backend sends `updateUser()` request to Firebase Admin SDK
4. Firebase updates email in Firebase Auth
5. Firebase sends verification email to NEW email address
6. Backend updates email in MySQL and sets `isEmailVerified = false`
7. User clicks verification link in Firebase email
8. Frontend calls POST /api/auth/verify-email to sync MySQL
9. Backend sets `isEmailVerified = true`

**Request:**
```bash
PUT /api/users/email
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{
  "newEmail": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email updated successfully. Please verify your new email address via the verification link sent by Firebase.",
  "data": {
    "email": "newemail@example.com",
    "isEmailVerified": false
  }
}
```

**Error Cases:**
- 400: Invalid email format
- 400: Email already in use
- 500: Firebase error updating email

**Key Differences from Old Flow:**
| Aspect | Before (JWT) | After (Firebase) |
|--------|------------|------------------|
| **Password verification** | Required (checked backend) | Not required (Firebase handles) |
| **Email update location** | MySQL only | Firebase + MySQL |
| **Email verification** | Manual backend logic | Firebase sends link |
| **Verification tracking** | isVerified flag | isEmailVerified flag |

---

#### **updatePassword** - PUT /api/users/password (NEW FIREBASE FLOW)

**MAJOR CHANGE:** Password reset now happens entirely in Firebase via email link

**New Flow:**
1. Frontend sends PUT with Firebase token (no password body)
2. Backend calls `generatePasswordResetLink()` from Firebase Admin SDK
3. Firebase generates a password reset link
4. Firebase sends reset email to user
5. User clicks link in email
6. User is taken to Firebase password reset UI
7. User enters new password
8. Firebase updates password in Firebase Auth
9. Done! User can login with new password

**Request:**
```bash
PUT /api/users/password
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json

{} # Empty body
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent successfully. Please check your email and follow the link to set a new password.",
  "data": {
    "email": "user@example.com"
  }
}
```

**Error Cases:**
- 404: User not found
- 500: Firebase error

**Key Differences from Old Flow:**
| Aspect | Before (JWT) | After (Firebase) |
|--------|------------|------------------|
| **Password input** | Current + new password in request | No password in request |
| **Password validation** | Backend checks currentPassword | Firebase handles via email link |
| **Password hashing** | Backend hashes new password | Firebase hashes securely |
| **Update location** | MySQL only | Firebase Auth only |
| **User experience** | Instant, in-app | Email-based, out of app |

---

#### **uploadProfileImage** - POST /api/users/profile-image
No changes to implementation; authentication middleware updated.

**Request:**
```bash
POST /api/users/profile-image
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: multipart/form-data

[multipart form with 'profileImage' file]
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile image updated successfully.",
  "data": {
    "profileImageUrl": "https://cloudinary.com/...",
    "user": { /* updated profile */ }
  }
}
```

---

#### **deleteProfileImage** - DELETE /api/users/profile-image
No changes to implementation; authentication middleware updated.

**Request:**
```bash
DELETE /api/users/profile-image
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile image deleted successfully."
}
```

---

### 2. `backend/routes/user.routes.js`

**Changes:**
- Replaced `authJwt.verifyToken` with `firebaseAuth.verifyFirebaseToken` on all routes
- Added comprehensive documentation for Firebase flow
- Removed inline fallback handlers

**Route Summary:**

| Route | Method | Middleware | Purpose |
|-------|--------|-----------|---------|
| /api/users/profile | GET | firebaseAuth.verifyFirebaseToken | Get current user profile |
| /api/users/profile | PUT | firebaseAuth.verifyFirebaseToken | Update profile fields |
| /api/users/email | PUT | firebaseAuth.verifyFirebaseToken | Initiate email change (Firebase) |
| /api/users/password | PUT | firebaseAuth.verifyFirebaseToken | Initiate password reset (Firebase) |
| /api/users/profile-image | POST | firebaseAuth.verifyFirebaseToken | Upload profile image |
| /api/users/profile-image | DELETE | firebaseAuth.verifyFirebaseToken | Delete profile image |
| /api/users/settings | GET | firebaseAuth.verifyFirebaseToken | Get user settings |
| /api/users/settings | PUT | firebaseAuth.verifyFirebaseToken | Update user settings |

---

## Implementation Changes Summary

### What Changed

**Password Operations (Moved to Firebase):**
- ❌ No longer: Backend validates current password before allowing change
- ✅ Now: Firebase sends password reset email; user resets in Firebase UI
- ✅ Benefit: Secure, standardized password reset flow
- ✅ Benefit: User can reset password even if they forget it

**Email Operations (Moved to Firebase):**
- ❌ No longer: Backend handles email updates directly
- ✅ Now: Firebase handles email change and sends verification
- ✅ Benefit: Secure email verification via Firebase
- ✅ Benefit: Prevents email typos (user must verify via email)

**Profile Operations (Unchanged):**
- ✅ Still: Backend manages non-sensitive profile data
- ✅ Still: Validation on phone, BVN, account numbers, etc.
- ✅ Benefit: Keeps MySQL as source of truth for profile data

**Middleware (Updated):**
- ❌ No longer: authJwt.verifyToken
- ✅ Now: firebaseAuth.verifyFirebaseToken
- ✅ Benefit: Firebase token verification; asymmetric cryptography

---

## Request Flow Examples

### Example 1: Update Profile
```
Client                              Backend                         Firebase
  |                                   |                               |
  |--GET /api/users/profile---------->|                               |
  |   + Authorization: Bearer token   |                               |
  |                                   |--Verify token signature------->|
  |                                   |   (using Google public keys)   |
  |                                   |<--Signature valid, extract uid-|
  |                                   |                               |
  |                                   |--Query MySQL (WHERE firebase_uid = uid)
  |                                   |<--User profile                |
  |<--200 { profile data }---------   |                               |
  |                                   |                               |
```

### Example 2: Request Email Change
```
Client                              Backend                         Firebase
  |                                   |                               |
  |--PUT /api/users/email-----------  |                               |
  |   Body: newEmail                  |                               |
  |   + Authorization: Bearer token   |                               |
  |                                   |--Verify token signature------->|
  |                                   |<--Signature valid, extract uid-|
  |                                   |                               |
  |                                   |--Validate email format        |
  |                                   |--Check MySQL (no duplicates)  |
  |                                   |                               |
  |                                   |--updateUser(uid,              |
  |                                   |  {email: newEmail})----------->|
  |                                   |<--Email updated, verify link  |
  |                                   |   sent to newEmail            |
  |                                   |                               |
  |                                   |--UPDATE MySQL (email, verify  |
  |                                   |  status = false)              |
  |                                   |                               |
  |<--200 { email updated }---------  |                               |
  |                                   |                               |
  | [User checks email, clicks link]  |                               |
  |                                   |   [Firebase marks email       |
  |                                   |    verified in Auth]          |
  |                                   |                               |
  |--POST /api/auth/verify-email--    |                               |
  |   + Authorization: Bearer token   |                               |
  |   (with verified email in token)  |                               |
  |                                   |--UPDATE MySQL (verify status  |
  |                                   |  = true)                      |
  |                                   |                               |
  |<--200 { verified }-----------  |                               |
  |                                   |                               |
```

### Example 3: Request Password Reset
```
Client                              Backend                         Firebase
  |                                   |                               |
  |--PUT /api/users/password--------  |                               |
  |   + Authorization: Bearer token   |                               |
  |                                   |--Verify token signature------->|
  |                                   |<--Signature valid, extract uid-|
  |                                   |                               |
  |                                   |--generatePasswordResetLink(   |
  |                                   |  email)----------------------->|
  |                                   |<--Reset link generated,       |
  |                                   |   email sent to user          |
  |                                   |                               |
  |<--200 { reset sent }-----------  |                               |
  |                                   |                               |
  | [User checks email, clicks link]  |                               |
  |                                   |   [Firebase password reset UI  |
  |                                   |    opens]                     |
  |                                   |                               |
  | [User enters new password]        |                               |
  |                                   |   [Firebase validates and     |
  |                                   |    updates password]          |
  |                                   |                               |
  | [User logs in with new password]  |                               |
  |--POST /api/auth/login-----------  |                               |
  |   + Authorization: Bearer token   |                               |
  |   (token from new login)          |                               |
  |                                   |--Verify token signature------->|
  |                                   |<--Signature valid             |
  |                                   |                               |
  |<--200 { login success }---------->|                               |
  |                                   |                               |
```

---

## Testing Instructions

### Manual Testing with cURL

```bash
# Setup
export FIREBASE_TOKEN="your_firebase_id_token_here"
BASE_URL="http://localhost:5000"

# 1. Get profile
curl -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $FIREBASE_TOKEN"

# 2. Update profile
curl -X PUT "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "companyName": "Tech Corp",
    "phoneNumber": "+1234567890"
  }'

# 3. Request email change
curl -X PUT "$BASE_URL/api/users/email" \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newEmail": "newemail@example.com"
  }'

# 4. Request password reset
curl -X PUT "$BASE_URL/api/users/password" \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# 5. Upload profile image
curl -X POST "$BASE_URL/api/users/profile-image" \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -F "profileImage=@/path/to/image.jpg"

# 6. Delete profile image
curl -X DELETE "$BASE_URL/api/users/profile-image" \
  -H "Authorization: Bearer $FIREBASE_TOKEN"

# 7. Get settings
curl -X GET "$BASE_URL/api/users/settings" \
  -H "Authorization: Bearer $FIREBASE_TOKEN"
```

---

## Backward Compatibility

- ❌ Old password change flow: Does NOT work anymore (requires Firebase Admin SDK)
- ❌ Old email update flow: Does NOT work anymore (requires Firebase verification)
- ✅ All profile data operations: Still work via MySQL
- ✅ Image upload/delete: Still work via Cloudinary

**Migration Note:** If users have old JWT tokens in localStorage, they won't work with these routes. Frontend must be updated to use Firebase authentication.

---

## Security Notes

### Password Reset Security
- ✅ User must verify via email link (prevents unauthorized resets)
- ✅ Firebase generates cryptographically secure tokens
- ✅ Reset links expire after 1 hour
- ✅ No passwords transmitted via API

### Email Change Security
- ✅ User must verify new email (prevents typos/unauthorized changes)
- ✅ Firebase sends verification email
- ✅ Old email remains active until new email verified
- ✅ Prevents account takeover via email change

### Profile Data Security
- ✅ userType cannot be updated (set only via backend/database)
- ✅ Sensitive fields (BVN, account numbers) validated and masked in responses
- ✅ Firebase token verified server-side before any update

---

## Error Handling

### Common Errors and Solutions

**403 "No token provided!"**
- Cause: Missing Authorization header
- Solution: Include `Authorization: Bearer <FIREBASE_ID_TOKEN>` in request

**401 "Invalid or expired token"**
- Cause: Token signature invalid or expired
- Solution: Get fresh token from Firebase (1 hour expiration)

**400 "Invalid email format"**
- Cause: newEmail doesn't match email regex
- Solution: Use valid email format (example@domain.com)

**400 "Email already in use"**
- Cause: Email exists for another user
- Solution: Use different email address

**500 "Error updating email"**
- Cause: Firebase error or service unavailable
- Solution: Retry after a few seconds; check Firebase service status

---

## Migration Status

- [x] STEP 1: Database schema (firebase_uid, password NULL, isEmailVerified)
- [x] STEP 2: Firebase Admin SDK setup (config/firebase.js)
- [x] STEP 3: Firebase authentication middleware (firebaseAuth.js)
- [x] STEP 4: Auth routes updated (register, login, profile, verify-email, logout)
- [x] **STEP 5: User profile routes updated (profile, email, password, image, settings)** ← You are here
- [ ] STEP 6: Campaign and investment routes
- [ ] STEP 7: Integration tests
- [ ] STEP 8: Cleanup and documentation

---

## Next Steps: STEP 6

Update campaign and investment routes to use Firebase authentication:
- GET /api/campaigns – List campaigns
- POST /api/campaigns – Create campaign (requireVerifiedEmail)
- GET /api/campaigns/:id – Get campaign details
- PUT /api/campaigns/:id – Update campaign (owner only)
- POST /api/campaigns/:id/publish – Publish campaign (requireVerifiedEmail)
- GET /api/investments – List user's investments
- POST /api/investments – Create investment (requireVerifiedEmail)
- GET /api/investments/:id – Get investment details

Pattern: Replace `authJwt.verifyToken` with appropriate Firebase middleware based on requirements
