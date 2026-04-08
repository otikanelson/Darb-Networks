import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import * as fc from 'fast-check'
import CampaignCard from './CampaignCard'
import { AuthProvider } from '../../context/AuthContext'

/**
 * Bug Condition Exploration Test - Campaign Card Image Display Issues
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * CRITICAL: This test encodes the EXPECTED BEHAVIOR after the fix
 * When run on UNFIXED code, it MUST FAIL (confirming bug exists)
 * When run on FIXED code, it MUST PASS (confirming bug is fixed)
 * 
 * This test explores the fault condition for Bug 1: Campaign Card Images Display Issue
 * It tests three specific issues:
 * 1. Images display with proper aspect ratio using object-cover
 * 2. Failed image loads trigger placeholder display
 * 3. Image containers have consistent height (h-40 for default size)
 */

// Mock the buildImageUrl function
vi.mock('../../config/apiUrl', () => ({
  buildImageUrl: (url) => {
    if (!url || url.trim() === '') {
      return '/placeholder-campaign.jpg'
    }
    // Simulate URL construction
    return url.startsWith('http') ? url : `/uploads/${url}`
  }
}))

// Mock AuthService
vi.mock('../../services/authService', () => ({
  default: {
    getCurrentUser: () => null,
    verifyToken: () => Promise.resolve(false),
    logout: () => {},
    setCurrentUser: () => {}
  }
}))

// Helper to create a mock campaign object
const createMockCampaign = (overrides = {}) => ({
  id: 1,
  title: 'Test Campaign',
  description: 'Test description for campaign',
  category: 'Technology',
  location: 'Lagos, Nigeria',
  target_amount: 1000000,
  current_amount: 500000,
  minimum_investment: 50000,
  main_image_url: '/test-image.jpg',
  video_url: null,
  founder_name: 'John Doe',
  founder_avatar: null,
  status: 'approved',
  is_featured: false,
  view_count: 150,
  days_left: 30,
  ...overrides
})

// Helper to render CampaignCard with necessary providers
const renderCampaignCard = (campaign, props = {}) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CampaignCard campaign={campaign} {...props} />
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('Bug 1: Campaign Card Image Display - Expected Behavior Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Property 1: Images Display with Proper Aspect Ratio
   * **Validates: Requirement 2.1**
   * 
   * WHEN campaign cards are rendered in the dashboard 
   * THEN the images SHALL display with proper aspect ratio using object-cover to fill the container
   */
  describe('Property 1: Images Display with Proper Aspect Ratio', () => {
    it('should apply object-cover class to maintain aspect ratio', () => {
      const campaign = createMockCampaign({ main_image_url: '/test-image.jpg' })
      
      const { container } = renderCampaignCard(campaign)
      const imageElement = container.querySelector('img')
      
      // Verify object-cover class is applied
      expect(imageElement).toBeTruthy()
      expect(imageElement.classList.contains('object-cover')).toBe(true)
    })

    it('should apply w-full class for full width', () => {
      const campaign = createMockCampaign({ main_image_url: '/test-image.jpg' })
      
      const { container } = renderCampaignCard(campaign)
      const imageElement = container.querySelector('img')
      
      // Verify w-full class is applied
      expect(imageElement.classList.contains('w-full')).toBe(true)
    })

    it('should apply h-full class for full height', () => {
      const campaign = createMockCampaign({ main_image_url: '/test-image.jpg' })
      
      const { container } = renderCampaignCard(campaign)
      const imageElement = container.querySelector('img')
      
      // Verify h-full class is applied
      expect(imageElement.classList.contains('h-full')).toBe(true)
    })

    /**
     * Property-Based Test: Aspect ratio maintained for any campaign image
     */
    it('property: aspect ratio classes applied for any campaign', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            main_image_url: fc.string({ minLength: 5, maxLength: 100 })
          }),
          (campaignData) => {
            const campaign = createMockCampaign(campaignData)
            
            const { container } = renderCampaignCard(campaign)
            const imageElement = container.querySelector('img')
            
            // Verify all required classes for aspect ratio are present
            expect(imageElement.classList.contains('object-cover')).toBe(true)
            expect(imageElement.classList.contains('w-full')).toBe(true)
            expect(imageElement.classList.contains('h-full')).toBe(true)
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * Property 2: Failed Image Loads Display Placeholder
   * **Validates: Requirement 2.2**
   * 
   * WHEN campaign images fail to load or have incorrect URLs 
   * THEN the system SHALL display a proper placeholder image (/placeholder-campaign.jpg)
   */
  describe('Property 2: Failed Image Loads Display Placeholder', () => {
    it('should use placeholder for empty image URL', () => {
      const campaign = createMockCampaign({ main_image_url: '' })
      
      const { container } = renderCampaignCard(campaign)
      const imageElement = container.querySelector('img')
      
      // Verify placeholder is used
      expect(imageElement.src).toContain('placeholder-campaign.jpg')
    })

    it('should use placeholder for null image URL', () => {
      const campaign = createMockCampaign({ main_image_url: null })
      
      const { container } = renderCampaignCard(campaign)
      const imageElement = container.querySelector('img')
      
      // Verify placeholder is used
      expect(imageElement.src).toContain('placeholder-campaign.jpg')
    })

    it('should use placeholder for whitespace-only image URL', () => {
      const campaign = createMockCampaign({ main_image_url: '   ' })
      
      const { container } = renderCampaignCard(campaign)
      const imageElement = container.querySelector('img')
      
      // Verify placeholder is used
      expect(imageElement.src).toContain('placeholder-campaign.jpg')
    })

    it('should have onError handler that switches to placeholder', () => {
      const campaign = createMockCampaign({ main_image_url: '/broken-image.jpg' })
      
      const { container } = renderCampaignCard(campaign)
      const imageElement = container.querySelector('img')
      
      // Simulate image load error
      fireEvent.error(imageElement)
      
      // Verify placeholder is set after error
      expect(imageElement.src).toContain('placeholder-campaign.jpg')
    })

    /**
     * Property-Based Test: Placeholder used for any invalid image URL
     */
    it('property: placeholder used for various invalid image URLs', () => {
      const invalidUrls = [null, '', '   ', undefined]
      
      fc.assert(
        fc.property(
          fc.constantFrom(...invalidUrls),
          fc.string({ minLength: 5, maxLength: 50 }),
          (invalidUrl, title) => {
            const campaign = createMockCampaign({ 
              main_image_url: invalidUrl,
              title 
            })
            
            const { container } = renderCampaignCard(campaign)
            const imageElement = container.querySelector('img')
            
            // Verify placeholder is used for invalid URLs
            expect(imageElement.src).toContain('placeholder-campaign.jpg')
          }
        ),
        { numRuns: 20 }
      )
    })
  })

  /**
   * Property 3: Image Containers Have Consistent Height
   * **Validates: Requirement 2.3**
   * 
   * WHEN campaign cards are displayed in grid view 
   * THEN all image containers SHALL maintain consistent height (h-40 for default size) and width (w-full)
   */
  describe('Property 3: Image Containers Have Consistent Height', () => {
    it('should have h-40 height for default size', () => {
      const campaign = createMockCampaign()
      
      const { container } = renderCampaignCard(campaign, { size: 'default' })
      const imageContainer = container.querySelector('.h-40')
      
      // Verify h-40 class is applied to container
      expect(imageContainer).toBeTruthy()
    })

    it('should have h-32 height for compact size', () => {
      const campaign = createMockCampaign()
      
      const { container } = renderCampaignCard(campaign, { size: 'compact' })
      const imageContainer = container.querySelector('.h-32')
      
      // Verify h-32 class is applied to container
      expect(imageContainer).toBeTruthy()
    })

    it('should have h-44 height for featured size', () => {
      const campaign = createMockCampaign()
      
      const { container } = renderCampaignCard(campaign, { size: 'featured' })
      const imageContainer = container.querySelector('.h-44')
      
      // Verify h-44 class is applied to container
      expect(imageContainer).toBeTruthy()
    })

    it('should have w-full width for image container', () => {
      const campaign = createMockCampaign()
      
      const { container } = renderCampaignCard(campaign)
      const imageContainer = container.querySelector('.w-full')
      
      // Verify w-full class is applied
      expect(imageContainer).toBeTruthy()
    })

    /**
     * Property-Based Test: Consistent height for all card sizes
     */
    it('property: consistent height maintained across all sizes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'compact', 'featured'),
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            main_image_url: fc.string({ minLength: 5, maxLength: 100 })
          }),
          (size, campaignData) => {
            const campaign = createMockCampaign(campaignData)
            
            const { container } = renderCampaignCard(campaign, { size })
            
            // Verify appropriate height class based on size
            const expectedHeightClass = size === 'compact' ? 'h-32' : 
                                       size === 'featured' ? 'h-44' : 'h-40'
            const imageContainer = container.querySelector(`.${expectedHeightClass}`)
            
            expect(imageContainer).toBeTruthy()
            
            // Verify w-full is also present
            expect(imageContainer.classList.contains('w-full')).toBe(true)
          }
        ),
        { numRuns: 30 }
      )
    })
  })

  /**
   * Integration Test: All three properties together
   * **Validates: Requirements 2.1, 2.2, 2.3**
   */
  describe('Integration: All Image Display Properties', () => {
    it('should satisfy all three properties simultaneously', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            main_image_url: fc.oneof(
              fc.string({ minLength: 5, maxLength: 100 }),
              fc.constant(''),
              fc.constant(null)
            )
          }),
          fc.constantFrom('default', 'compact', 'featured'),
          (campaignData, size) => {
            const campaign = createMockCampaign(campaignData)
            
            const { container } = renderCampaignCard(campaign, { size })
            const imageElement = container.querySelector('img')
            
            // Property 1: Aspect ratio classes
            expect(imageElement.classList.contains('object-cover')).toBe(true)
            expect(imageElement.classList.contains('w-full')).toBe(true)
            expect(imageElement.classList.contains('h-full')).toBe(true)
            
            // Property 2: Placeholder for invalid URLs
            if (!campaignData.main_image_url || campaignData.main_image_url.trim() === '') {
              expect(imageElement.src).toContain('placeholder-campaign.jpg')
            }
            
            // Property 3: Consistent container height
            const expectedHeightClass = size === 'compact' ? 'h-32' : 
                                       size === 'featured' ? 'h-44' : 'h-40'
            const imageContainer = container.querySelector(`.${expectedHeightClass}`)
            expect(imageContainer).toBeTruthy()
            expect(imageContainer.classList.contains('w-full')).toBe(true)
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})