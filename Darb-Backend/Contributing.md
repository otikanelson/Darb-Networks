# Contributing to Darb Network

Welcome to the Darb Network community! We're excited that you're interested in contributing to our crowdfunding platform for Nigerian startups. This guide will help you get started with contributing to the project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Contributing Workflow](#contributing-workflow)
5. [Coding Standards](#coding-standards)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation](#documentation)
8. [Issue Guidelines](#issue-guidelines)
9. [Pull Request Process](#pull-request-process)
10. [Community](#community)

## 🤝 Code of Conduct

### Our Pledge

We are committed to making participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- **Being respectful** of differing viewpoints and experiences
- **Gracefully accepting** constructive criticism
- **Focusing on what is best** for the community
- **Showing empathy** towards other community members
- **Using welcoming and inclusive language**

Examples of unacceptable behavior include:

- The use of sexualized language or imagery
- Personal attacks or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at conduct@darbnetwork.com. All complaints will be reviewed and investigated promptly and fairly.

## 🚀 Getting Started

### Prerequisites

Before contributing, make sure you have:

- **Node.js** (v16.0.0 or higher)
- **MySQL** (v8.0 or higher)
- **Git** for version control
- A **GitHub account**
- Basic knowledge of **React**, **Node.js**, and **MySQL**

### Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/darb-network.git
   cd darb-network
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/originalowner/darb-network.git
   ```
4. **Follow the setup guide** in [SETUP.md](SETUP.md)

## 🛠️ Development Setup

### Quick Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Set up environment
cp backend/.env.example backend/.env
# Edit .env with your configuration

# Set up database
mysql -u root -p < database/schema.sql
mysql -u root -p darb_network_db < database/seed-data.sql

# Start development servers
npm run dev  # Starts both backend and frontend
```

### Detailed Setup

For detailed setup instructions, please refer to [SETUP.md](SETUP.md).

## 🔄 Contributing Workflow

### 1. Choose an Issue

- Browse [open issues](https://github.com/yourusername/darb-network/issues)
- Look for issues labeled `good first issue` for beginners
- Check if the issue is already assigned
- Comment on the issue to express interest

### 2. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/issue-number-short-description
# Examples:
# git checkout -b feature/123-add-campaign-search
# git checkout -b bugfix/456-fix-payment-validation
# git checkout -b docs/789-update-api-docs
```

### 3. Make Changes

- Write clean, readable code
- Follow our coding standards
- Add tests for new features
- Update documentation if needed
- Commit regularly with meaningful messages

### 4. Test Your Changes

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Test the full application
npm run dev  # Start both services and test manually
```

### 5. Submit a Pull Request

- Push your branch to your fork
- Create a pull request against the main branch
- Fill out the PR template completely
- Link to the related issue

## 📝 Coding Standards

### General Principles

- **Write clean, readable code** that others can understand
- **Follow existing code patterns** in the project
- **Use meaningful variable and function names**
- **Keep functions small and focused** (single responsibility)
- **Add comments for complex logic**
- **Remove console.logs** before committing (except for intentional logging)

### JavaScript/Node.js Style Guide

#### Backend (Node.js/Express)

```javascript
// Use const/let, not var
const express = require('express');
const router = express.Router();

// Use meaningful function names
const createCampaign = async (req, res) => {
  try {
    // Destructure with meaningful names
    const { title, description, category } = req.body;
    
    // Validate input
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }
    
    // Business logic
    const campaign = await Campaign.create({
      title,
      description,
      category,
      founder_id: req.userId
    });
    
    // Consistent response format
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Export with descriptive names
module.exports = { createCampaign };
```

#### Frontend (React)

```jsx
// Use functional components with hooks
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

// Component names in PascalCase
const CampaignCard = ({ campaign }) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Use meaningful handler names
  const handleFavoriteToggle = async () => {
    try {
      await toggleFavorite(campaign.id);
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  // Clean JSX structure
  return (
    <div className="campaign-card">
      <img 
        src={campaign.main_image_url} 
        alt={campaign.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{campaign.title}</h3>
        <p className="text-gray-600">{campaign.description}</p>
        
        <button 
          onClick={handleFavoriteToggle}
          className={`btn ${isFavorited ? 'btn-primary' : 'btn-secondary'}`}
        >
          {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      </div>
    </div>
  );
};

export default CampaignCard;
```

### CSS/Tailwind Standards

```css
/* Use Tailwind utility classes primarily */
.campaign-card {
  @apply bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow;
}

/* Custom CSS only when Tailwind isn't sufficient */
.custom-animation {
  animation: slideIn 0.3s ease-in-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### Database/SQL Standards

```sql
-- Table names: snake_case, plural
CREATE TABLE campaign_milestones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  
  -- Consistent column naming
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys with descriptive names
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_status (status)
);

-- Query formatting
SELECT 
  c.id,
  c.title,
  c.target_amount,
  u.fullName as founder_name
FROM campaigns c
JOIN users u ON c.founder_id = u.id
WHERE c.status = 'approved'
  AND c.is_featured = TRUE
ORDER BY c.created_at DESC
LIMIT 10;
```

### File and Directory Naming

```
backend/
├── controllers/          # camelCase files
│   ├── authController.js
│   └── campaignController.js
├── models/              # camelCase files
│   ├── user.js
│   └── campaign.js
├── routes/              # camelCase files
│   ├── auth.routes.js
│   └── campaign.routes.js
└── middlewares/         # camelCase files
    ├── authMiddleware.js
    └── validationMiddleware.js

frontend/
├── src/
│   ├── components/      # PascalCase folders and files
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   └── Modal.jsx
│   │   └── campaign/
│   │       ├── CampaignCard.jsx
│   │       └── CampaignForm.jsx
│   ├── pages/          # PascalCase files
│   │   ├── Home.jsx
│   │   └── CampaignDetails.jsx
│   ├── services/       # camelCase files
│   │   ├── apiService.js
│   │   └── authService.js
│   └── hooks/          # camelCase files
│       ├── useAuth.js
│       └── useCampaigns.js
```

## 🧪 Testing Guidelines

### Testing Philosophy

- **Write tests for all new features**
- **Update tests when modifying existing functionality**
- **Aim for high test coverage** (80%+ for critical paths)
- **Test both happy paths and edge cases**
- **Write tests that are maintainable and readable**

### Backend Testing

#### Unit Tests (Jest)

```javascript
// tests/controllers/campaignController.test.js
const { createCampaign } = require('../../controllers/campaignController');
const Campaign = require('../../models/campaign');

// Mock dependencies
jest.mock('../../models/campaign');

describe('Campaign Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCampaign', () => {
    test('should create campaign successfully', async () => {
      // Arrange
      const req = {
        body: {
          title: 'Test Campaign',
          description: 'Test Description',
          category: 'Technology'
        },
        userId: 1
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      Campaign.create.mockResolvedValue({
        id: 1,
        title: 'Test Campaign',
        founder_id: 1
      });

      // Act
      await createCampaign(req, res);

      // Assert
      expect(Campaign.create).toHaveBeenCalledWith({
        title: 'Test Campaign',
        description: 'Test Description',
        category: 'Technology',
        founder_id: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Campaign created successfully',
        data: expect.any(Object)
      });
    });

    test('should return 400 for missing required fields', async () => {
      // Arrange
      const req = {
        body: {}, // Missing required fields
        userId: 1
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Act
      await createCampaign(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Title and description are required'
      });
    });
  });
});
```

#### Integration Tests (Supertest)

```javascript
// tests/integration/campaigns.test.js
const request = require('supertest');
const app = require('../../server');
const db = require('../../models');

describe('Campaign API Integration', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Set up test database
    await db.sequelize.sync({ force: true });
    
    // Create test user and get auth token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        userType: 'founder'
      });
    
    authToken = userResponse.body.token;
    userId = userResponse.body.data.id;
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  describe('POST /api/campaigns', () => {
    test('should create campaign with valid data', async () => {
      const campaignData = {
        title: 'Test Campaign',
        description: 'Test Description',
        category: 'Technology',
        location: 'Lagos, Nigeria',
        target_amount: 1000000,
        minimum_investment: 10000
      };

      const response = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(campaignData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(campaignData.title);
      expect(response.body.data.founder_id).toBe(userId);
    });

    test('should return 401 without auth token', async () => {
      await request(app)
        .post('/api/campaigns')
        .send({
          title: 'Test Campaign',
          description: 'Test Description'
        })
        .expect(401);
    });
  });
});
```

### Frontend Testing

#### Component Tests (React Testing Library)

```javascript
// tests/components/CampaignCard.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CampaignCard from '../../src/components/campaign/CampaignCard';
import { AuthProvider } from '../../src/context/AuthContext';

// Mock services
jest.mock('../../src/services/campaignService', () => ({
  toggleFavorite: jest.fn()
}));

const mockCampaign = {
  id: 1,
  title: 'Test Campaign',
  description: 'Test Description',
  main_image_url: '/test-image.jpg',
  target_amount: 1000000,
  current_amount: 250000,
  progress_percentage: 25
};

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('CampaignCard', () => {
  test('renders campaign information correctly', () => {
    renderWithProviders(<CampaignCard campaign={mockCampaign} />);

    expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test-image.jpg');
  });

  test('handles favorite toggle', async () => {
    const { toggleFavorite } = require('../../src/services/campaignService');
    toggleFavorite.mockResolvedValue({ success: true });

    renderWithProviders(<CampaignCard campaign={mockCampaign} />);

    const favoriteButton = screen.getByRole('button', { name: /add to favorites/i });
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(toggleFavorite).toHaveBeenCalledWith(1);
    });
  });
});
```

#### Hook Tests

```javascript
// tests/hooks/useAuth.test.js
import { renderHook, act } from '@testing-library/react';
import { useAuth, AuthProvider } from '../../src/hooks/useAuth';

describe('useAuth Hook', () => {
  test('should login user successfully', async () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    const userData = { id: 1, email: 'test@example.com' };
    const token = 'mock-token';

    act(() => {
      result.current.login(userData, token);
    });

    expect(result.current.user).toEqual(userData);
    expect(result.current.token).toBe(token);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('should logout user', async () => {
    const wrapper = ({ children }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // First login
    act(() => {
      result.current.login({ id: 1 }, 'token');
    });

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Running Tests

```bash
# Run all backend tests
cd backend
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/controllers/campaignController.test.js

# Run tests in watch mode
npm run test:watch

# Run all frontend tests
cd frontend
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test
npm test -- CampaignCard.test.jsx
```

## 📚 Documentation

### Code Documentation

#### Function Documentation

```javascript
/**
 * Creates a new campaign for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing campaign data
 * @param {string} req.body.title - Campaign title (required)
 * @param {string} req.body.description - Campaign description (required)
 * @param {string} req.body.category - Campaign category (required)
 * @param {number} req.body.target_amount - Target funding amount (required)
 * @param {number} req.userId - ID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} JSON response with campaign data or error
 * 
 * @example
 * // POST /api/campaigns
 * // Body: { title: "My Campaign", description: "...", category: "Tech", target_amount: 1000000 }
 * // Response: { success: true, data: { id: 1, title: "My Campaign", ... } }
 */
const createCampaign = async (req, res) => {
  // Implementation here
};
```

#### Component Documentation

```jsx
/**
 * CampaignCard component displays a campaign in card format
 * 
 * @param {Object} props - Component props
 * @param {Object} props.campaign - Campaign object
 * @param {number} props.campaign.id - Campaign ID
 * @param {string} props.campaign.title - Campaign title
 * @param {string} props.campaign.description - Campaign description
 * @param {string} props.campaign.main_image_url - Main campaign image URL
 * @param {number} props.campaign.target_amount - Target funding amount
 * @param {number} props.campaign.current_amount - Current funding amount
 * @param {boolean} [props.showActions=true] - Whether to show action buttons
 * 
 * @example
 * <CampaignCard 
 *   campaign={campaignData} 
 *   showActions={true}
 * />
 */
const CampaignCard = ({ campaign, showActions = true }) => {
  // Implementation here
};
```

### API Documentation

When adding new API endpoints, update the [API.md](API.md) file with:

- Endpoint URL and HTTP method
- Request/response format
- Authentication requirements
- Example requests and responses
- Error codes and messages

### README Updates

Update the main README.md when:

- Adding new major features
- Changing setup instructions
- Updating dependencies
- Adding new environment variables

## 🐛 Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** to see if it's covered
3. **Try the latest version** to see if it's already fixed
4. **Reproduce the issue** with minimal steps

### Bug Reports

Use the bug report template and include:

```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g. Windows 10, macOS 12.0, Ubuntu 20.04]
- Browser: [e.g. Chrome 96, Firefox 95, Safari 15]
- Node.js version: [e.g. 16.14.0]
- Project version: [e.g. 1.0.0]

## Additional Context
Any other context about the problem.
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
A clear and concise description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
Describe your preferred solution.

## Alternative Solutions
Describe alternatives you've considered.

## Additional Context
Any other context, mockups, or examples.
```

### Issue Labels

We use these labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested
- `wontfix` - This will not be worked on

## 📝 Pull Request Process

### Before Submitting

1. **Update your branch** with the latest main
2. **Run all tests** and ensure they pass
3. **Run linting** and fix any issues
4. **Update documentation** if needed
5. **Test your changes** thoroughly

### PR Template

Fill out our PR template completely:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update

## Related Issue
Fixes #(issue_number)

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No new warnings introduced
```

### Review Process

1. **Automated checks** must pass (CI/CD, linting, tests)
2. **At least one reviewer** must approve
3. **Address review comments** promptly
4. **Maintainer approval** required for merge

### Merge Requirements

- ✅ All CI checks pass
- ✅ At least one approval from project maintainer
- ✅ No conflicts with base branch
- ✅ Branch is up to date with main
- ✅ All conversations resolved

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### 🚀 High Priority

- **Payment Integration**: Complete Paystack/Flutterwave integration
- **Email Notifications**: Implement email notification system
- **Mobile Responsiveness**: Improve mobile user experience
- **Performance Optimization**: Database queries and frontend performance
- **Security Enhancements**: Additional security measures

### 🔧 Medium Priority

- **Admin Dashboard**: Enhanced admin features and analytics
- **Search Functionality**: Advanced search and filtering
- **User Profile**: Enhanced user profiles and verification
- **Campaign Analytics**: Detailed campaign performance metrics
- **Social Features**: Sharing and social media integration

### 📚 Documentation & Testing

- **API Documentation**: Expand and improve API docs
- **User Guide**: Create comprehensive user documentation
- **Test Coverage**: Increase test coverage across the application
- **Performance Testing**: Load testing and optimization
- **Accessibility**: Improve accessibility compliance

### 🎨 Design & UX

- **UI/UX Improvements**: Enhanced user interface design
- **Dark Mode**: Implement dark mode support
- **Animations**: Smooth animations and transitions
- **Icons and Graphics**: Custom icons and illustrations
- **Branding**: Consistent branding across the platform

## 💬 Community

### Communication Channels

- **GitHub Discussions**: For general questions and discussions
- **GitHub Issues**: For bug reports and feature requests
- **Email**: dev@darbnetwork.com for direct contact
- **Discord** (Coming Soon): Real-time chat with the community

### Community Guidelines

- **Be respectful** and professional in all interactions
- **Help others** when you can
- **Stay on topic** in discussions
- **Use appropriate channels** for different types of communication
- **Follow up** on your contributions and respond to feedback

### Recognition

We recognize contributors through:

- **Contributors page** on our website
- **Special mentions** in release notes
- **Contributor badges** on GitHub
- **Annual contributor awards**

## 🔄 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features, backward compatible
- **Patch** (1.0.1): Bug fixes, backward compatible

### Release Schedule

- **Major releases**: Quarterly
- **Minor releases**: Monthly
- **Patch releases**: As needed for critical bugs

### Contributing to Releases

- **Feature freeze**: 1 week before major/minor releases
- **Release candidates**: Available for testing
- **Release notes**: Community can suggest improvements

## 📞 Getting Help

### For Contributors

- **Setup Issues**: Check [SETUP.md](SETUP.md) first
- **Technical Questions**: Open a GitHub Discussion
- **Contribution Questions**: Comment on issues or email us

### Response Times

- **Issues**: 24-48 hours for initial response
- **Pull Requests**: 2-3 days for initial review
- **Discussions**: 1-2 days for community questions

### Mentorship

New contributors can request mentorship:

- **Email**: mentorship@darbnetwork.com
- **Include**: Your background, interests, and what you'd like to work on
- **Response**: We'll pair you with an experienced contributor

---

## 🎉 Thank You!

Thank you for contributing to Darb Network! Your efforts help us build a better platform for Nigerian startups and investors. Every contribution, no matter how small, makes a difference.

Together, we're building the future of startup funding in Nigeria! 🇳🇬

---

**Questions?** Don't hesitate to reach out:
- 📧 Email: dev@darbnetwork.com
- 💬 GitHub Discussions: [Start a discussion](https://github.com/yourusername/darb-network/discussions)
- 🐛 Issues: [Report a bug or request a feature](https://github.com/yourusername/darb-network/issues)

**Last Updated**: December 2024