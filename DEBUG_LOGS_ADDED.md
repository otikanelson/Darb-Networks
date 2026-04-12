# Debug Logs Added

Console logs have been added throughout the application to help debug the campaign update issue and profile image loading.

## Backend - Campaign Controller (`backend/controllers/campaign.controller.js`)

### Update Campaign Function
Added detailed logging for:
- Campaign ID and Founder ID
- Update data payload
- Campaign lookup and ownership verification
- Status validation
- isDraft flag processing
- SQL query construction and execution
- Response data
- Error handling with full stack traces

**Log markers:**
- `🔄 ===== UPDATE CAMPAIGN START =====`
- `📝 Campaign ID:`, `👤 Founder ID:`
- `📦 Update Data:`
- `🔍 Campaign found:`
- `📊 Campaign status:`
- `🎯 isDraft value:`, `🎯 New status:`
- `📝 SQL Query:`, `📝 SQL placeholders:`
- `⚙️ Executing SQL update...`
- `✅ SQL update executed successfully`
- `✅ Campaign update successful!`
- `❌ ===== UPDATE CAMPAIGN ERROR =====`

## Frontend - Campaign Editor (`frontend/src/components/ui/CampaignEditor.jsx`)

### Save Function
Added detailed logging for:
- Save mode (create/edit)
- Campaign ID
- Draft status
- Validation errors
- Payload data
- Request URL and method
- Response status and data
- Image uploads
- Navigation
- Error handling

**Log markers:**
- `💾 ===== CAMPAIGN EDITOR SAVE START =====`
- `📝 Mode:`, `📝 Campaign ID:`, `📝 Is Draft:`
- `📦 Payload:`
- `🌐 Request URL:`, `🌐 Request Method:`
- `📡 Response status:`, `📡 Response data:`
- `✅ Campaign ID:`
- `📸 Uploading main image...`
- `✅ Save successful!`
- `🧭 Navigating to:`
- `❌ ===== CAMPAIGN EDITOR SAVE ERROR =====`

## Frontend - Campaign Service (`frontend/src/services/CampaignService.js`)

### Update Campaign Method
Added detailed logging for:
- Campaign ID
- Campaign data being sent
- Response data
- Error details including response data

**Log markers:**
- `🔄 ===== FRONTEND UPDATE CAMPAIGN START =====`
- `📝 Campaign ID:`, `📦 Campaign Data:`
- `✅ Campaign updated successfully!`
- `📤 Response:`
- `❌ ===== FRONTEND UPDATE CAMPAIGN ERROR =====`

## Frontend - Navbar (`frontend/src/components/layout/Navbars.jsx`)

### Profile Image Loading
Added detailed logging for:
- User context updates
- Profile image URL construction
- Cache-busting timestamp
- Image load success/failure
- Search functionality
- Logout process

**Log markers:**
- `🖼️ Navbar: User context updated:`
- `🖼️ ProfileDropdown: Building profile image URL`
- `✅ Navbar: Profile image loaded successfully`
- `❌ Navbar: Profile image failed to load:`
- `🔍 Navbar: Search submitted:`
- `💡 Navbar: Suggestion clicked:`
- `🚪 Navbar: Logging out...`

## How to Use These Logs

1. Open your browser's Developer Console (F12)
2. Try to update a campaign or view profile images
3. Look for the emoji markers in the console
4. The logs will show:
   - What data is being sent
   - What the server receives
   - SQL queries being executed
   - Response data
   - Any errors with full details

## Common Issues to Look For

### Campaign Update Issues
- Check if `isDraft` value is correct (should be boolean or string 'true'/'false')
- Verify SQL placeholder count matches values count
- Check if campaign status allows updates (must be 'draft' or 'rejected')
- Verify ownership (founder_id matches userId)

### Profile Image Issues
- Check if `profileImageUrl` exists in user context
- Verify `profileImageTimestamp` is being set
- Check if image URL is being constructed correctly
- Look for CORS or 404 errors on image load

## Next Steps

After reproducing the issue:
1. Copy the console logs
2. Look for the error markers (❌)
3. Check the data being sent vs what's expected
4. Verify the SQL query structure
5. Check response status codes
