# Firebase Authentication Migration - STEP 3: Middleware

## Overview
Created Firebase authentication middleware (`backend/middlewares/firebaseAuth.js`) to verify Firebase ID tokens and attach authenticated user information to requests. The middleware replaces JWT-based auth with Firebase while maintaining backward compatibility through staged route updates.

## Files Created

### `backend/middlewares/firebaseAuth.js`
Four middleware functions for different authentication scenarios:

#### 1. **verifyFirebaseToken** (Required auth)
- Verifies Firebase ID token from `Authorization` header or `x-access-token` header
- Looks up user in MySQL by `firebase_uid`
- Returns 403 if no token; 401 if token invalid or user not found
- **Sets on request object:**
  - `req.userId` – MySQL user ID
  - `req.firebaseUid` – Firebase UID
  - `req.userEmail` – User email
  - `req.userType` – User type (founder/investor/admin)
- **Use case:** Protected endpoints requiring authenticated users with MySQL profile

#### 2. **verifyFirebaseTokenAllowNoProfile** (Auth without MySQL profile)
- Verifies Firebase ID token
- Does NOT require matching MySQL user; allows unregistered Firebase users
- Returns 403 if no token; 401 if token invalid
- **Sets on request object:**
  - `req.firebaseUid` – Firebase UID
  - `req.userEmail` – User email from Firebase (may be null)
  - `req.userId` – MySQL user ID (only if profile exists)
  - `req.userType` – User type (only if profile exists)
- **Use case:** Endpoints allowing Firebase users to create profiles or perform initial setup

#### 3. **optionalFirebaseToken** (Optional auth)
- Attempts to verify Firebase ID token
- Does NOT reject if no token; continues as unauthenticated user
- **Sets on request object:** Same as above, but all are optional
- **Use case:** Public endpoints that show different data for authenticated vs. guest users (e.g., campaign listings)

#### 4. **requireVerifiedEmail** (Email verification check)
- Verifies email is confirmed in `users.isEmailVerified`
- Returns 403 if email not verified
- **Must be used AFTER `verifyFirebaseToken`** in middleware chain
- **Use case:** Sensitive endpoints (e.g., investment creation, campaign publishing)

## Files Modified

### `backend/middlewares/index.js`
- Added export of `firebaseAuth` module
- Maintains existing `authJwt`, `verifySignUp`, `adminAuth` exports for backward compatibility

## Implementation Pattern

All middleware follows the same header extraction pattern as JWT middleware:
```javascript
let token = req.headers["x-access-token"] || req.headers["authorization"];
if (token && token.startsWith("Bearer ")) {
  token = token.slice(7);
}
```

## Token Verification Flow
1. Extract token from request headers
2. Call `verifyIdToken(token)` from `backend/config/firebase.js`
3. Firebase Admin SDK validates signature and expiration
4. On success, extract `firebase_uid` and `email` from decoded token
5. Query MySQL to find user by `firebase_uid`
6. Set request properties based on middleware type and lookup result

## Error Handling

| Scenario | Middleware | Status | Response |
|----------|-----------|--------|----------|
| No token | verifyFirebaseToken | 403 | "No token provided!" |
| Invalid/expired token | verifyFirebaseToken | 401 | "Invalid or expired token" |
| Token valid, no MySQL user | verifyFirebaseToken | 401 | "User not found in database" |
| Email not verified | requireVerifiedEmail | 403 | "Email verification required" |
| No token | optionalFirebaseToken | 200 | Continues (unauthenticated) |

## Usage Examples

### Protected endpoint requiring verified MySQL profile
```javascript
app.get(
  "/api/user/profile",
  [firebaseAuth.verifyFirebaseToken],
  controller.getProfile
);
```

### Endpoint allowing profile creation without existing MySQL user
```javascript
app.post(
  "/api/user/create-profile",
  [firebaseAuth.verifyFirebaseTokenAllowNoProfile],
  controller.createProfile
);
```

### Public endpoint with optional authentication
```javascript
app.get(
  "/api/campaigns",
  [firebaseAuth.optionalFirebaseToken],
  controller.getCampaigns  // Can access req.userId if authenticated
);
```

### Sensitive endpoint requiring verified email
```javascript
app.post(
  "/api/investments/create",
  [firebaseAuth.verifyFirebaseToken, firebaseAuth.requireVerifiedEmail],
  controller.createInvestment
);
```

## Migration Strategy (Next Steps)

The JWT middleware (`backend/middlewares/auth.jwt.js`) remains in place for backward compatibility. Routes can be migrated incrementally:

1. **Phase 1 (STEP 4):** Update auth routes (register, login, profile, verify-email, logout)
2. **Phase 2 (STEP 5):** Update user routes (profile management)
3. **Phase 3 (STEP 6):** Update campaign routes
4. **Phase 4 (STEP 7):** Update investment routes
5. **Phase 5 (STEP 8):** Update admin routes

After all routes are migrated, `auth.jwt.js` can be removed in a cleanup step.

## Testing Instructions

### 1. Verify middleware loads without errors
```bash
node -e "require('./backend/middlewares/firebaseAuth'); console.log('✅ Middleware loaded')"
```

### 2. Verify middleware is exported from index
```bash
node -e "const m = require('./backend/middlewares'); console.log('firebaseAuth' in m ? '✅ firebaseAuth exported' : '❌ Not exported')"
```

### 3. Full integration test (requires STEP 4 - Firebase-enabled auth routes)
- Once routes are updated in STEP 4, test by:
  1. Create a Firebase user via Frontend/Firebase Console
  2. Get Firebase ID token (Frontend will do this automatically)
  3. Call protected endpoint with token: 
     ```bash
     curl -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" http://localhost:5000/api/auth/profile
     ```
  4. Expected: 200 with user profile (after creating MySQL user in profile creation endpoint)

## Backward Compatibility

- **JWT middleware remains intact** for gradual migration
- Routes can use Firebase auth OR JWT auth independently
- Database supports both `password` (JWT) and `firebase_uid` (Firebase)
- Transition is non-breaking; old routes continue to work

## Security Notes

- Firebase Admin SDK verifies token signature using Google's public keys (automatically managed)
- Tokens have configurable expiration (default 1 hour)
- Token verification is done server-side; no client-side token validation
- `firebase_uid` is unique in database; prevents duplicate Firebase accounts
- MySQL profile creation rate-limited via standard app auth flow (not in middleware)

## Next Step: STEP 4

Update auth routes to use Firebase authentication:
- `/api/auth/register` – Firebase signup endpoint
- `/api/auth/login` – Firebase login endpoint  
- `/api/auth/profile` – Firebase token verification
- `/api/auth/verify-email` – Firebase email verification status
- `/api/auth/logout` – Firebase session cleanup (if applicable)
