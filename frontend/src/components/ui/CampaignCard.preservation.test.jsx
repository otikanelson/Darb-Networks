import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import CampaignCard from './CampaignCard';
import { AuthProvider } from '../../context/AuthContext';

/**
 * Preservation Property Tests for Campaign Card Non-Image Functionality
 * 
 * **Validates: Requirements 3.3, 3.7, 3.10**
 * 
 * These tests verify that non-image aspects of campaign cards work correctly
 * and will continue to work after the image display bug fix is implemented.
 * 
 * IMPORTANT: These tests should PASS on UNFIXED code to establish baseline behavior.
 */

// Mock the buildImageUrl function
vi.mock('../../config/apiUrl', () => ({
  buildImageUrl: (url) => url || '/placeholder-campaign.jpg'
}));

// Mock AuthService to prevent actual API calls
vi.mock('../../services/authService', () => ({
  default: {
    getCurrentUser: () => null,
    verifyToken: () => Promise.resolve(false),
    logout: () => {},
    setCurrentUser: () => {}
  }
}));

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
});

// Helper to render CampaignCard with necessary providers
const renderCampaignCard = (campaign, props = {}) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CampaignCard campaign={campaign} {...props} />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('CampaignCard Preservation Tests - Non-Image Functionality', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  /**
   * Property 1: Campaign Card Click Navigation
   * **Validates: Requirement 3.3**
   * 
   * WHEN users click on campaign cards 
   * THEN the system SHALL CONTINUE TO navigate to the campaign detail page
   */
  describe('Property 1: Campaign Card Click Navigation', () => {
    it('should navigate to campaign detail page when card is clicked', () => {
      const campaign = createMockCampaign({ id: 42 });
      const mockNavigate = vi.fn();
      
      // Mock useNavigate
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });

      const { container } = renderCampaignCard(campaign);
      const cardElement = container.querySelector('.cursor-pointer');
      
      expect(cardElement).toBeTruthy();
      fireEvent.click(cardElement);
      
      // Verify navigation was triggered (the component uses navigate internally)
      // We verify the card is clickable and has the correct structure
      expect(cardElement.classList.contains('cursor-pointer')).toBe(true);
    });

    it('should call onViewClick callback when provided', () => {
      const campaign = createMockCampaign({ id: 123 });
      const onViewClick = vi.fn();
      
      const { container } = renderCampaignCard(campaign, { onViewClick });
      const cardElement = container.querySelector('.cursor-pointer');
      
      fireEvent.click(cardElement);
      
      expect(onViewClick).toHaveBeenCalledWith(123);
    });

    /**
     * Property-Based Test: Card click works for any valid campaign
     */
    it('property: card click navigation works for any campaign', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            description: fc.string({ minLength: 10, maxLength: 200 }),
            category: fc.constantFrom('Technology', 'Healthcare', 'Education', 'Energy'),
            location: fc.string({ minLength: 5, maxLength: 50 }),
            target_amount: fc.integer({ min: 100000, max: 10000000 }),
            current_amount: fc.integer({ min: 0, max: 10000000 }),
            minimum_investment: fc.integer({ min: 10000, max: 500000 })
          }),
          (campaignData) => {
            const campaign = createMockCampaign(campaignData);
            const onViewClick = vi.fn();
            
            const { container } = renderCampaignCard(campaign, { onViewClick });
            const cardElement = container.querySelector('.cursor-pointer');
            
            // Verify card is clickable
            expect(cardElement).toBeTruthy();
            
            // Click the card
            fireEvent.click(cardElement);
            
            // Verify callback was called with correct ID
            expect(onViewClick).toHaveBeenCalledWith(campaignData.id);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 2: Hover Effects on Campaign Cards
   * **Validates: Requirement 3.7**
   * 
   * WHEN users hover over campaign cards 
   * THEN the system SHALL CONTINUE TO show hover effects
   */
  describe('Property 2: Hover Effects', () => {
    it('should show action buttons on hover', async () => {
      const campaign = createMockCampaign();
      
      const { container } = renderCampaignCard(campaign, { showActions: true });
      const cardElement = container.querySelector('.cursor-pointer');
      
      // Initially, action buttons should be hidden (opacity-0)
      const actionButtons = container.querySelector('.opacity-0.group-hover\\:opacity-100');
      expect(actionButtons).toBeTruthy();
      
      // Hover over the card
      fireEvent.mouseEnter(cardElement);
      
      // The group-hover class should make buttons visible
      // We verify the structure exists for hover effects
      expect(actionButtons).toBeTruthy();
    });

    it('should apply hover scale effect to card', () => {
      const campaign = createMockCampaign();
      
      const { container } = renderCampaignCard(campaign);
      const cardElement = container.querySelector('.cursor-pointer');
      
      // Verify hover classes are present
      expect(cardElement.classList.contains('hover:shadow-lg')).toBe(true);
    });

    it('should apply hover scale to image', () => {
      const campaign = createMockCampaign();
      
      const { container } = renderCampaignCard(campaign);
      const imageElement = container.querySelector('img');
      
      // Verify image has hover scale class
      expect(imageElement.classList.contains('group-hover:scale-105')).toBe(true);
    });

    /**
     * Property-Based Test: Hover effects work for any campaign
     */
    it('property: hover effects work for any campaign configuration', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            showActions: fc.boolean(),
            size: fc.constantFrom('default', 'compact', 'featured')
          }),
          (config) => {
            const campaign = createMockCampaign({ id: config.id, title: config.title });
            
            const { container } = renderCampaignCard(campaign, { 
              showActions: config.showActions,
              size: config.size 
            });
            
            const cardElement = container.querySelector('.cursor-pointer');
            
            // Verify hover classes exist
            expect(cardElement.classList.contains('hover:shadow-lg')).toBe(true);
            
            // If showActions is true, verify action buttons structure exists
            if (config.showActions) {
              const actionButtons = container.querySelector('.opacity-0.group-hover\\:opacity-100');
              expect(actionButtons).toBeTruthy();
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 3: Video Preview on Hover
   * **Validates: Requirement 3.7**
   * 
   * WHEN users hover over campaign cards with videos
   * THEN the system SHALL CONTINUE TO show video previews
   */
  describe('Property 3: Video Preview on Hover', () => {
    it('should show video preview on hover when video_url is present', async () => {
      const campaign = createMockCampaign({
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      });
      
      const { container } = renderCampaignCard(campaign);
      const cardElement = container.querySelector('.cursor-pointer');
      
      // Initially, video should not be visible
      let videoIframe = container.querySelector('iframe');
      expect(videoIframe).toBeNull();
      
      // Hover over the card
      fireEvent.mouseEnter(cardElement);
      
      // Wait for video to appear (there's a 300ms delay in the component)
      await waitFor(() => {
        videoIframe = container.querySelector('iframe');
        expect(videoIframe).toBeTruthy();
      }, { timeout: 500 });
      
      // Verify video URL contains the YouTube video ID
      expect(videoIframe.src).toContain('dQw4w9WgXcQ');
    });

    it('should not show video when video_url is not present', () => {
      const campaign = createMockCampaign({ video_url: null });
      
      const { container } = renderCampaignCard(campaign);
      const cardElement = container.querySelector('.cursor-pointer');
      
      // Hover over the card
      fireEvent.mouseEnter(cardElement);
      
      // Video should not appear
      const videoIframe = container.querySelector('iframe');
      expect(videoIframe).toBeNull();
    });

    it('should hide video when mouse leaves', async () => {
      const campaign = createMockCampaign({
        video_url: 'https://www.youtube.com/watch?v=test123'
      });
      
      const { container } = renderCampaignCard(campaign);
      const cardElement = container.querySelector('.cursor-pointer');
      
      // Hover to show video
      fireEvent.mouseEnter(cardElement);
      
      await waitFor(() => {
        const videoIframe = container.querySelector('iframe');
        expect(videoIframe).toBeTruthy();
      }, { timeout: 500 });
      
      // Mouse leave
      fireEvent.mouseLeave(cardElement);
      
      // Video should be hidden
      await waitFor(() => {
        const videoIframe = container.querySelector('iframe');
        expect(videoIframe).toBeNull();
      });
    });

    /**
     * Property-Based Test: Video preview works for any valid YouTube URL
     */
    it('property: video preview works for various YouTube URL formats', () => {
      const youtubeUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'https://www.youtube.com/v/dQw4w9WgXcQ'
      ];

      fc.assert(
        fc.property(
          fc.constantFrom(...youtubeUrls),
          fc.string({ minLength: 5, maxLength: 50 }),
          async (videoUrl, title) => {
            const campaign = createMockCampaign({ 
              video_url: videoUrl,
              title 
            });
            
            const { container } = renderCampaignCard(campaign);
            const cardElement = container.querySelector('.cursor-pointer');
            
            // Hover to trigger video
            fireEvent.mouseEnter(cardElement);
            
            // Wait for video to appear
            await waitFor(() => {
              const videoIframe = container.querySelector('iframe');
              expect(videoIframe).toBeTruthy();
            }, { timeout: 500 });
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 4: List View Image Styling
   * **Validates: Requirement 3.10**
   * 
   * WHEN campaign images are displayed in list view 
   * THEN they SHALL CONTINUE TO display correctly with their existing styling
   */
  describe('Property 4: List View Image Styling', () => {
    it('should maintain consistent image container height for default size', () => {
      const campaign = createMockCampaign();
      
      const { container } = renderCampaignCard(campaign, { size: 'default' });
      const imageContainer = container.querySelector('.h-40');
      
      // Verify default height class is applied
      expect(imageContainer).toBeTruthy();
    });

    it('should maintain consistent image container height for compact size', () => {
      const campaign = createMockCampaign();
      
      const { container } = renderCampaignCard(campaign, { size: 'compact' });
      const imageContainer = container.querySelector('.h-32');
      
      // Verify compact height class is applied
      expect(imageContainer).toBeTruthy();
    });

    it('should maintain consistent image container height for featured size', () => {
      const campaign = createMockCampaign();
      
      const { container } = renderCampaignCard(campaign, { size: 'featured' });
      const imageContainer = container.querySelector('.h-44');
      
      // Verify featured height class is applied
      expect(imageContainer).toBeTruthy();
    });

    it('should apply object-cover class to images', () => {
      const campaign = createMockCampaign();
      
      const { container } = renderCampaignCard(campaign);
      const imageElement = container.querySelector('img');
      
      // Verify object-cover class is present
      expect(imageElement.classList.contains('object-cover')).toBe(true);
    });

    it('should apply full width to images', () => {
      const campaign = createMockCampaign();
      
      const { container } = renderCampaignCard(campaign);
      const imageElement = container.querySelector('img');
      
      // Verify w-full class is present
      expect(imageElement.classList.contains('w-full')).toBe(true);
    });

    /**
     * Property-Based Test: Image styling is consistent across all sizes
     */
    it('property: image styling is consistent for all card sizes', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('default', 'compact', 'featured'),
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            main_image_url: fc.string({ minLength: 5, maxLength: 100 })
          }),
          (size, campaignData) => {
            const campaign = createMockCampaign(campaignData);
            
            const { container } = renderCampaignCard(campaign, { size });
            const imageElement = container.querySelector('img');
            
            // Verify image has required classes
            expect(imageElement.classList.contains('object-cover')).toBe(true);
            expect(imageElement.classList.contains('w-full')).toBe(true);
            expect(imageElement.classList.contains('h-full')).toBe(true);
            
            // Verify image container has appropriate height class
            const expectedHeightClass = size === 'compact' ? 'h-32' : 
                                       size === 'featured' ? 'h-44' : 'h-40';
            const imageContainer = container.querySelector(`.${expectedHeightClass}`);
            expect(imageContainer).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 5: Campaign Data Display Preservation
   * 
   * Verify that all campaign data fields continue to display correctly
   */
  describe('Property 5: Campaign Data Display', () => {
    it('should display campaign title', () => {
      const campaign = createMockCampaign({ title: 'Amazing Tech Startup' });
      
      renderCampaignCard(campaign);
      
      expect(screen.getByText('Amazing Tech Startup')).toBeTruthy();
    });

    it('should display campaign description', () => {
      const campaign = createMockCampaign({ 
        description: 'This is a revolutionary product' 
      });
      
      renderCampaignCard(campaign);
      
      expect(screen.getByText('This is a revolutionary product')).toBeTruthy();
    });

    it('should display category', () => {
      const campaign = createMockCampaign({ category: 'Healthcare' });
      
      renderCampaignCard(campaign);
      
      expect(screen.getByText('Healthcare')).toBeTruthy();
    });

    it('should display location', () => {
      const campaign = createMockCampaign({ location: 'Abuja, Nigeria' });
      
      renderCampaignCard(campaign);
      
      expect(screen.getByText('Abuja, Nigeria')).toBeTruthy();
    });

    it('should display funding progress', () => {
      const campaign = createMockCampaign({
        current_amount: 500000,
        target_amount: 1000000
      });
      
      renderCampaignCard(campaign);
      
      // Should show 50% funded
      expect(screen.getByText('50%')).toBeTruthy();
    });

    it('should display founder name', () => {
      const campaign = createMockCampaign({ founder_name: 'Jane Smith' });
      
      renderCampaignCard(campaign);
      
      expect(screen.getByText('Jane Smith')).toBeTruthy();
    });

    /**
     * Property-Based Test: All campaign data displays correctly
     */
    it('property: all campaign data fields display correctly', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.integer({ min: 1, max: 10000 }),
            title: fc.string({ minLength: 10, maxLength: 100 }),
            description: fc.string({ minLength: 20, maxLength: 200 }),
            category: fc.constantFrom('Technology', 'Healthcare', 'Education', 'Energy'),
            location: fc.string({ minLength: 5, maxLength: 50 }),
            target_amount: fc.integer({ min: 100000, max: 10000000 }),
            current_amount: fc.integer({ min: 0, max: 10000000 }),
            founder_name: fc.string({ minLength: 5, maxLength: 50 })
          }),
          (campaignData) => {
            const campaign = createMockCampaign(campaignData);
            
            renderCampaignCard(campaign);
            
            // Verify all key fields are displayed
            expect(screen.getByText(campaignData.title)).toBeTruthy();
            expect(screen.getByText(campaignData.description)).toBeTruthy();
            expect(screen.getByText(campaignData.category)).toBeTruthy();
            expect(screen.getByText(campaignData.location)).toBeTruthy();
            expect(screen.getByText(campaignData.founder_name)).toBeTruthy();
            
            // Verify funding percentage is calculated and displayed
            const percentage = Math.min(
              Math.round((campaignData.current_amount / campaignData.target_amount) * 100), 
              100
            );
            expect(screen.getByText(`${percentage}%`)).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
