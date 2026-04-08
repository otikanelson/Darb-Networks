# Campaign Enhancement Implementation Plan

## Overview
This document outlines the implementation plan for adding milestones, collaborators, rich text editing, and video autoplay features to the campaign system.

## Database Changes

### 1. Migration File Created
- **File**: `backend/database/migrations/add-milestones-collaborators.sql`
- **Changes**:
  - Added `image_url` and `video_url` to `campaign_milestones` table
  - Created new `campaign_collaborators` table with fields:
    - name, role, description
    - email, phoneNumber
    - profile_image_url, linkedin_url
    - order_index for sorting
  - Modified campaigns table text fields to LONGTEXT for rich text content

### 2. Run Migration
```bash
cd backend
mysql -u your_user -p darb_network_db < database/migrations/add-milestones-collaborators.sql
```

## Frontend Changes Needed

### 1. Install Rich Text Editor
```bash
cd frontend
npm install react-quill quill
```

### 2. CreateCampaign Component Updates
- Add two new steps to the multi-step form:
  - **Step 4: Milestones** (optional)
    - Add/remove milestone entries
    - Each milestone: title, description, target amount, image, video URL
  - **Step 5: Team/Collaborators** (optional)
    - Add/remove team member entries
    - Each member: name, role, description, email, phone

### 3. Rich Text Editor Integration
- Replace textarea fields with React Quill editor for:
  - description
  - problem_statement
  - solution
  - business_plan

### 4. Campaign Card Video Autoplay
- Update CampaignCard component to:
  - Show video thumbnail by default
  - On hover: autoplay YouTube video (muted)
  - On hover out: pause and show thumbnail again

### 5. Backend API Updates Needed
- Update campaign controller to handle:
  - Milestones array in create/update
  - Collaborators array in create/update
  - Rich text HTML content

## Implementation Steps

### Phase 1: Database (COMPLETED)
✅ Created migration file
⏳ Run migration on database

### Phase 2: Backend API
1. Update campaign controller to accept milestones array
2. Update campaign controller to accept collaborators array
3. Add validation for new fields
4. Update campaign response to include milestones and collaborators

### Phase 3: Frontend - Rich Text
1. Install react-quill
2. Create RichTextEditor component wrapper
3. Update CreateCampaign to use RichTextEditor
4. Update CampaignDisplay to render HTML content

### Phase 4: Frontend - Multi-step Form
1. Add Milestones step to CreateCampaign
2. Add Collaborators step to CreateCampaign
3. Make both steps optional (skip button)
4. Add form validation

### Phase 5: Frontend - Video Autoplay
1. Update CampaignCard to detect video_url
2. Add hover state management
3. Implement YouTube iframe autoplay on hover
4. Add smooth transitions

### Phase 6: Seed Data
1. Create comprehensive seed script with 25 campaigns
2. Include varied data: different categories, amounts, locations
3. Add YouTube video URLs
4. Add sample milestones and collaborators
5. Use Unsplash stock photos

## Files to Create/Modify

### Backend
- ✅ `backend/database/migrations/add-milestones-collaborators.sql`
- ⏳ `backend/controllers/campaign.controller.js` (update)
- ⏳ `backend/routes/campaign.routes.js` (if needed)
- ⏳ `backend/seed-25-campaigns-extended.js` (complete)

### Frontend
- ⏳ `frontend/src/components/ui/RichTextEditor.jsx` (new)
- ⏳ `frontend/src/pages/CreateCampaign.jsx` (major update)
- ⏳ `frontend/src/components/ui/CampaignCard.jsx` (update for video)
- ⏳ `frontend/src/pages/CampaignDisplay.jsx` (update for rich text display)

## Next Steps
1. Run the database migration
2. Install react-quill package
3. Implement backend API changes
4. Implement frontend components
5. Test thoroughly
6. Run seed script

## Estimated Time
- Database: 30 minutes
- Backend API: 2-3 hours
- Frontend Rich Text: 1-2 hours
- Frontend Multi-step: 3-4 hours
- Video Autoplay: 1 hour
- Seed Data: 1-2 hours
- Testing: 2-3 hours

**Total: 10-15 hours**
