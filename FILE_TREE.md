# Darb Network - Final Project Structure

```
darb-network/
├── backend/
│   ├── api/                              # API request handlers
│   ├── config/
│   │   ├── auth.config.js                # JWT configuration
│   │   ├── db.config.js                  # Database connection config
│   │   └── firebase.js                   # Firebase Admin SDK setup
│   ├── controllers/
│   │   ├── admin.controller.js           # Admin actions (approve/reject)
│   │   ├── auth.controller.js            # Auth endpoints
│   │   ├── campaign.controller.js        # Campaign CRUD
│   │   ├── investment.controller.js      # Investment/payment logic
│   │   ├── milestone.controller.js       # Milestone management
│   │   └── user.controller.js            # User profile endpoints
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 20250126-null-deprecated-fields.js  # Remove BVN, NIN, etc.
│   │   ├── schema.sql                    # Initial database schema
│   │   └── README.md                     # Database setup notes
│   ├── middlewares/
│   │   ├── auth.jwt.js                   # JWT verification
│   │   ├── verifySignUp.js               # Signup validation
│   │   ├── verifyCaptcha.js              # reCAPTCHA verification
│   │   └── corsMiddleware.js             # CORS configuration
│   ├── models/
│   │   ├── campaign.model.js             # Campaign schema
│   │   ├── investment.model.js           # Investment/payment schema
│   │   ├── milestone.model.js            # Milestone schema
│   │   └── user.model.js                 # User schema (note: BVN, NIN deprecated)
│   ├── routes/
│   │   ├── admin.routes.js               # Admin endpoints
│   │   ├── auth.routes.js                # Auth endpoints
│   │   ├── campaign.routes.js            # Campaign endpoints
│   │   ├── investment.routes.js          # Investment endpoints
│   │   ├── payment.routes.js             # Payment/webhook endpoints
│   │   └── user.routes.js                # User endpoints
│   ├── services/
│   │   ├── CampaignService.js            # Campaign business logic
│   │   ├── PaystackService.js            # Paystack integration
│   │   ├── campaignStatsService.js       # Campaign analytics
│   │   └── userService.js                # User operations
│   ├── tests/                            # Test files (if any)
│   ├── utils/
│   │   ├── http.js                       # sendError helper
│   │   ├── dataProtection.js             # Mask sensitive data
│   │   └── validation.js                 # Input validation helpers
│   ├── validators/
│   │   ├── auth.validator.js             # Auth request validation
│   │   ├── campaign.validator.js         # Campaign validation
│   │   └── user.validator.js             # User data validation
│   ├── .env.example                      # Environment template
│   ├── .gitignore
│   ├── FIREBASE_MIGRATION_*.md           # Migration documentation
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js                         # Express app entry point
│   └── vercel.json                       # Vercel serverless config
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       ├── Logo.png
│   │       ├── Logo2.png
│   │       ├── Logo3.png
│   │       ├── facebook.svg
│   │       ├── instagram.svg
│   │       ├── linkedin.svg
│   │       ├── twitter.svg
│   │       ├── featured-bg.png
│   │       ├── pattern.png
│   │       ├── placeholder-campaign.jpg
│   │       └── placeholder-image.jpg
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbars.jsx           # Unified navbar with search
│   │   │   │   └── Footer.jsx            # Footer with links
│   │   │   ├── sections/
│   │   │   │   ├── HeroSection.jsx       # (Updated: honest copy)
│   │   │   │   ├── SocialProofStrip.jsx  # (Rewritten: "What's Built")
│   │   │   │   ├── FeaturedStartups.jsx
│   │   │   │   ├── FeaturesSection.jsx   # (Updated: real features only)
│   │   │   │   ├── HowItWorks.jsx
│   │   │   │   ├── UserCampaignsSection.jsx
│   │   │   │   ├── SplitCTA.jsx
│   │   │   │   └── CategoryTabs.jsx
│   │   │   ├── ui/
│   │   │   │   ├── CountrySelector.jsx
│   │   │   │   ├── WavingFlag.jsx
│   │   │   │   └── [other UI components]
│   │   │   ├── campaign/
│   │   │   │   ├── CampaignStepNav.jsx   # (Moved from root components)
│   │   │   │   ├── SaveStatusIndicator.jsx
│   │   │   │   └── RestoreDraftPrompt.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── MobileFilters.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── CampaignAnalytics.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx                  # (Updated: removed Testimonials, StartupConnection)
│   │   │   ├── Dashboard.jsx             # Browse campaigns
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx              # (Simplified: removed BVN, NIN, Account, Bank, Address)
│   │   │   ├── About.jsx                 # (Rewritten: honest project info)
│   │   │   ├── FAQ.jsx                   # (Rewritten: honest Q&A)
│   │   │   ├── PrivacyAndTerms.jsx       # (New: combined policy)
│   │   │   ├── Profile.jsx               # User profile
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── MyCampaigns.jsx
│   │   │   ├── CreateCampaign.jsx        # (Uses CampaignEditor)
│   │   │   ├── EditCampaign.jsx          # (Uses CampaignEditor)
│   │   │   ├── CampaignDisplay.jsx
│   │   │   ├── PaymentVerification.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           # Auth state & Firebase
│   │   │   └── TransitionContext.jsx     # Page transitions
│   │   ├── hooks/
│   │   │   ├── CustomNavigation.jsx
│   │   │   └── [other custom hooks]
│   │   ├── services/
│   │   │   ├── apiService.js             # Axios wrapper
│   │   │   ├── authService.js            # Auth API calls
│   │   │   ├── CampaignService.js        # Campaign API calls
│   │   │   ├── userService.js            # User API calls
│   │   │   └── index.js
│   │   ├── config/
│   │   │   ├── apiUrl.js                 # (New: single API URL source)
│   │   │   ├── apiConfig.js              # (Simplified: URL only)
│   │   │   └── [other config]
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── utils/
│   │   │   └── [utility functions]
│   │   ├── App.jsx                       # (Updated: routes, removed old pages)
│   │   ├── main.jsx                      # Entry point
│   │   └── index.css
│   ├── .env.example                      # Environment template
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── docs/
│   ├── project-notes.md                  # (Renamed from "Darb documetation.md")
│   └── dev-notes/
│       ├── SECURITY_CHECKLIST.md         # (Moved from root)
│       └── TESTING_CHECKLIST.md          # (Moved from root)
│
├── .gitignore                            # (Updated: .env, db.txt, dist/, *.env)
├── ENV_VARIABLES.md                      # (New: comprehensive env reference)
├── FILE_TREE.md                          # (This file)
├── README.md                             # (Rewritten: honest project showcase)
├── package.json                          # Root package (if monorepo setup)
└── [root-level config files removed]

## Deleted Files

The following files were removed during project wrap-up:

```
✓ REBUILD_TRIGGER
✓ tailwind.config.js (duplicate at root; kept frontend version)
✓ backend/.env
✓ backend/.env.production
✓ backend/database/db.txt
✓ frontend/.env
✓ frontend/src/pages/StartupConnection.jsx (not routed)
✓ frontend/src/pages/PrivacyPolicy.jsx (consolidated into PrivacyAndTerms)
✓ frontend/src/pages/TermsOfService.jsx (consolidated into PrivacyAndTerms)
✓ frontend/src/services/LocalStorageService.js (unused)
✓ frontend/src/services/AppInitializer.js (unused)
✓ frontend/src/services/paymentService.js (simulated payment fallback)
✓ frontend/src/components/sections/Testimonials.jsx (fictional)
✓ frontend/public/assets/AgroSmart.png (sample startup)
✓ frontend/public/assets/Aihealth.jpg (sample startup)
✓ frontend/public/assets/EcoVehicle.webp (sample startup)
✓ frontend/public/assets/og-tfgm-ev-1200x627.jpg (third-party image)
✓ backend/services/investmentServices.js (frontend code in backend)
✓ backend/database/schema-railway.sql (kept schema.sql)
✓ backend/scripts/security-smoke-test.sh (kept .js version)
✓ SECURITY_CHECKLIST.md (moved to docs/dev-notes/)
✓ STEP6_TESTING_CHECKLIST.md (moved to docs/dev-notes/)
✓ DATABASE_SETUP.md, FIREBASE_MIGRATION_STEP1-7.md, etc. (obsolete)
✓ PAYSTACK_*.md, QUICK_START.txt, etc. (status/temp files)
```

## Key Statistics

- **Backend routes:** ~40 endpoints across 6 route files
- **Frontend pages:** 18 public + protected routes
- **Components:** ~50 reusable components
- **Database:** 4 main tables (users, campaigns, investments, milestones)
- **Lines of code:** ~15,000 (backend + frontend combined)

## Updated for Concept Project Status

- ✅ Honest messaging (badge, hero, about, FAQ)
- ✅ Removed unnecessary personal data collection (BVN, NIN, etc.)
- ✅ Simplified registration form
- ✅ Clear "What's Built" section
- ✅ Combined Privacy & Terms in one page
- ✅ Removed fictional testimonials and fake stats
- ✅ Updated footer with true attribution
- ✅ Comprehensive README for portfolio showcase
