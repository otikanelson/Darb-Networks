# 🚀 Quick Start Guide

## Installation (3 Steps)

### 1️⃣ Install Dependencies
```powershell
cd frontend
npm install react-quill quill
```

### 2️⃣ Setup Database
```powershell
cd ../backend
node run-migration.js
node seed-25-campaigns-complete.js
```

### 3️⃣ Start Servers
```powershell
# Terminal 1
cd backend
npm start

# Terminal 2  
cd frontend
npm run dev
```

## ✅ Done!

Visit: http://localhost:5174

## Test Features

1. **Create Campaign**: `/pages/CreateCampaign`
   - 5-step form with rich text
   - Add milestones (optional)
   - Add team members (optional)

2. **View Campaigns**: `/dashboard`
   - Hover over cards to see video autoplay
   - Click to view details

3. **Check Database**:
   ```sql
   SELECT COUNT(*) FROM campaigns; -- Should show 25+
   SELECT * FROM campaign_milestones;
   SELECT * FROM campaign_collaborators;
   ```

## Files Changed

- ✅ Backend: campaign.controller.js
- ✅ Frontend: App.jsx, CampaignCard.jsx
- ✅ New: RichTextEditor.jsx, CreateCampaignNew.jsx
- ✅ Database: 2 new tables, updated columns

## Troubleshooting

**Migration error?**
```powershell
node run-migration.js
```

**Seed error?**
```powershell
node seed-25-campaigns-complete.js
```

**Dependencies error?**
```powershell
cd frontend
npm install react-quill quill --force
```

---

**Need help?** Check SETUP_COMPLETE.md for detailed instructions.
