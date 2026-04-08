# Dashboard UI Fixes - Bugfix Design

## Overview

This design addresses five distinct bugs affecting the crowdfunding platform's user interface, data quality, and feature completeness:

1. **Campaign Card Images Display Issue**: Images not displaying with proper aspect ratio and fallback handling
2. **Filter Sidebar Scroll Behavior**: Sidebar scrolls out of view, reducing filter accessibility
3. **Campaign Seed Data Lacks Details**: Seeded campaigns have minimal information, limiting testing and demonstration value
4. **Campaign View Page Missing New Fields**: Milestones and team/collaborators not displayed despite backend support
5. **Milestone Image Support Missing**: Milestones only support YouTube videos, lacking image upload capability

These bugs impact visual presentation, usability, data completeness, and feature parity between frontend and backend.

## Glossary

- **Bug_Condition (C)**: The specific conditions that trigger each of the five bugs
- **Property (P)**: The desired correct behavior for each bug scenario
- **Preservation**: Existing functionality that must remain unchanged (filtering, navigation, campaign display, etc.)
- **CampaignCard**: React component in `frontend/src/components/ui/CampaignCard.jsx` that renders campaign cards
- **Dashboard**: React component in `frontend/src/pages/Dashboard.jsx` that displays the campaign listing page
- **CampaignDisplay**: React component in `frontend/src/pages/CampaignDisplay.jsx` that shows campaign details
- **seed-campaigns.js**: Node.js script in `backend/seed-campaigns.js` that populates database with sample campaigns
- **Sticky Positioning**: CSS positioning that makes elements fixed relative to viewport during scroll
- **Object-cover**: CSS property that scales images to fill container while maintaining aspect ratio
- **Milestone**: Campaign progress marker with description, date, and media content
- **Team/Collaborators**: Campaign team members with roles and information

## Bug Details


### Fault Condition

The bugs manifest under the following conditions:

**Bug 1 - Campaign Card Images:**
The image display fails when campaign cards are rendered with images that have incorrect URLs, missing fallbacks, or inconsistent container sizing.

**Formal Specification:**
```
FUNCTION isBugCondition_ImageDisplay(campaignCard)
  INPUT: campaignCard of type CampaignCardComponent
  OUTPUT: boolean
  
  RETURN (campaignCard.image.aspectRatio != "maintained") OR
         (campaignCard.image.failedToLoad AND NOT hasProperFallback(campaignCard)) OR
         (campaignCard.imageContainer.height != "consistent")
END FUNCTION
```

**Bug 2 - Filter Sidebar Scroll:**
The sidebar becomes inaccessible when users scroll down the page, requiring them to scroll back up to access filters.

**Formal Specification:**
```
FUNCTION isBugCondition_SidebarScroll(dashboardState)
  INPUT: dashboardState of type DashboardPageState
  OUTPUT: boolean
  
  RETURN (dashboardState.scrollPosition > dashboardState.viewportHeight) AND
         (dashboardState.sidebar.position == "static" OR dashboardState.sidebar.position == "relative") AND
         NOT dashboardState.sidebar.isVisible
END FUNCTION
```

**Bug 3 - Seed Data Quality:**
The seeded campaigns lack comprehensive information needed for realistic testing and demonstration.

**Formal Specification:**
```
FUNCTION isBugCondition_SeedData(campaign)
  INPUT: campaign of type SeededCampaign
  OUTPUT: boolean
  
  RETURN (campaign.description.length < 200) OR
         (campaign.milestones.length == 0) OR
         (campaign.team.length == 0) OR
         (campaign.detailedContent == NULL)
END FUNCTION
```

**Bug 4 - Missing View Page Fields:**
The campaign detail page fails to display milestones and team information despite backend data availability.

**Formal Specification:**
```
FUNCTION isBugCondition_MissingFields(campaignViewPage, backendData)
  INPUT: campaignViewPage of type CampaignDisplayComponent, backendData of type CampaignData
  OUTPUT: boolean
  
  RETURN (backendData.milestones.length > 0 AND NOT campaignViewPage.displays("milestones")) OR
         (backendData.team.length > 0 AND NOT campaignViewPage.displays("team"))
END FUNCTION
```

**Bug 5 - Milestone Image Support:**
Milestones cannot display or accept image content, only YouTube video URLs.

**Formal Specification:**
```
FUNCTION isBugCondition_MilestoneImages(milestone, userAction)
  INPUT: milestone of type Milestone, userAction of type UserInteraction
  OUTPUT: boolean
  
  RETURN (userAction.type == "add_image" AND NOT milestone.supportsImages) OR
         (milestone.hasImage AND NOT milestone.displaysImage)
END FUNCTION
```

### Examples

**Bug 1 - Campaign Card Images:**
- Campaign with invalid image URL shows broken image icon instead of placeholder
- Campaign card images have inconsistent heights (some 160px, some 180px)
- Image with 16:9 aspect ratio gets stretched to fill square container
- Image fails to load but onError handler doesn't trigger fallback

**Bug 2 - Filter Sidebar Scroll:**
- User scrolls to bottom of page to view campaigns 10-12
- User wants to filter by "Tech & Innovation" category
- User must scroll back to top to access category filter
- Sidebar with "Categories" and "Quick Links" is no longer visible

**Bug 3 - Seed Data Quality:**
- Seeded campaign has description: "A great tech startup" (too brief)
- Seeded campaign has 0 milestones defined
- Seeded campaign has no team members listed
- Seeded campaign lacks problem statement and solution details

**Bug 4 - Missing View Page Fields:**
- Backend returns campaign with 3 milestones in API response
- Campaign view page shows title, description, funding progress
- Campaign view page does NOT show milestones section
- Backend returns campaign with 2 team members
- Campaign view page does NOT show team/collaborators section

**Bug 5 - Milestone Image Support:**
- User creates milestone with YouTube video URL - works correctly
- User tries to add image to milestone - no image upload field available
- Milestone has image_url in database but view page only checks for video_url
- User wants to show progress photo but can only add video


## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

**Dashboard Functionality (Bugs 1, 2):**
- Category filtering must continue to work correctly for all categories
- Quick links navigation must continue to function
- Campaign card click navigation to detail page must work
- Grid/list view toggle must continue to work
- Search functionality must continue to filter campaigns
- Funding progress bars and percentages must display accurately
- Hover effects and video previews must continue to work
- Mobile responsive behavior must remain unchanged
- Pagination must continue to work correctly

**Campaign Data Display (Bugs 1, 3, 4):**
- Existing campaign data fields (title, description, funding, category) must display correctly
- Campaign funding calculations must remain accurate
- Campaign status badges must continue to work
- Founder/creator information must display correctly
- Investment functionality must continue to work
- Favorite/share functionality must remain unchanged

**Milestone Functionality (Bug 5):**
- Existing YouTube video URL support must continue to work
- Video validation and storage must remain functional
- Milestone title, description, and date display must work correctly

**Scope:**

All inputs and interactions that do NOT involve the specific bug conditions should be completely unaffected by these fixes. This includes:

**For Bug 1 (Images):**
- Campaign cards in list view should maintain their existing styling
- Campaign data without images should continue to work
- Video previews on hover should not be affected

**For Bug 2 (Sidebar):**
- Mobile filter behavior (hidden sidebar with mobile filters button) must remain unchanged
- Sidebar content and functionality must not change
- Main content area layout must not be affected

**For Bug 3 (Seed Data):**
- Existing non-seeded campaigns must not be modified
- New campaign creation must continue to work normally
- Campaign data structure must remain compatible

**For Bug 4 (View Page Fields):**
- All existing campaign detail page sections must continue to display
- Campaign interaction features (invest, favorite, share) must work
- Page layout and styling must remain consistent

**For Bug 5 (Milestone Images):**
- Milestones without images should continue to display normally
- Video-only milestones should work as before
- Milestone creation/editing for other fields must not be affected


## Hypothesized Root Cause

Based on the bug descriptions and code analysis, the most likely issues are:

### Bug 1: Campaign Card Images Display Issue

1. **Inconsistent Image Container Sizing**: The `getImageHeight()` function returns different heights based on card size, but the implementation may not be consistently applied across all card instances.

2. **Incomplete Error Handling**: The `onError` handler sets `src` to placeholder but may not handle all edge cases (e.g., placeholder itself failing to load, CORS issues).

3. **Missing Object-Cover Class**: While the code includes `object-cover` class, there may be CSS conflicts or missing width constraints causing aspect ratio issues.

4. **Image URL Construction Issues**: The `buildImageUrl()` function may not handle all URL formats correctly, leading to broken image paths.

### Bug 2: Filter Sidebar Scroll Behavior

1. **Missing Sticky Positioning**: The sidebar container in `Dashboard.jsx` (line ~970) uses a simple `<div>` without `sticky` or `fixed` positioning, causing it to scroll with page content.

2. **No Position Constraints**: The sidebar lacks CSS classes like `sticky top-0` or `fixed` that would keep it visible during scroll.

3. **Viewport Height Not Considered**: The sidebar doesn't account for viewport height, so it scrolls out of view when page content exceeds screen height.

### Bug 3: Campaign Seed Data Lacks Details

1. **Minimal SQL Seed File**: The `seed-campaigns.sql` file (referenced in `seed-campaigns.js`) likely contains only basic INSERT statements with minimal field values.

2. **Missing Related Data**: The seed script may not populate related tables like `campaign_milestones`, `campaign_team`, or extended description fields.

3. **Placeholder Content**: Seeded campaigns likely use generic placeholder text instead of realistic, detailed content.

### Bug 4: Campaign View Page Missing New Fields

1. **Component Not Rendering Fields**: The `CampaignDisplay.jsx` component loads campaign data but doesn't include JSX sections to render milestones or team information.

2. **Missing API Data Fetching**: The component may not be fetching milestone and team data from the backend API, or the API may not be including these fields in the response.

3. **Tab Structure Incomplete**: The component has an `activeTab` state but may not have tabs defined for "Milestones" or "Team" sections.

### Bug 5: Milestone Image Support Missing

1. **Schema Limitation**: The `campaign_milestones` table may only have a `video_url` column without an `image_url` column.

2. **Frontend Form Missing Image Input**: The milestone creation/editing form likely only has an input field for YouTube video URLs, not for image uploads.

3. **Display Logic Only Checks Video**: The milestone display component probably only checks for and renders `video_url`, ignoring any `image_url` field.

4. **No Image Upload Handler**: The backend API endpoint for creating/updating milestones may not handle image file uploads.


## Correctness Properties

Property 1: Fault Condition - Campaign Card Image Display

_For any_ campaign card rendered in the dashboard where an image is present, the fixed CampaignCard component SHALL display the image with proper aspect ratio using object-cover, maintain consistent container height (h-40 for default size), and display a proper placeholder image when the main image fails to load.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Fault Condition - Filter Sidebar Visibility

_For any_ scroll position on the dashboard page, the fixed sidebar SHALL remain visible and accessible to users through sticky positioning, allowing immediate access to category filters and quick links without requiring users to scroll back to the top.

**Validates: Requirements 2.4, 2.5, 2.6**

Property 3: Fault Condition - Seed Data Completeness

_For any_ seeded campaign in the database, the fixed seed script SHALL populate comprehensive information including detailed descriptions (minimum 200 characters), at least 2 milestones with descriptions and dates, at least 1 team member, and realistic content that showcases platform features.

**Validates: Requirements 2.7, 2.8, 2.9**

Property 4: Fault Condition - Campaign View Page Field Display

_For any_ campaign detail page where the backend data includes milestones or team/collaborators, the fixed CampaignDisplay component SHALL render these fields in appropriate UI sections with all information from the backend displayed correctly.

**Validates: Requirements 2.10, 2.11, 2.12**

Property 5: Fault Condition - Milestone Image Support

_For any_ milestone creation or viewing action, the fixed milestone functionality SHALL support both image uploads and YouTube video URLs, displaying image content when available and providing proper upload/preview functionality for images.

**Validates: Requirements 2.13, 2.14, 2.15**

Property 6: Preservation - Dashboard Functionality

_For any_ user interaction with dashboard features (filtering, searching, navigation, view toggling) that does NOT involve the specific bug conditions, the fixed code SHALL produce exactly the same behavior as the original code, preserving all existing dashboard functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**

Property 7: Preservation - Campaign Data Display

_For any_ campaign data display or interaction that does NOT involve the bug conditions, the fixed code SHALL maintain existing behavior for campaign fields, funding calculations, status badges, creator information, and user interactions.

**Validates: Requirements 3.11, 3.12, 3.13, 3.14, 3.15, 3.16**

Property 8: Preservation - Milestone Video Functionality

_For any_ milestone that uses YouTube video URLs without images, the fixed code SHALL continue to display and validate video content exactly as before, preserving all existing video-related functionality.

**Validates: Requirements 3.17, 3.18, 3.19**


## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct, the following changes are needed:

### Bug 1: Campaign Card Images Display Issue

**File**: `frontend/src/components/ui/CampaignCard.jsx`

**Specific Changes**:

1. **Ensure Consistent Image Sizing**: Verify that the image container always applies the height class from `getImageHeight()` and includes `w-full` for width consistency.
   - Current code at line ~217: `<div className={`relative ${getImageHeight()} overflow-hidden`}>`
   - Ensure this is consistently applied and not overridden by other styles

2. **Enhance Error Handling**: Improve the `onError` handler to be more robust.
   - Current code at line ~221-225 has basic error handling
   - Add additional fallback logic and error logging
   - Ensure placeholder image path is correct and accessible

3. **Verify Object-Cover Application**: Confirm `object-cover` class is applied to all campaign images.
   - Current code at line ~222 includes `object-cover`
   - Verify no CSS conflicts override this behavior

4. **Improve Image URL Construction**: Enhance the `getImageUrl()` function to handle edge cases.
   - Current code at line ~109-114
   - Add validation for empty strings, malformed URLs
   - Ensure `buildImageUrl()` handles all path formats correctly

**Implementation Details**:
```javascript
// Enhanced getImageUrl with better error handling
const getImageUrl = () => {
  if (campaign.main_image_url && campaign.main_image_url.trim() !== '') {
    try {
      return buildImageUrl(campaign.main_image_url);
    } catch (error) {
      console.error('Error building image URL:', error);
      return '/placeholder-campaign.jpg';
    }
  }
  return '/placeholder-campaign.jpg';
};

// Enhanced onError handler
onError={(e) => {
  console.warn('Campaign image failed to load:', campaign.id, e.target.src);
  if (e.target.src !== '/placeholder-campaign.jpg') {
    e.target.src = '/placeholder-campaign.jpg';
  } else {
    // Placeholder also failed, use inline SVG or hide
    e.target.style.display = 'none';
  }
}}
```

### Bug 2: Filter Sidebar Scroll Behavior

**File**: `frontend/src/pages/Dashboard.jsx`

**Specific Changes**:

1. **Add Sticky Positioning to Sidebar Container**: Modify the sidebar wrapper div (around line 970) to use sticky positioning.
   - Current: `<div className="hidden md:block w-64 flex-shrink-0">`
   - Change to: `<div className="hidden md:block w-64 flex-shrink-0 sticky top-4 self-start">`

2. **Add Max Height Constraint**: Ensure sidebar doesn't exceed viewport height.
   - Add `max-h-[calc(100vh-2rem)]` class to prevent sidebar from being taller than viewport
   - Add `overflow-y-auto` to allow scrolling within sidebar if content is too tall

3. **Adjust Top Offset**: Set appropriate top offset to account for navbar height.
   - Use `top-4` or `top-20` depending on navbar height
   - Ensure sidebar doesn't overlap with fixed navbar

**Implementation Details**:
```javascript
// Around line 970 in Dashboard.jsx
<div className="hidden md:block w-64 flex-shrink-0 sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
  <CategoryFilter />
  
  {isAuthenticated() && (
    <div className="bg-white rounded-lg shadow-sm my-4 p-4 mt-4">
      <h3 className="font-bold text-gray-900 mb-4">Quick Links</h3>
      {/* Quick links content */}
    </div>
  )}
</div>
```

### Bug 3: Campaign Seed Data Lacks Details

**File**: `backend/database/seed-campaigns.sql` (or create enhanced version)

**Specific Changes**:

1. **Enhance Campaign Descriptions**: Replace minimal descriptions with detailed, realistic content (200-500 characters).
   - Include problem statement, solution overview, and value proposition
   - Use varied, industry-appropriate language for each category

2. **Add Milestone Data**: Insert 2-4 milestones per campaign with realistic details.
   - Include milestone titles, descriptions (100-200 chars), target dates
   - Add both completed and upcoming milestones
   - Include mix of video URLs and image URLs (for bug 5 support)

3. **Add Team Member Data**: Insert 1-3 team members per campaign.
   - Include names, roles, bio (50-100 chars)
   - Add profile images or avatars
   - Vary team sizes across campaigns

4. **Enhance Campaign Details**: Add comprehensive content to all 25 campaigns.
   - Populate problem_statement field (150-300 chars)
   - Populate solution field (150-300 chars)
   - Add business_plan content where appropriate
   - Include realistic funding goals and current amounts
   - Add varied categories, locations, and statuses

**Implementation Details**:
```sql
-- Example enhanced campaign insert
INSERT INTO campaigns (
  title, description, problem_statement, solution, category, 
  target_amount, current_amount, minimum_investment, location, 
  founder_id, status, is_featured, created_at
) VALUES (
  'EcoCharge - Solar Power Banks for Rural Communities',
  'EcoCharge develops affordable, durable solar-powered charging stations designed specifically for rural and off-grid communities in Nigeria. Our solution combines efficient solar panels with high-capacity batteries to provide reliable power access where traditional electricity infrastructure is unavailable or unreliable.',
  'Over 85 million Nigerians lack reliable access to electricity, forcing them to travel long distances to charge phones and devices, limiting economic opportunities and access to information.',
  'Our solar power banks are ruggedized for harsh environments, feature multiple charging ports, and can fully charge in 6 hours of sunlight. We partner with local entrepreneurs to establish charging micro-businesses, creating jobs while solving the energy access problem.',
  'Energy & Green Tech',
  5000000, 2750000, 50000, 'Lagos, Nigeria',
  2, 'approved', 1, NOW()
);

-- Add milestones for the campaign
INSERT INTO campaign_milestones (
  campaign_id, title, description, target_date, status, 
  video_url, image_url, created_at
) VALUES
(LAST_INSERT_ID(), 'Prototype Development Complete', 
 'Successfully developed and tested first working prototype with 20,000mAh capacity and 50W solar panel. Tested in field conditions for 30 days.', 
 '2024-01-15', 'completed', 
 'https://youtube.com/watch?v=example1', 
 '/uploads/milestones/prototype-solar-bank.jpg', 
 NOW()),
(LAST_INSERT_ID(), 'Pilot Program Launch', 
 'Deploy 50 units across 5 rural communities in Ogun State. Gather user feedback and refine design based on real-world usage patterns.', 
 '2024-06-01', 'in_progress', 
 NULL, 
 '/uploads/milestones/pilot-deployment.jpg', 
 NOW());

-- Add team members
INSERT INTO campaign_team (
  campaign_id, user_id, name, role, bio, profile_image, created_at
) VALUES
(LAST_INSERT_ID(), NULL, 'Adebayo Okonkwo', 'Founder & CEO', 
 'Electrical engineer with 10 years experience in renewable energy systems. Previously worked at Shell Nigeria on solar projects.', 
 '/uploads/team/adebayo.jpg', NOW()),
(LAST_INSERT_ID(), NULL, 'Chioma Nwosu', 'CTO', 
 'Hardware engineer specializing in battery management systems. MIT graduate with 3 patents in energy storage.', 
 '/uploads/team/chioma.jpg', NOW());
```

5. **Update Seed Script**: Modify `backend/seed-campaigns.js` to handle enhanced data.
   - Ensure script reads and executes the enhanced SQL file
   - Add error handling for new tables (milestones, team)
   - Update summary output to show milestone and team counts


### Bug 4: Campaign View Page Missing New Fields

**File**: `frontend/src/pages/CampaignDisplay.jsx`

**Specific Changes**:

1. **Add State for Milestones and Team**: Add state variables to store milestone and team data.
   ```javascript
   const [milestones, setMilestones] = useState([]);
   const [teamMembers, setTeamMembers] = useState([]);
   ```

2. **Fetch Milestones and Team Data**: Add API calls to load milestone and team information.
   ```javascript
   const loadMilestones = async () => {
     try {
       const response = await fetch(`/api/campaigns/${id}/milestones`);
       if (response.ok) {
         const result = await response.json();
         setMilestones(result.data || []);
       }
     } catch (error) {
       console.error('Error loading milestones:', error);
     }
   };

   const loadTeamMembers = async () => {
     try {
       const response = await fetch(`/api/campaigns/${id}/team`);
       if (response.ok) {
         const result = await response.json();
         setTeamMembers(result.data || []);
       }
     } catch (error) {
       console.error('Error loading team:', error);
     }
   };
   ```

3. **Add Tabs for New Sections**: Extend the tab system to include "Milestones" and "Team" tabs.
   - Current tabs likely include "overview", "updates", etc.
   - Add "milestones" and "team" to tab options

4. **Create Milestones Display Component**: Add JSX section to render milestones.
   ```javascript
   const renderMilestones = () => {
     if (milestones.length === 0) {
       return (
         <div className="text-center py-8 text-gray-500">
           No milestones added yet.
         </div>
       );
     }

     return (
       <div className="space-y-6">
         {milestones.map((milestone, index) => (
           <div key={milestone.id} className="bg-white rounded-lg border border-gray-200 p-6">
             <div className="flex items-start justify-between mb-4">
               <div className="flex-1">
                 <h3 className="text-lg font-semibold text-gray-900 mb-2">
                   {milestone.title}
                 </h3>
                 <p className="text-gray-600 text-sm mb-3">
                   {milestone.description}
                 </p>
                 <div className="flex items-center text-sm text-gray-500">
                   <Calendar className="h-4 w-4 mr-2" />
                   Target: {new Date(milestone.target_date).toLocaleDateString()}
                 </div>
               </div>
               <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                 milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                 milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                 'bg-gray-100 text-gray-800'
               }`}>
                 {milestone.status}
               </span>
             </div>

             {/* Media content - images and/or video */}
             {(milestone.image_url || milestone.video_url) && (
               <div className="mt-4">
                 {milestone.image_url && (
                   <img 
                     src={buildImageUrl(milestone.image_url)}
                     alt={milestone.title}
                     className="w-full h-64 object-cover rounded-lg mb-3"
                   />
                 )}
                 {milestone.video_url && (
                   <div className="aspect-video">
                     <iframe
                       src={`https://www.youtube.com/embed/${extractYouTubeId(milestone.video_url)}`}
                       className="w-full h-full rounded-lg"
                       frameBorder="0"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                       allowFullScreen
                     />
                   </div>
                 )}
               </div>
             )}
           </div>
         ))}
       </div>
     );
   };
   ```

5. **Create Team Display Component**: Add JSX section to render team members.
   ```javascript
   const renderTeam = () => {
     if (teamMembers.length === 0) {
       return (
         <div className="text-center py-8 text-gray-500">
           No team members added yet.
         </div>
       );
     }

     return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {teamMembers.map((member) => (
           <div key={member.id} className="bg-white rounded-lg border border-gray-200 p-6">
             <div className="flex flex-col items-center text-center">
               <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 mb-4">
                 {member.profile_image ? (
                   <img 
                     src={buildImageUrl(member.profile_image)}
                     alt={member.name}
                     className="h-full w-full object-cover"
                   />
                 ) : (
                   <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-gray-400">
                     {member.name.charAt(0)}
                   </div>
                 )}
               </div>
               <h3 className="text-lg font-semibold text-gray-900 mb-1">
                 {member.name}
               </h3>
               <p className="text-sm text-green-600 font-medium mb-3">
                 {member.role}
               </p>
               <p className="text-sm text-gray-600">
                 {member.bio}
               </p>
             </div>
           </div>
         ))}
       </div>
     );
   };
   ```

6. **Integrate into Tab System**: Add conditional rendering based on activeTab.
   ```javascript
   {activeTab === 'milestones' && renderMilestones()}
   {activeTab === 'team' && renderTeam()}
   ```

**Backend Changes (if needed)**:

**File**: `backend/controllers/campaign.controller.js`

1. **Add Milestones Endpoint**: Create GET endpoint for `/api/campaigns/:id/milestones`
2. **Add Team Endpoint**: Create GET endpoint for `/api/campaigns/:id/team`
3. **Include in Main Campaign Response**: Optionally include milestones and team in main campaign GET response

### Bug 5: Milestone Image Support Missing

**Database Schema Changes**:

**File**: `backend/database/migrations/add_milestone_images.sql` (create new migration)

1. **Add image_url Column**: If not already present, add `image_url` column to `campaign_milestones` table.
   ```sql
   ALTER TABLE campaign_milestones 
   ADD COLUMN image_url VARCHAR(500) NULL AFTER video_url;
   ```

**Backend Changes**:

**File**: `backend/controllers/milestone.controller.js` (or relevant controller)

1. **Add Image Upload Handler**: Implement image upload functionality for milestones.
   - Use multer or similar middleware for file uploads
   - Store images in `/uploads/milestones/` directory
   - Generate unique filenames to prevent conflicts
   - Validate image file types (jpg, png, webp)
   - Limit file size (e.g., 5MB max)

2. **Update Create/Edit Endpoints**: Modify milestone creation and update endpoints to accept image uploads.
   ```javascript
   // Example using multer
   const upload = multer({
     dest: 'uploads/milestones/',
     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
     fileFilter: (req, file, cb) => {
       if (file.mimetype.startsWith('image/')) {
         cb(null, true);
       } else {
         cb(new Error('Only image files are allowed'));
       }
     }
   });

   router.post('/campaigns/:id/milestones', 
     authenticate, 
     upload.single('image'), 
     createMilestone
   );
   ```

3. **Store Image URL in Database**: Save the image path/URL when creating or updating milestones.
   ```javascript
   const createMilestone = async (req, res) => {
     try {
       const { title, description, target_date, video_url } = req.body;
       const image_url = req.file ? `/uploads/milestones/${req.file.filename}` : null;
       
       const result = await db.query(
         `INSERT INTO campaign_milestones 
          (campaign_id, title, description, target_date, video_url, image_url) 
          VALUES (?, ?, ?, ?, ?, ?)`,
         [req.params.id, title, description, target_date, video_url, image_url]
       );
       
       res.json({ success: true, data: { id: result.insertId, image_url } });
     } catch (error) {
       res.status(500).json({ success: false, message: error.message });
     }
   };
   ```

**Frontend Changes**:

**File**: `frontend/src/components/campaign/MilestoneForm.jsx` (or create if doesn't exist)

1. **Add Image Upload Input**: Add file input field to milestone creation/editing form.
   ```javascript
   const [imageFile, setImageFile] = useState(null);
   const [imagePreview, setImagePreview] = useState(null);

   const handleImageChange = (e) => {
     const file = e.target.files[0];
     if (file) {
       setImageFile(file);
       setImagePreview(URL.createObjectURL(file));
     }
   };

   // In JSX
   <div className="mb-4">
     <label className="block text-sm font-medium text-gray-700 mb-2">
       Milestone Image (optional)
     </label>
     <input
       type="file"
       accept="image/*"
       onChange={handleImageChange}
       className="block w-full text-sm text-gray-500
         file:mr-4 file:py-2 file:px-4
         file:rounded-md file:border-0
         file:text-sm file:font-semibold
         file:bg-green-50 file:text-green-700
         hover:file:bg-green-100"
     />
     {imagePreview && (
       <img 
         src={imagePreview} 
         alt="Preview" 
         className="mt-3 h-32 w-auto rounded-lg"
       />
     )}
   </div>
   ```

2. **Update Form Submission**: Modify form submission to send multipart/form-data with image file.
   ```javascript
   const handleSubmit = async (e) => {
     e.preventDefault();
     
     const formData = new FormData();
     formData.append('title', title);
     formData.append('description', description);
     formData.append('target_date', targetDate);
     formData.append('video_url', videoUrl);
     if (imageFile) {
       formData.append('image', imageFile);
     }

     const response = await fetch(`/api/campaigns/${campaignId}/milestones`, {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`
       },
       body: formData
     });
     
     // Handle response
   };
   ```

3. **Update Milestone Display**: Modify milestone rendering to show images (already covered in Bug 4 implementation above).


## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify the fixes work correctly and preserve existing behavior. Given the multi-bug nature of this spec, testing will be organized by bug category.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate all 5 bugs BEFORE implementing fixes. Confirm or refute the root cause analysis for each bug. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate each bug condition and assert the expected failures. Run these tests on the UNFIXED code to observe failures and understand the root causes.

**Test Cases**:

**Bug 1 - Campaign Card Images:**
1. **Image Aspect Ratio Test**: Render campaign card with 16:9 image, verify object-cover maintains aspect ratio (will fail if CSS conflicts exist)
2. **Image Load Failure Test**: Render campaign card with invalid image URL, verify placeholder displays (will fail if onError handler incomplete)
3. **Consistent Height Test**: Render multiple campaign cards, measure image container heights, verify all are identical for same size prop (will fail if sizing inconsistent)
4. **Image URL Construction Test**: Test various image URL formats (relative, absolute, malformed), verify buildImageUrl handles all cases (will fail if URL construction broken)

**Bug 2 - Filter Sidebar Scroll:**
1. **Sidebar Visibility Test**: Scroll dashboard page to bottom, check if sidebar is visible in viewport (will fail on unfixed code - sidebar scrolls out of view)
2. **Sticky Position Test**: Check computed CSS position of sidebar element, verify it's sticky or fixed (will fail - currently static/relative)
3. **Filter Access Test**: Scroll to bottom, attempt to click category filter, verify it's accessible without scrolling up (will fail - requires scroll to access)

**Bug 3 - Seed Data Quality:**
1. **Description Length Test**: Query seeded campaigns, verify description length >= 200 characters (will fail - descriptions too short)
2. **Milestone Count Test**: Query seeded campaigns, verify each has >= 2 milestones (will fail - no milestones)
3. **Team Member Test**: Query seeded campaigns, verify each has >= 1 team member (will fail - no team members)
4. **Content Completeness Test**: Verify problem_statement and solution fields are populated (will fail - fields empty or null)

**Bug 4 - Missing View Page Fields:**
1. **Milestones Display Test**: Load campaign with milestones in backend, verify milestones section renders on page (will fail - section not present)
2. **Team Display Test**: Load campaign with team members in backend, verify team section renders on page (will fail - section not present)
3. **API Data Test**: Call campaign API, verify milestones and team data are returned (may pass or fail depending on API implementation)
4. **Tab Existence Test**: Check if "Milestones" and "Team" tabs exist in UI (will fail - tabs not implemented)

**Bug 5 - Milestone Image Support:**
1. **Image Upload Field Test**: Open milestone creation form, verify image upload input exists (will fail - only video URL field present)
2. **Image Display Test**: Create milestone with image_url in database, verify image displays on page (will fail - only video_url checked)
3. **Database Schema Test**: Check if campaign_milestones table has image_url column (may pass or fail depending on schema)
4. **Image Upload Handler Test**: Attempt to POST milestone with image file, verify backend accepts it (will fail - no upload handler)

**Expected Counterexamples**:
- Campaign card images with broken aspect ratios or missing placeholders
- Sidebar scrolling out of view when page scrolled down
- Seeded campaigns with minimal data (short descriptions, no milestones/team)
- Campaign view page missing milestones and team sections despite backend data
- Milestone forms lacking image upload capability, images not displaying

### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**

**Bug 1 - Images:**
```
FOR ALL campaignCard WHERE hasImage(campaignCard) DO
  result := renderCampaignCard_fixed(campaignCard)
  ASSERT result.image.aspectRatio == "maintained"
  ASSERT result.imageContainer.height == "consistent"
  IF imageLoadFails(campaignCard.image) THEN
    ASSERT result.displays("placeholder")
  END IF
END FOR
```

**Bug 2 - Sidebar:**
```
FOR ALL scrollPosition WHERE scrollPosition > viewportHeight DO
  dashboardState := renderDashboard_fixed(scrollPosition)
  ASSERT dashboardState.sidebar.isVisible == TRUE
  ASSERT dashboardState.sidebar.position == "sticky" OR "fixed"
  ASSERT canAccessFilters(dashboardState) == TRUE
END FOR
```

**Bug 3 - Seed Data:**
```
FOR ALL seededCampaign IN database DO
  ASSERT seededCampaign.description.length >= 200
  ASSERT seededCampaign.milestones.length >= 2
  ASSERT seededCampaign.team.length >= 1
  ASSERT seededCampaign.problem_statement != NULL
  ASSERT seededCampaign.solution != NULL
END FOR
```

**Bug 4 - View Page Fields:**
```
FOR ALL campaign WHERE (campaign.milestones.length > 0 OR campaign.team.length > 0) DO
  viewPage := renderCampaignDisplay_fixed(campaign)
  IF campaign.milestones.length > 0 THEN
    ASSERT viewPage.displays("milestones")
    ASSERT viewPage.milestones.count == campaign.milestones.length
  END IF
  IF campaign.team.length > 0 THEN
    ASSERT viewPage.displays("team")
    ASSERT viewPage.team.count == campaign.team.length
  END IF
END FOR
```

**Bug 5 - Milestone Images:**
```
FOR ALL milestoneAction WHERE (milestoneAction.type == "create" OR "edit") DO
  form := renderMilestoneForm_fixed()
  ASSERT form.hasField("image_upload")
  ASSERT form.hasField("video_url")
END FOR

FOR ALL milestone WHERE milestone.image_url != NULL DO
  display := renderMilestone_fixed(milestone)
  ASSERT display.shows("image")
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**

**General Dashboard Preservation:**
```
FOR ALL userAction WHERE NOT isBugCondition(userAction) DO
  ASSERT Dashboard_original(userAction) = Dashboard_fixed(userAction)
END FOR
```

**Specific Preservation Tests:**
```
// Category filtering
FOR ALL categorySelection IN allCategories DO
  ASSERT filterCampaigns_original(categorySelection) = filterCampaigns_fixed(categorySelection)
END FOR

// Campaign card clicks
FOR ALL campaignCard DO
  ASSERT onClick_original(campaignCard) = onClick_fixed(campaignCard)
END FOR

// Existing campaign data display
FOR ALL existingCampaign WHERE NOT isSeededCampaign(existingCampaign) DO
  ASSERT displayCampaign_original(existingCampaign) = displayCampaign_fixed(existingCampaign)
END FOR

// Milestone video functionality
FOR ALL milestone WHERE milestone.video_url != NULL AND milestone.image_url == NULL DO
  ASSERT displayMilestone_original(milestone) = displayMilestone_fixed(milestone)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs
- With 5 different bugs, PBT helps ensure fixes don't interfere with each other

**Test Plan**: Observe behavior on UNFIXED code first for non-bug scenarios, then write property-based tests capturing that behavior.

**Test Cases**:

**Dashboard Preservation:**
1. **Category Filter Preservation**: Test all category selections work identically before and after fix
2. **Search Preservation**: Test search functionality produces same results before and after fix
3. **View Toggle Preservation**: Test grid/list view toggle works identically
4. **Pagination Preservation**: Test pagination produces same page results

**Campaign Display Preservation:**
1. **Existing Fields Preservation**: Test that title, description, funding progress display identically
2. **Investment Flow Preservation**: Test investment modal and process work identically
3. **Favorite/Share Preservation**: Test favorite and share functionality work identically

**Mobile Behavior Preservation:**
1. **Mobile Sidebar Preservation**: Test that mobile filter behavior (hidden sidebar) remains unchanged
2. **Responsive Layout Preservation**: Test that responsive breakpoints work identically

### Unit Tests

**Bug 1 - Campaign Card Images:**
- Test image rendering with valid URLs
- Test image rendering with invalid URLs (should show placeholder)
- Test image container sizing for different card sizes (default, compact, featured)
- Test onError handler triggers correctly
- Test buildImageUrl with various URL formats

**Bug 2 - Filter Sidebar:**
- Test sidebar has sticky positioning class
- Test sidebar top offset is correct
- Test sidebar max-height constraint
- Test sidebar remains visible at various scroll positions
- Test sidebar doesn't overlap main content

**Bug 3 - Seed Data:**
- Test seed script successfully inserts 25 campaigns
- Test each seeded campaign has description >= 200 chars
- Test each seeded campaign has >= 2 milestones
- Test each seeded campaign has >= 1 team member
- Test seeded campaigns have varied categories and statuses

**Bug 4 - View Page Fields:**
- Test milestones section renders when data present
- Test milestones section shows "no milestones" when data absent
- Test team section renders when data present
- Test team section shows "no team members" when data absent
- Test milestone and team API endpoints return correct data

**Bug 5 - Milestone Images:**
- Test milestone form has image upload field
- Test image upload accepts valid image files
- Test image upload rejects non-image files
- Test milestone display shows image when image_url present
- Test milestone display shows video when video_url present
- Test milestone display shows both when both present
- Test backend stores image_url correctly

### Property-Based Tests

**Bug 1 - Campaign Card Images:**
- Generate random campaign objects with various image URL formats, verify all render correctly with proper sizing and fallbacks

**Bug 2 - Filter Sidebar:**
- Generate random scroll positions, verify sidebar always visible and accessible

**Bug 3 - Seed Data:**
- Generate queries for random subsets of seeded campaigns, verify all meet quality criteria (description length, milestone count, team count)

**Bug 4 - View Page Fields:**
- Generate random campaign IDs with varying milestone/team counts, verify all display correctly on view page

**Bug 5 - Milestone Images:**
- Generate random milestone objects with various combinations of image_url and video_url, verify all display correctly

**Preservation Properties:**
- Generate random user interactions (clicks, filters, searches), verify behavior unchanged for non-bug scenarios
- Generate random campaign data, verify existing display logic unchanged
- Generate random milestone data (video-only), verify video functionality unchanged

### Integration Tests

**Bug 1 - Campaign Card Images:**
- Test full dashboard page load with multiple campaigns, verify all images display correctly
- Test campaign card hover interactions with images and videos

**Bug 2 - Filter Sidebar:**
- Test full user flow: load dashboard, scroll down, use filters, verify filters accessible throughout
- Test sidebar behavior across different viewport sizes

**Bug 3 - Seed Data:**
- Test running seed script, then loading dashboard, verify campaigns display with rich data
- Test campaign view pages for seeded campaigns, verify all fields populated

**Bug 4 - View Page Fields:**
- Test full campaign view page load, verify all sections (overview, milestones, team) render correctly
- Test tab navigation between different sections

**Bug 5 - Milestone Images:**
- Test full milestone creation flow: open form, upload image, submit, verify image displays
- Test milestone editing flow: edit existing milestone, change image, verify update works
- Test campaign view page with milestones containing images and videos

**Cross-Bug Integration:**
- Test seeded campaigns (Bug 3) display correctly in dashboard (Bug 1, 2)
- Test seeded campaigns with milestones (Bug 3) display correctly on view page (Bug 4, 5)
- Test creating new milestone with image (Bug 5) displays on view page (Bug 4)

