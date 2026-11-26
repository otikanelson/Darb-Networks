# Firebase Setup Checklist - What to Get from Firebase Console

## 🔐 Complete Firebase Configuration Guide

This guide tells you exactly what Firebase credentials you need to gather and add to your `.env` file to complete the migration.

---

## ✅ STEP 1: Access Firebase Console

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Sign in with your Google account
3. Click on your **Darb Networks** Firebase project (or create one if you haven't already)
4. You should see the Firebase Dashboard

---

## ✅ STEP 2: Create a Service Account (Firebase Admin SDK Credentials)

**What is a Service Account?**
A service account is a special Firebase account that lets your backend authenticate with Firebase. It's NOT for end users.

**How to Get It:**

1. In Firebase Console, go to **Project Settings** (gear icon ⚙️ → Project Settings)
2. Click on **Service Accounts** tab
3. You'll see three options at the top:
   - Firebase Admin SDK
   - Google Cloud Platform
   - Service accounts

4. Under "Firebase Admin SDK", click the button **"Generate New Private Key"**
5. A JSON file will download to your computer

**Important:** Keep this file secure! It contains your private key.

---

## 📋 STEP 3: Extract These Credentials from the Downloaded JSON File

Open the downloaded JSON file (it looks like `darb-networks-xxxxxxx.json`).

You'll see something like this:

```json
{
  "type": "service_account",
  "project_id": "darb-networks-xxxxx",
  "private_key_id": "xxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...many lines...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@darb-networks-xxxxx.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://accounts.google.com/o/oauth2/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

**Extract These Three Values:**

### 1️⃣ FIREBASE_PROJECT_ID
**Find it:** `"project_id": "darb-networks-xxxxx"`

**Copy:** The value after the colon (without quotes)

**Example:** `darb-networks-12345`

```
FIREBASE_PROJECT_ID=darb-networks-12345
```

---

### 2️⃣ FIREBASE_CLIENT_EMAIL
**Find it:** `"client_email": "firebase-adminsdk-xxxxx@darb-networks-xxxxx.iam.gserviceaccount.com"`

**Copy:** The entire email address (without quotes)

**Example:** `firebase-adminsdk-abcde@darb-networks-12345.iam.gserviceaccount.com`

```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abcde@darb-networks-12345.iam.gserviceaccount.com
```

---

### 3️⃣ FIREBASE_PRIVATE_KEY
**Find it:** `"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC..."`

**Copy:** Everything from `-----BEGIN PRIVATE KEY-----` to `-----END PRIVATE KEY-----` (including the newlines)

⚠️ **IMPORTANT:** The newlines are represented as `\n` (backslash-n) in the JSON. When you copy this into `.env`, keep them as literal `\n` characters. The backend code will automatically convert them.

**Example:**
```
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7x8f9xK8p+9eD\n5F8f9xK8p+9eD5F8f9xK8p+9eD5F8f9xK8p+9eD5F8f9xK8p+9eD5F8f9xK8p+9e\nD5F8f9xK8p+9eD5F8f9xK8p+9eD5F8f9xK8p+9eD5F8f9xK8p+9eD5F8f9xK8p+9eD\n-----END PRIVATE KEY-----\n
```

**Do NOT convert `\n` to actual newlines!** The backend handles this automatically.

---

## 🔍 STEP 4: Add Credentials to .env File

Create or update `backend/.env`:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=darb-networks-12345
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abcde@darb-networks-12345.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7x8f9xK8p+9eD\n...many lines...\n-----END PRIVATE KEY-----\n

# Other existing config
DATABASE_URL=mysql://...
JWT_SECRET=...
# ... rest of your .env
```

---

## ✅ STEP 5: Verify Configuration Works

Run this test:

```bash
# Test Firebase Admin SDK initialization
node -e "const { getAuth } = require('./backend/config/firebase'); const auth = getAuth(); console.log('✅ Firebase Admin SDK initialized successfully'); console.log('Project:', process.env.FIREBASE_PROJECT_ID);"
```

**Expected Output:**
```
✅ Firebase Admin SDK initialized successfully
Project: darb-networks-12345
```

**If you get an error:** Check your credentials are correct in `.env`

---

## ✅ STEP 6: Enable Firebase Authentication Methods

In Firebase Console:

1. Go to **Authentication** (left sidebar)
2. Click **Get Started**
3. Enable **Email/Password** sign-in method:
   - Click "Email/Password"
   - Toggle **Enabled** to ON
   - Click **Save**
4. (Optional) Enable **Google Sign-In**:
   - Click "Google"
   - Toggle **Enabled** to ON
   - Select a **Support Email**
   - Click **Save**
5. (Optional) Enable other OAuth providers as needed

---

## ✅ STEP 7: Configure Application Settings (Frontend)

You also need Firebase credentials for your frontend (different from backend credentials).

In Firebase Console:

1. Go to **Project Settings** (⚙️ → Project Settings)
2. Click **General** tab
3. Scroll down to **Your Apps** section
4. Click the web app icon (`</>`), or if no app exists, click **Add App**
5. Name it **Darb Networks Web** (or similar)
6. Copy the Firebase config object:

```javascript
{
  "apiKey": "AIza...",
  "authDomain": "darb-networks-xxxxx.firebaseapp.com",
  "projectId": "darb-networks-xxxxx",
  "storageBucket": "darb-networks-xxxxx.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef123456"
}
```

**Add to `frontend/.env.local`:**
```
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=darb-networks-xxxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=darb-networks-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=darb-networks-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

---

## ✅ STEP 8: Run Integration Tests

```bash
# Install test dependencies
npm install --save-dev jest supertest

# Run Firebase integration tests
npm run test:firebase

# Expected output: All tests passing ✅
```

---

## ✅ STEP 9: Test Authentication Flow Locally

1. **Start backend:**
   ```bash
   npm run dev
   ```

2. **Create test Firebase user:**
   - Go to Firebase Console → Authentication → Users
   - Click "Add User"
   - Email: `test@example.com`
   - Password: `TestPassword123`
   - Click "Add User"

3. **Test registration endpoint:**
   ```bash
   # Get Firebase ID token (Firebase Console → Authentication → Users → Copy ID token)
   export FIREBASE_TOKEN="your_id_token_here"
   
   # Test /api/auth/profile
   curl -X GET http://localhost:5000/api/auth/profile \
     -H "Authorization: Bearer $FIREBASE_TOKEN"
   
   # Expected: 401 (user not in MySQL yet) or 200 (if already registered)
   ```

4. **Register profile:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Authorization: Bearer $FIREBASE_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "Test User",
       "phoneNumber": "+1234567890"
     }'
   
   # Expected: 201 (profile created)
   ```

---

## ⚠️ Security Reminders

### DO:
- ✅ Keep `FIREBASE_PRIVATE_KEY` secret
- ✅ Never commit `.env` file to git
- ✅ Use `.env.local` for local development
- ✅ Restrict Firebase credentials to backend only
- ✅ Use separate credentials for staging/production

### DON'T:
- ❌ Share private key in Slack/email
- ❌ Commit `.env` to version control
- ❌ Use same credentials for frontend
- ❌ Expose private key in logs/errors
- ❌ Use test credentials in production

---

## 🐛 Troubleshooting

### Error: "Firebase Admin SDK is not initialized"
**Cause:** Missing Firebase credentials in `.env`

**Solution:**
1. Check `.env` file has three variables set
2. Restart backend: `npm run dev`
3. Run test: `node -e "const { getAuth } = require('./backend/config/firebase'); getAuth();"`

---

### Error: "Invalid private key"
**Cause:** Newline characters not formatted correctly

**Solution:**
1. Ensure private key has `\n` (literal backslash-n), not actual newlines
2. The backend will convert `\n` to real newlines automatically
3. Example: `FIREBASE_PRIVATE_KEY=-----BEGIN...\nMIIEvQ...\n-----END...\n`

---

### Error: "Project ID not found"
**Cause:** `FIREBASE_PROJECT_ID` not in `.env` or incorrect value

**Solution:**
1. Check Firebase Console → Project Settings → Project ID
2. Copy exact value
3. Add to `.env`: `FIREBASE_PROJECT_ID=darb-networks-xxxxx`

---

### Error: "Client email is invalid"
**Cause:** `FIREBASE_CLIENT_EMAIL` incorrect or missing

**Solution:**
1. Check it's the SERVICE ACCOUNT email, not user email
2. Should end with `@darb-networks-xxxxx.iam.gserviceaccount.com`
3. Copy from Firebase Console → Service Accounts → Client email

---

### Test Shows: "Invalid or expired token"
**Cause:** Firebase token is old or corrupted

**Solution:**
1. Get fresh token from Firebase Console → Authentication → Users → Copy ID token
2. Token expires after 1 hour
3. For testing, generate new token each time

---

## 📋 Quick Checklist

Before moving to staging:

- [ ] Downloaded JSON file from Firebase Console
- [ ] Extracted FIREBASE_PROJECT_ID
- [ ] Extracted FIREBASE_CLIENT_EMAIL
- [ ] Extracted FIREBASE_PRIVATE_KEY (with literal `\n`)
- [ ] Added all three to backend/.env
- [ ] Tested with `node -e "const { getAuth } = require('./backend/config/firebase'); getAuth();"`
- [ ] Ran integration tests: `npm run test:firebase`
- [ ] All tests passing ✅
- [ ] Enabled Email/Password in Firebase Authentication
- [ ] Created web app for frontend
- [ ] Added frontend Firebase config to frontend/.env.local
- [ ] Can create test users in Firebase Console
- [ ] Can verify token with /api/auth/profile endpoint

---

## 🎉 You're Ready!

Once you've completed all these steps:

1. ✅ Backend can verify Firebase tokens
2. ✅ Users can register and create profiles
3. ✅ Email verification is tracked
4. ✅ All routes use Firebase authentication
5. ✅ Integration tests are passing

**Next:** Update your frontend to use Firebase SDK and deploy to staging!

---

## 📚 Additional Resources

- **Firebase Admin SDK Docs:** https://firebase.google.com/docs/admin/setup
- **Firebase Authentication Docs:** https://firebase.google.com/docs/auth
- **Service Accounts:** https://firebase.google.com/docs/admin/setup#service_account
- **Frontend Integration:** See `frontend/FIREBASE_AUTH_GUIDE.md` in this repo

---

## 📞 Still Have Questions?

1. Check `backend/FIREBASE_MIGRATION_COMPLETE.md` for overview
2. Review `backend/FIREBASE_MIGRATION_STEP2.md` for detailed setup
3. See `backend/FIREBASE_MIGRATION_STEP8.md` for troubleshooting
4. Check individual STEP files for specific issues
