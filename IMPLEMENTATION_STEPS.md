# Campaign Enhancement - Implementation Steps

## Phase 1: Database Setup ✅

### 1. Run the migration
```bash
cd backend
mysql -u root -p darb_network_db < database/migrations/add-milestones-collaborators.sql
```

### 2. Verify tables were created
```bash
mysql -u root -p darb_network_db -e "SHOW TABLES LIKE '%milestone%'; SHOW TABLES LIKE '%collaborator%';"
```

## Phase 2: Install Frontend Dependencies

### 1. Install React Quill (Rich Text Editor)
```bash
cd frontend
npm install react-quill quill
```

### 2. Install additional dependencies if needed
```bash
npm install
```

## Phase 3: Backend Updates

### 1. Update campaign.controller.js

Add these imports at the top:
```javascript
const { saveMilestones, saveCollaborators, getMilestones, getCollaborators } = require('./campaign-milestones-collaborators');
```

### 2. Update createCampaign function

After creating the campaign, add:
```javascript
// Save milestones if provided
if (req.body.milestones) {
  await saveMilestones(campaignId, req.body.milestones, db.sequelize);
}

// Save collaborators if provided
if (req.body.collaborators) {
  await saveCollaborators(campaignId, req.body.collaborators, db.sequelize);
}
```

### 3. Update getCampaignById function

After fetching campaign, add:
```javascript
// Fetch milestones
campaign.milestones = await getMilestones(campaignId, db.sequelize);

// Fetch collaborators
campaign.collaborators = await getCollaborators(campaignId, db.sequelize);
```

### 4. Update updateCampaign function

Add milestone and collaborator updates similar to createCampaign.

## Phase 4: Frontend Updates

### 1. Update CreateCampaign.jsx

The component needs major restructuring to add:
- Multi-step form (5 steps total)
- Step 4: Milestones (optional)
- Step 5: Collaborators (optional)
- Rich text editor for description, problem, solution, business plan

Key changes needed:
```javascript
// Add to state
const [currentStep, setCurrentStep] = useState(1);
const [milestones, setMilestones] = useState([]);
const [collaborators, setCollaborators] = useState([]);

// Import RichTextEditor
import RichTextEditor from '../components/ui/RichTextEditor';

// Replace textareas with:
<RichTextEditor
  value={formData.description}
  onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
  placeholder="Describe your campaign..."
  height="300px"
/>
```

### 2. CampaignCard.jsx Updates ✅

Already updated with:
- Video autoplay on hover
- YouTube iframe integration
- Smooth transitions

### 3. Update CampaignDisplay.jsx

Add rendering for:
- Rich text HTML content (use dangerouslySetInnerHTML)
- Milestones section
- Collaborators/Team section

Example:
```javascript
<div dangerouslySetInnerHTML={{ __html: campaign.description }} />
```

## Phase 5: Seed Database

### 1. Run the seed script
```bash
cd backend
node seed-25-campaigns-complete.js
```

### 2. Verify campaigns were created
```bash
mysql -u root -p darb_network_db -e "SELECT COUNT(*) FROM campaigns;"
```

## Phase 6: Testing

### 1. Test Campaign Creation
- Create campaign with milestones
- Create campaign with collaborators
- Create campaign with rich text content
- Verify data saves correctly

### 2. Test Campaign Display
- View campaign details
- Check milestones display
- Check collaborators display
- Verify rich text renders correctly

### 3. Test Video Autoplay
- Hover over campaign cards
- Verify video plays automatically
- Verify video stops on mouse leave

## Common Issues & Solutions

### Issue: React Quill styles not loading
**Solution**: Make sure to import the CSS:
```javascript
import 'react-quill/dist/quill.snow.css';
```

### Issue: YouTube video not autoplaying
**Solution**: Check that:
1. Video URL is valid YouTube URL
2. `autoplay=1` and `mute=1` are in iframe src
3. Browser allows autoplay (muted videos usually work)

### Issue: Database migration fails
**Solution**: 
1. Check if tables already exist
2. Drop tables manually if needed
3. Re-run migration

### Issue: Milestones/Collaborators not saving
**Solution**:
1. Check request payload in browser DevTools
2. Verify backend receives the data
3. Check database for errors in logs

## Files Modified/Created

### Backend
- ✅ `backend/database/migrations/add-milestones-collaborators.sql`
- ✅ `backend/controllers/campaign-milestones-collaborators.js`
- ✅ `backend/seed-25-campaigns-complete.js`
- ⏳ `backend/controllers/campaign.controller.js` (needs manual updates)

### Frontend
- ✅ `frontend/src/components/ui/RichTextEditor.jsx`
- ✅ `frontend/src/components/ui/CampaignCard.jsx` (video autoplay added)
- ⏳ `frontend/src/pages/CreateCampaign.jsx` (needs major restructuring)
- ⏳ `frontend/src/pages/CampaignDisplay.jsx` (needs updates for display)

## Next Manual Steps Required

1. **Update CreateCampaign.jsx** - This is the most complex change
   - Add multi-step form logic
   - Add milestones step UI
   - Add collaborators step UI
   - Integrate RichTextEditor
   - Update form submission

2. **Update CampaignDisplay.jsx**
   - Add milestones section
   - Add collaborators section
   - Render rich text HTML

3. **Update campaign.controller.js**
   - Integrate milestone/collaborator helpers
   - Update create/update/get functions

Would you like me to continue with the detailed implementation of CreateCampaign.jsx?
