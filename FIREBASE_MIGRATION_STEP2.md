# Firebase Authentication Migration - STEP 2: Backend Firebase Setup ✅ COMPLETE

## What Was Done

### 1. Installed firebase-admin Package ✅
```bash
npm install --save firebase-admin@14.5.1
```

**Purpose:** Firebase Admin SDK for server-side authentication verification, user import, and management

---

### 2. Created Firebase Configuration File ✅
**File:** `backend/config/firebase.js`

**Key Functions:**

```javascript
initializeFirebase()
  - Initializes Firebase Admin SDK once
  - Reuses app if already initialized (serverless safe)
  - Validates all required environment variables
  - Throws clear error messages if setup incomplete

getAuth()
  - Returns Firebase Auth instance
  - Used internally by other functions

verifyIdToken(token)
  - Called on every authenticated request
  - Verifies Firebase ID token is valid and not expired
  - Returns { uid, email, emailVerified }
  - Throws helpful error messages for different failure types

createUser(userRecord)
  - Creates new user in Firebase
  - Used when setting up manual admin accounts

importUsers(users, hashOptions)
  - Imports existing users from MySQL to Firebase
  - Preserves passwords using bcrypt hash
  - Safe for serverless environments

getUserByEmail(email)
  - Looks up user by email in Firebase
  - Returns null if not found

deleteUser(uid)
  - Deletes a Firebase user

setCustomClaims(uid, claims)
  - Sets custom claims (e.g., for admin role)
```

**Design Principles:**
- ✅ Serverless-safe: Initializes Firebase app only once and reuses it
- ✅ Clear errors: Tells you exactly what's missing and how to fix it
- ✅ Flexible: Supports both token verification and user management
- ✅ Logging: Console output for debugging and monitoring

---

### 3. Added Firebase Environment Variables ✅
**File:** `backend/.env.example`

```bash
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

**What You'll Get from Firebase:**
1. Go to Firebase Console
2. Project Settings (gear icon) → Service Accounts
3. Click "Generate New Private Key"
4. Download the JSON file
5. Extract these three values from the JSON

---

## How to Get Firebase Credentials

### Step-by-Step:

1. **Go to Firebase Console:** https://console.firebase.google.com/

2. **Select or Create Your Project**
   - Click on your project name or "Create new project"

3. **Navigate to Service Accounts:**
   - Click ⚙️ (Settings) in top left
   - Select "Service Accounts" tab

4. **Generate Private Key:**
   - Click "Generate New Private Key"
   - A JSON file downloads with your credentials

5. **Extract Values from JSON:**
   ```json
   {
     "type": "service_account",
     "project_id": "darb-networks-xxxxx",          // → FIREBASE_PROJECT_ID
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  // → FIREBASE_PRIVATE_KEY
     "client_email": "firebase-adminsdk-xxxxx@...",  // → FIREBASE_CLIENT_EMAIL
     "client_id": "...",
     "auth_uri": "...",
     ...
   }
   ```

6. **Add to .env:**
   ```bash
   FIREBASE_PROJECT_ID=darb-networks-xxxxx
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@darb-networks-xxxxx.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n
   ```

---

## How to Test

### 1. Verify Installation
```bash
cd backend
npm list firebase-admin
# Should show: firebase-admin@14.5.1
```

### 2. Test Firebase Configuration
Create a test file `backend/test-firebase.js`:

```javascript
const firebase = require('./config/firebase');

async function test() {
  try {
    console.log('Testing Firebase initialization...');
    firebase.initializeFirebase();
    console.log('✅ Firebase initialized successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
```

Run it:
```bash
node backend/test-firebase.js
```

**Expected output:**
```
Testing Firebase initialization...
✅ Firebase Admin SDK initialized successfully
📱 Project: darb-networks-xxxxx
✅ Firebase initialized successfully!
```

### 3. Verify Token Verification Works
You'll need a valid Firebase ID token from the frontend. For now, the key test is that the config loads without errors.

---

## Important Notes

### Private Key Format
The private key in your JSON file has real newlines. When you paste it into `.env`, convert them to literal `\n`:

**Wrong:**
```bash
# This will fail - newlines break the env file
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQE...
-----END PRIVATE KEY-----
```

**Correct:**
```bash
# Literal \n works with the convert logic in firebase.js
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n
```

The code in `firebase.js` automatically converts `\n` to real newlines:
```javascript
const convertedPrivateKey = privateKey.replace(/\\n/g, '\n');
```

### Serverless Safety
In Vercel (serverless), Firebase initializes once and reuses the app:
```javascript
if (firebaseApp) {
  return firebaseApp;  // Reuse - don't reinitialize
}
```

This prevents errors from initializing Firebase multiple times in cold starts.

---

## Error Troubleshooting

| Error | Solution |
|-------|----------|
| `FIREBASE_PROJECT_ID is not set` | Add to `.env`: `FIREBASE_PROJECT_ID=your-project-id` |
| `FIREBASE_CLIENT_EMAIL is not set` | Add to `.env`: `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...` |
| `FIREBASE_PRIVATE_KEY is not set` | Add to `.env`: `FIREBASE_PRIVATE_KEY=-----BEGIN...` |
| `Failed to initialize Firebase` | Check that all three env vars are correct. Restart server. |
| `Invalid private key` | Make sure newlines in private key are `\n` (literal), not real line breaks |

---

## Next Step: STEP 3 - Firebase Auth Middleware

After confirming Firebase setup works, we'll create:
1. `backend/middlewares/firebaseAuth.js` - Token verification middleware
2. Update routes to use Firebase instead of JWT
3. Implement profile creation endpoint

---

## Files Created/Modified

✅ `backend/config/firebase.js` (NEW) - Firebase configuration
✅ `backend/.env.example` (UPDATED) - Added Firebase env vars
✅ `backend/package.json` (UPDATED) - firebase-admin@14.5.1 added

---

## Status

🟢 **STEP 2 COMPLETE**

Firebase Admin SDK is installed and configured. Backend is ready to verify Firebase ID tokens and manage users.

**Next step:** Say "next" when ready for STEP 3 (Create Firebase auth middleware).

---

## What You Need to Do

1. ✅ Firebase-admin is installed (done)
2. ✅ Config file created (done)
3. ⏳ **Get your Firebase credentials:**
   - Go to Firebase Console
   - Project Settings → Service Accounts
   - Generate and download Private Key JSON
   - Extract the 3 values (project ID, client email, private key)
   - Add them to your `.env` file

4. ⏳ **Test the setup:**
   ```bash
   node backend/test-firebase.js
   ```
   Should print: "✅ Firebase initialized successfully!"

Once you have the credentials in `.env` and the test passes, say **"next"** for STEP 3.
