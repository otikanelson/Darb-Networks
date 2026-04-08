# Implementation Plan

## Bug 1: Campaign Card Images Display Issue

- [-] 1.1 Write bug condition exploration test for image display
  - **Property 1: Fault Condition** - Campaign Card Image Display Issues
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate image display bugs exist
  - **Scoped PBT Approach**: Test concrete failing cases - images with incorrect aspect ratio, failed loads without fallbacks, inconsistent container heights
  - Test that campaign cards with images maintain aspect ratio using object-cover
  - Test that failed image loads trigger placeholder display
  - Test that image containers have consistent height (h-40 for default size)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "images stretched without object-cover", "no placeholder on load failure")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.2 Write preservation property tests for image functionality (BEFORE implementing fix)
  - **Property 2: Preservation** - Campaign Card Non-Image Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-image aspects (card clicks, hover effects, video previews)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that campaign card clicks navigate correctly
  - Test that hover effects work on cards
  - Test that video previews display correctly
  - Test that list view image styling remains unchanged
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.3, 3.7, 3.10_

- [x] 1.3 Fix campaign card image display issues

  - [x] 1.3.1 Implement the image display fixes
    - Ensure image container consistently applies height class from getImageHeight() with w-full
    - Enhance onError handler with robust fallback logic and error logging
    - Verify object-cover class is applied without CSS conflicts
    - Improve getImageUrl() function to handle edge cases (empty strings, malformed URLs)
    - Add try-catch in buildImageUrl() to return placeholder on errors
    - _Bug_Condition: isBugCondition_ImageDisplay(campaignCard) where aspect ratio not maintained OR failed load without fallback OR inconsistent height_
    - _Expected_Behavior: Images display with object-cover aspect ratio, placeholder on failure, consistent h-40 height_
    - _Preservation: Campaign card clicks, hover effects, video previews, list view styling remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.3, 3.7, 3.10_

  - [x] 1.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Campaign Card Image Display Correct
    - **IMPORTANT**: Re-run the SAME test from task 1.1 - do NOT write a new test
    - The test from task 1.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 1.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Campaign Card Non-Image Functionality Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 1.2 - do NOT write new tests
    - Run preservation property tests from step 1.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 2: Filter Sidebar Scroll Behavior

- [ ] 2.1 Write bug condition exploration test for sidebar scroll
  - **Property 1: Fault Condition** - Sidebar Scrolls Out of View
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate sidebar visibility bug exists
  - **Scoped PBT Approach**: Test concrete failing case - scroll position > viewport height with sidebar not visible
  - Test that sidebar remains visible when scrolled beyond viewport height
  - Test that sidebar has sticky or fixed positioning
  - Test that filters are accessible without scrolling back up
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "sidebar not visible at scroll position 1000px", "sidebar position is static")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.4, 1.5, 1.6_

- [ ] 2.2 Write preservation property tests for sidebar functionality (BEFORE implementing fix)
  - **Property 2: Preservation** - Sidebar Content and Mobile Behavior
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for sidebar content and mobile behavior
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that category filters work correctly
  - Test that quick links navigate properly
  - Test that mobile sidebar behavior (hidden with mobile filters button) remains unchanged
  - Test that sidebar content and functionality unchanged
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.8, 3.9_

- [ ] 2.3 Fix filter sidebar scroll behavior

  - [x] 2.3.1 Implement the sidebar sticky positioning
    - Add sticky positioning to sidebar container (sticky top-20 self-start)
    - Add max-height constraint (max-h-[calc(100vh-5rem)])
    - Add overflow-y-auto for scrolling within sidebar if needed
    - Adjust top offset to account for navbar height
    - Ensure sidebar doesn't overlap main content
    - _Bug_Condition: isBugCondition_SidebarScroll(dashboardState) where scrollPosition > viewportHeight AND sidebar not visible_
    - _Expected_Behavior: Sidebar remains visible with sticky positioning at all scroll positions_
    - _Preservation: Category filters, quick links, mobile sidebar behavior remain unchanged_
    - _Requirements: 2.4, 2.5, 2.6, 3.1, 3.2, 3.8, 3.9_

  - [x] 2.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Sidebar Remains Visible During Scroll
    - **IMPORTANT**: Re-run the SAME test from task 2.1 - do NOT write a new test
    - The test from task 2.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 2.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.4, 2.5, 2.6_

  - [x] 2.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Sidebar Content and Mobile Behavior Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2.2 - do NOT write new tests
    - Run preservation property tests from step 2.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 3: Campaign Seed Data Lacks Details

- [ ] 3.1 Write bug condition exploration test for seed data quality
  - **Property 1: Fault Condition** - Seeded Campaigns Lack Comprehensive Details
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate seed data quality issues exist
  - **Scoped PBT Approach**: Query all 25 seeded campaigns and verify data completeness criteria
  - Test that seeded campaigns have descriptions >= 200 characters
  - Test that seeded campaigns have >= 2 milestones each
  - Test that seeded campaigns have >= 1 team member each
  - Test that seeded campaigns have problem_statement and solution fields populated
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "campaign 'Tech Startup' has 50 char description", "0 milestones found")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.7, 1.8, 1.9_

- [ ] 3.2 Write preservation property tests for campaign data (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Campaign Data and Creation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-seeded campaigns and creation flow
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that existing non-seeded campaigns display unchanged
  - Test that new campaign creation works correctly
  - Test that campaign data structure remains compatible
  - Test that funding calculations remain accurate
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.11, 3.12, 3.13_

- [x] 3.3 Fix campaign seed data quality

  - [x] 3.3.1 Implement enhanced seed data
    - Create or enhance seed-campaigns.sql with comprehensive campaign data
    - Add detailed descriptions (200-500 characters) for all 25 campaigns
    - Add 2-4 milestones per campaign with titles, descriptions, dates, and media URLs
    - Add 1-3 team members per campaign with names, roles, bios, and profile images
    - Populate problem_statement and solution fields with realistic content
    - Add varied categories, locations, funding goals, and statuses
    - Update seed-campaigns.js to handle enhanced data and related tables
    - _Bug_Condition: isBugCondition_SeedData(campaign) where description < 200 chars OR no milestones OR no team OR missing content_
    - _Expected_Behavior: All seeded campaigns have comprehensive details (descriptions >= 200 chars, >= 2 milestones, >= 1 team member)_
    - _Preservation: Existing non-seeded campaigns, new campaign creation, data structure compatibility remain unchanged_
    - _Requirements: 2.7, 2.8, 2.9, 3.11, 3.12, 3.13_

  - [x] 3.3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Seeded Campaigns Have Comprehensive Details
    - **IMPORTANT**: Re-run the SAME test from task 3.1 - do NOT write a new test
    - The test from task 3.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 3.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.7, 2.8, 2.9_

  - [x] 3.3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Campaign Data and Creation Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 3.2 - do NOT write new tests
    - Run preservation property tests from step 3.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 4: Campaign View Page Missing New Fields

- [ ] 4.1 Write bug condition exploration test for missing fields
  - **Property 1: Fault Condition** - Milestones and Team Not Displayed on View Page
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate missing fields bug exists
  - **Scoped PBT Approach**: Test campaigns with backend milestone/team data that don't display on frontend
  - Test that campaigns with milestones in backend display milestones section on view page
  - Test that campaigns with team members in backend display team section on view page
  - Test that milestone and team API endpoints return correct data
  - Test that "Milestones" and "Team" tabs exist in UI
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "campaign has 3 milestones in API but no section on page", "no Team tab found")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.10, 1.11, 1.12_

- [ ] 4.2 Write preservation property tests for view page functionality (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing View Page Features
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for existing view page features
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that existing fields (title, description, funding, category) display correctly
  - Test that investment/backing functionality works
  - Test that favorite/share functionality works
  - Test that campaign images and videos render properly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.14, 3.15, 3.16_

- [x] 4.3 Fix campaign view page missing fields

  - [x] 4.3.1 Add backend API endpoints for milestones and team
    - Create GET /api/campaigns/:id/milestones endpoint
    - Create GET /api/campaigns/:id/team endpoint
    - Optionally include milestones and team in main campaign GET response
    - Ensure proper error handling and data formatting
    - _Bug_Condition: isBugCondition_MissingFields(campaignViewPage, backendData) where backend has data but page doesn't display it_
    - _Expected_Behavior: View page displays milestones and team sections when backend data exists_
    - _Preservation: Existing view page fields, investment functionality, favorite/share remain unchanged_
    - _Requirements: 2.10, 2.11, 2.12, 3.14, 3.15, 3.16_

  - [x] 4.3.2 Add frontend state and data fetching
    - Add state variables for milestones and teamMembers in CampaignDisplay.jsx
    - Create loadMilestones() function to fetch milestone data
    - Create loadTeamMembers() function to fetch team data
    - Call fetch functions in useEffect when component mounts
    - Add error handling for API calls
    - _Requirements: 2.10, 2.11, 2.12_

  - [x] 4.3.3 Create milestones display component
    - Add renderMilestones() function to display milestone list
    - Show milestone title, description, target date, and status
    - Display milestone images (if image_url present) and videos (if video_url present)
    - Handle empty state ("No milestones added yet")
    - Add proper styling with status badges and date formatting
    - _Requirements: 2.10, 2.12_

  - [x] 4.3.4 Create team display component
    - Add renderTeam() function to display team member grid
    - Show team member profile image (or initial fallback), name, role, and bio
    - Handle empty state ("No team members added yet")
    - Add proper styling with grid layout
    - _Requirements: 2.11, 2.12_

  - [ ] 4.3.5 Integrate into tab system
    - Add "Milestones" and "Team" tabs to existing tab navigation
    - Add conditional rendering based on activeTab state
    - Ensure tab switching works correctly
    - _Requirements: 2.10, 2.11, 2.12_

  - [x] 4.3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Milestones and Team Display on View Page
    - **IMPORTANT**: Re-run the SAME test from task 4.1 - do NOT write a new test
    - The test from task 4.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 4.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.10, 2.11, 2.12_

  - [x] 4.3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing View Page Features Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 4.2 - do NOT write new tests
    - Run preservation property tests from step 4.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Bug 5: Milestone Image Support Missing

- [ ] 5.1 Write bug condition exploration test for milestone image support
  - **Property 1: Fault Condition** - Milestones Cannot Add or Display Images
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate milestone image support missing
  - **Scoped PBT Approach**: Test concrete failing cases - no image upload field, images not displaying
  - Test that milestone creation form has image upload field
  - Test that milestone with image_url in database displays image on page
  - Test that backend accepts image file uploads for milestones
  - Test that database schema has image_url column in campaign_milestones table
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "no image upload field in form", "image_url not displayed")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.13, 1.14, 1.15_

- [ ] 5.2 Write preservation property tests for milestone video functionality (BEFORE implementing fix)
  - **Property 2: Preservation** - Milestone Video Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for video-only milestones
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that milestones with YouTube video URLs display correctly
  - Test that video URL validation and storage work properly
  - Test that milestone title, description, and date display correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.17, 3.18, 3.19_

- [ ] 5.3 Fix milestone image support

  - [-] 5.3.1 Add database schema support for images
    - Create migration to add image_url column to campaign_milestones table (if not exists)
    - Set column type to VARCHAR(500) NULL
    - Run migration to update database schema
    - _Bug_Condition: isBugCondition_MilestoneImages(milestone, userAction) where user wants to add image but cannot_
    - _Expected_Behavior: Milestones support both image uploads and video URLs with proper display_
    - _Preservation: Existing video functionality, milestone data display remain unchanged_
    - _Requirements: 2.13, 2.14, 2.15, 3.17, 3.18, 3.19_

  - [ ] 5.3.2 Add backend image upload handler
    - Install and configure multer middleware for file uploads
    - Create upload configuration (dest: uploads/milestones/, size limit: 5MB, file type validation)
    - Add image upload handler to milestone create/edit endpoints
    - Store uploaded image path in database image_url field
    - Add error handling for invalid file types and size limits
    - _Requirements: 2.13, 2.15_

  - [ ] 5.3.3 Add frontend image upload field
    - Create or update MilestoneForm component
    - Add file input field for image uploads with proper styling
    - Add image preview functionality when file selected
    - Add state management for imageFile and imagePreview
    - Handle file selection with handleImageChange function
    - _Requirements: 2.13, 2.15_

  - [ ] 5.3.4 Update form submission to handle images
    - Modify form submission to use FormData for multipart/form-data
    - Append image file to FormData if selected
    - Update fetch call to send FormData with proper headers
    - Handle response and display success/error messages
    - _Requirements: 2.13, 2.15_

  - [ ] 5.3.5 Update milestone display to show images
    - Modify milestone rendering to check for both image_url and video_url
    - Display image with proper styling (w-full h-64 object-cover rounded-lg) if image_url present
    - Display video if video_url present
    - Support displaying both image and video if both present
    - Add proper fallback for missing media
    - _Requirements: 2.14, 2.15_

  - [ ] 5.3.6 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Milestones Support Image Upload and Display
    - **IMPORTANT**: Re-run the SAME test from task 5.1 - do NOT write a new test
    - The test from task 5.1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 5.1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.13, 2.14, 2.15_

  - [ ] 5.3.7 Verify preservation tests still pass
    - **Property 2: Preservation** - Milestone Video Functionality Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 5.2 - do NOT write new tests
    - Run preservation property tests from step 5.2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

## Final Checkpoint

- [ ] 6. Checkpoint - Ensure all tests pass
  - Verify all bug condition exploration tests pass (tasks 1.3.2, 2.3.2, 3.3.2, 4.3.6, 5.3.6)
  - Verify all preservation tests pass (tasks 1.3.3, 2.3.3, 3.3.3, 4.3.7, 5.3.7)
  - Run full test suite to ensure no regressions
  - Test integration between fixes (e.g., seeded campaigns display correctly with new fields)
  - Ask the user if questions arise
