# Installation Guide - Campaign Enhancement Features

## Prerequisites
- Node.js installed
- MySQL database running
- Backend and frontend projects set up

## Step-by-Step Installation

### 1. Install Frontend Dependencies
```powershell
cd frontend
npm install react-quill quill
```

### 2. Run Database Migration
```powershell
cd backend
node run-migration.js
```

This will:
- Add `image_url` and `video_url` to campaign_milestones table
- Create campaign_collaborators table
- Update campaigns table text fields to LONGTEXT

### 3. Seed Database with 25 Campaigns
```powershell
cd backend
node seed-25-campaigns-complete.js
```

This will create 25 diverse campaigns with:
- 3 detailed campaigns with milestones and collaborators
- 22 additional campaigns with varied data
- YouTube video URLs
- Random funding amounts

### 4. Restart Backend Server
```powershell
cd backend
npm start
```

### 5. Restart Frontend Server
```powershell
cd frontend
npm run dev
```

## Verification

### Check Database Tables
```powershell
# In MySQL
USE darb_network_db;
SHOW TABLES LIKE '%milestone%';
SHOW TABLES LIKE '%collaborator%';
SELECT COUNT(*) FROM campaigns;
```

### Test Features

1. **Create Campaign**
   - Navigate to `/pages/CreateCampaign`
   - Fill in all 5 steps
   - Add milestones (optional)
   - Add team members (optional)
   - Use rich text formatting
   - Submit campaign

2. **View Campaign**
   - Go to dashboard
   - Click on any campaign
   - Verify milestones display
   - Verify team members display
   - Check rich text rendering

3. **Video Autoplay**
   - Hover over campaign cards
   - Verify video plays automatically
   - Verify video stops on mouse leave

## Troubleshooting

### Issue: react-quill not found
```powershell
cd frontend
npm install react-quill quill --save
```

### Issue: Migration fails
Check if tables already exist:
```sql
DROP TABLE IF EXISTS campaign_collaborators;
DROP TABLE IF EXISTS campaign_milestones;
```
Then run migration again.

### Issue: Seed script fails
Make sure you have at least one founder user:
```sql
SELECT * FROM users WHERE userType = 'founder';
```

### Issue: Videos not autoplaying
- Check browser console for errors
- Verify YouTube URL format
- Some browsers block autoplay (expected behavior)

## Files Modified

### Backend
✅ `backend/controllers/campaign.controller.js` - Added milestone/collaborator support
✅ `backend/controllers/campaign-milestones-collaborators.js` - Helper functions
✅ `backend/run-migration.js` - Migration script
✅ `backend/seed-25-campaigns-complete.js` - Seed script

### Frontend
✅ `frontend/src/App.jsx` - Updated to use CreateCampaignNew
✅ `frontend/src/components/ui/RichTextEditor.jsx` - New component
✅ `frontend/src/pages/CreateCampaignNew.jsx` - New multi-step form
✅ `frontend/src/components/ui/CampaignCard.jsx` - Video autoplay

## Next Steps

1. Update CampaignDisplay.jsx to show milestones and collaborators
2. Test all features thoroughly
3. Customize styling as needed
4. Add image upload for milestones (optional)
5. Add profile images for collaborators (optional)

## Support

If you encounter any issues:
1. Check the console for errors
2. Verify database connection
3. Ensure all dependencies are installed
4. Check that migration ran successfully
