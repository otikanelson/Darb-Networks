# STEP 6 Part B Testing Checklist

## Overview
Integration of Review step, step navigator, draft persistence, and autosave into CampaignEditor.

## Manual Test Cases

### 1. Create Campaign Flow (Create Mode)

#### 1.1 Start New Campaign
- [ ] Navigate to `/create-campaign`
- [ ] Verify sidebar shows "New Campaign" header
- [ ] Verify 10 steps displayed in CampaignStepNav
- [ ] Verify RestoreDraftPrompt does NOT appear (no prior draft)
- [ ] Verify progress bar shows 0% complete

#### 1.2 Fill Step 1 (Basics)
- [ ] Enter campaign title (10+ chars)
- [ ] Select category
- [ ] Select country
- [ ] Enter location
- [ ] Enter description (50+ chars)
- [ ] Click "Continue"
- [ ] Verify step nav shows step 1 as "complete" (green checkmark)
- [ ] Verify progress bar advances

#### 1.3 Draft Auto-Save (Pre-first-save)
- [ ] Stop on any step and refresh page
- [ ] Verify RestoreDraftPrompt appears
- [ ] Verify draft data is restored correctly
- [ ] Click "Start Fresh" to discard draft
- [ ] Verify RestoreDraftPrompt disappears
- [ ] Click "Back" to go to step 1
- [ ] Enter data again, don't save

#### 1.4 Manual Draft Save
- [ ] Click "Save Draft" button in sidebar
- [ ] Verify "Draft saved!" toast appears
- [ ] Verify SaveStatusIndicator shows "Saved · now"
- [ ] Refresh page
- [ ] Verify RestoreDraftPrompt appears (draft persisted)
- [ ] Click "Restore" to restore the draft
- [ ] Verify all data is restored

#### 1.5 Fill Required Steps (Basics, Problem, Solution, Funding)
- [ ] Complete steps 1–3 and step 9 (Funding)
- [ ] Verify all 4 steps show as "complete" in step nav
- [ ] Verify no "error" icons in step nav
- [ ] Proceed to Review step (step 10)

#### 1.6 Review Step
- [ ] Verify campaign preview displays
- [ ] Verify validation checklist shows all 9 items
- [ ] Verify all 9 items have green checkmarks (valid)
- [ ] Verify "Submit for Approval" button is enabled
- [ ] Click "Submit for Approval"
- [ ] Verify "Campaign submitted for review!" toast
- [ ] Verify navigation to `/campaign/{cId}` (campaign detail page)
- [ ] Verify localStorage draft is cleared

#### 1.7 First Save Transition (Create→Edit)
- [ ] From my-campaigns, edit the campaign
- [ ] Verify mode is "edit" (sidebar says "Editing Campaign")
- [ ] Verify SaveStatusIndicator is visible
- [ ] Make a change to form (e.g., title)
- [ ] Verify autosave triggers after 3 seconds
- [ ] Verify SaveStatusIndicator shows "Saving…" then "Saved · 0m ago"
- [ ] Refresh page
- [ ] Verify changes persist

#### 1.8 Navigation Blocker
- [ ] While editing with unsaved changes
- [ ] Attempt to navigate away (via browser back/forward)
- [ ] Verify browser prompt warns about unsaved changes
- [ ] Click "Stay" to continue editing

### 2. Edit Campaign Flow (Edit Mode)

#### 2.1 Open Existing Campaign for Edit
- [ ] Navigate to `/edit-campaign/{campaignId}`
- [ ] Verify sidebar shows "Editing Campaign"
- [ ] Verify all data loads correctly
- [ ] Verify RestoreDraftPrompt does NOT appear

#### 2.2 Autosave in Edit Mode
- [ ] Make a change to title
- [ ] Wait 3 seconds
- [ ] Verify SaveStatusIndicator shows "Saving…"
- [ ] Verify after save: "Saved · 0m ago"
- [ ] Make another change
- [ ] Verify autosave triggers again after 3s delay
- [ ] Refresh page
- [ ] Verify all changes persist

#### 2.3 Step Navigation (Edit Mode)
- [ ] Click on previously completed steps
- [ ] Verify able to jump backward
- [ ] Verify CampaignStepNav shows step state correctly
- [ ] Verify validation errors appear if fields are invalid

### 3. Review Step Features

#### 3.1 Campaign Preview
- [ ] Verify cover image displays (or placeholder)
- [ ] Verify category, title, location shown
- [ ] Verify description preview
- [ ] Verify funding info (target, min investment, deadline)
- [ ] Verify problem & solution sections display

#### 3.2 Validation Checklist
- [ ] Verify all 9 items listed:
  - [ ] Campaign Title
  - [ ] Description
  - [ ] Category & Country
  - [ ] Problem Statement
  - [ ] Solution
  - [ ] Target Amount
  - [ ] Minimum Investment
  - [ ] End Date
  - [ ] Cover Image
- [ ] For each item: verify it shows green checkmark (valid) or red X (invalid)
- [ ] Click "Fix" button on any invalid item
- [ ] Verify navigation to corresponding step
- [ ] Fix the field, return to Review
- [ ] Verify item now shows as valid

#### 3.3 Submit Button
- [ ] With all items valid: "Submit for Approval" button enabled, full color
- [ ] With 1+ items invalid: button disabled, faded
- [ ] Click submit when valid: proceed to campaign detail page

### 4. CampaignStepNav Features

#### 4.1 Step States
- [ ] Incomplete steps: empty circle with number, gray bg
- [ ] Complete steps: green circle with checkmark
- [ ] Error steps: red circle with alert icon
- [ ] Current step: primary color bg with highlight

#### 4.2 Navigation
- [ ] Can only click backward (to previous steps)
- [ ] Cannot click forward (to future steps)
- [ ] Click on completed step: jump to that step
- [ ] Clicking disabled step does nothing

#### 4.3 Mobile Responsiveness
- [ ] On mobile: step nav hidden (not in sidebar)
- [ ] Mobile step bar shows: "Step N of M"
- [ ] Progress bar displays correctly

### 5. SaveStatusIndicator

#### 5.1 Saving State
- [ ] Verify spinner + "Saving…" text during save
- [ ] Verify indicator positioned in sidebar header

#### 5.2 Saved State
- [ ] After save completes: green checkmark + "Saved · 0m ago"
- [ ] After 3 seconds: indicator fades/hides

#### 5.3 Error State
- [ ] Trigger save error (disconnect network, invalid data)
- [ ] Verify red X + "Save failed" text
- [ ] After 3 seconds: indicator hides

### 6. RestoreDraftPrompt

#### 6.1 Initial Load
- [ ] Fresh create campaign with no prior draft
- [ ] Verify RestoreDraftPrompt does NOT appear
- [ ] Save a draft, refresh
- [ ] Verify RestoreDraftPrompt DOES appear

#### 6.2 Restore Action
- [ ] Click "Restore"
- [ ] Verify all draft data populated
- [ ] Verify form fields pre-filled
- [ ] Verify RestoreDraftPrompt closes

#### 6.3 Discard Action
- [ ] Click "Start Fresh"
- [ ] Verify form resets to empty
- [ ] Verify localStorage draft cleared
- [ ] Verify RestoreDraftPrompt closes

### 7. Edge Cases

#### 7.1 Validation Errors
- [ ] Submit with missing required fields
- [ ] Verify error banner displayed
- [ ] Verify step nav shows error icons for failed steps
- [ ] Fix errors, re-submit
- [ ] Verify success

#### 7.2 Network Errors
- [ ] Save with network disconnected
- [ ] Verify error toast and SaveStatusIndicator show error
- [ ] Reconnect and retry
- [ ] Verify save succeeds

#### 7.3 Image Compression (Part of Step 4)
- [ ] Upload large image (>5MB)
- [ ] Verify image compressed to <1.5MB
- [ ] Verify compressed image uploaded successfully

#### 7.4 Multiple Saves
- [ ] Make changes, save (manual or auto)
- [ ] Verify success
- [ ] Make more changes, save again
- [ ] Verify second save succeeds
- [ ] Verify all changes persist

#### 7.5 Back Button Flow (Create→Edit)
- [ ] Create campaign, save first time
- [ ] Verify navigates to campaign detail OR my-campaigns
- [ ] Verify localStorage draft cleared
- [ ] Edit campaign from my-campaigns
- [ ] Make changes, save
- [ ] Verify persist without issues

## Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1.1 Start New Campaign | ⬜ | |
| 1.2 Fill Step 1 | ⬜ | |
| 1.3 Draft Auto-Save | ⬜ | |
| 1.4 Manual Draft Save | ⬜ | |
| 1.5 Fill Required Steps | ⬜ | |
| 1.6 Review Step | ⬜ | |
| 1.7 First Save Transition | ⬜ | |
| 1.8 Navigation Blocker | ⬜ | |
| 2.1 Edit Campaign | ⬜ | |
| 2.2 Autosave Edit Mode | ⬜ | |
| 2.3 Step Navigation | ⬜ | |
| 3.1 Campaign Preview | ⬜ | |
| 3.2 Validation Checklist | ⬜ | |
| 3.3 Submit Button | ⬜ | |
| 4.1 Step States | ⬜ | |
| 4.2 Navigation | ⬜ | |
| 4.3 Mobile Responsive | ⬜ | |
| 5.1 Saving State | ⬜ | |
| 5.2 Saved State | ⬜ | |
| 5.3 Error State | ⬜ | |
| 6.1 Initial Load | ⬜ | |
| 6.2 Restore Action | ⬜ | |
| 6.3 Discard Action | ⬜ | |
| 7.1 Validation Errors | ⬜ | |
| 7.2 Network Errors | ⬜ | |
| 7.3 Image Compression | ⬜ | |
| 7.4 Multiple Saves | ⬜ | |
| 7.5 Back Button Flow | ⬜ | |

## Notes

**Integration Points Verified:**
- ✅ CampaignEditor imports all new components
- ✅ Review step added as 10th step in STEPS array
- ✅ useCampaignDraft hook integrated with autosave callback
- ✅ useNavigationBlocker integrated
- ✅ RestoreDraftPrompt rendered on condition
- ✅ CampaignStepNav replaces inline navigation with enhanced state tracking
- ✅ SaveStatusIndicator rendered in sidebar
- ✅ Save function calls markAsSaved() on first save
- ✅ All file dependencies present

**Code Quality:**
- ✅ No missing imports
- ✅ All component props properly typed/passed
- ✅ Proper error handling in save function
- ✅ Proper state management
- ✅ Responsive layout maintained

**To Test:**
1. Run `npm run dev` to start frontend
2. Run backend on separate terminal or verify it's running
3. Test scenarios in order above
4. Document results in this checklist
