# Darb Network API Documentation

Welcome to the Darb Network API documentation. This guide provides comprehensive information about all available endpoints, request/response formats, authentication, and usage examples.

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Code Examples](#code-examples)
8. [Testing](#testing)
9. [Changelog](#changelog)

## 🔗 API Overview

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.darbnetwork.com/api
```

### API Version
Current version: `v1`

### Content Type
All API requests and responses use JSON format.
```
Content-Type: application/json
Accept: application/json
```

### Response Format
All API responses follow a consistent structure:

```json
{
  "success": true|false,
  "message": "Human readable message",
  "data": {} | [],
  "error": {} // Only present if success is false
}
```

## 🔐 Authentication

### Authentication Methods

#### 1. JWT Bearer Token
Most endpoints require JWT authentication.

```http
Authorization: Bearer <your_jwt_token>
```

#### 2. API Key (Future)
For third-party integrations (planned for future releases).

```http
X-API-Key: <your_api_key>
```

### Getting Authentication Token

**Login Endpoint**:
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "founder"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Token Usage
Include the token in the Authorization header for authenticated requests:

```javascript
const response = await fetch('/api/campaigns', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Expiration
- Default expiration: 24 hours
- Refresh tokens: Available in future releases
- Handle expired tokens by redirecting to login

## ❌ Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": ["Email is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Common Error Types

#### Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "field_name": ["Error message"]
    }
  }
}
```

#### Authentication Errors
```json
{
  "success": false,
  "message": "Invalid token",
  "error": {
    "code": "INVALID_TOKEN"
  }
}
```

#### Authorization Errors
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

## 🚦 Rate Limiting

### Limits
- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 5 requests per minute per IP
- **File upload endpoints**: 10 requests per minute per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "retry_after": 60
  }
}
```

## 🛠️ API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "userType": "founder", // "founder", "investor", "admin"
  "companyName": "Tech Startup Ltd", // Optional for founders
  "phoneNumber": "+2348123456789", // Optional
  "address": "123 Lagos Street, Nigeria" // Optional
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "founder"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "founder"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "userType": "founder",
    "companyName": "Tech Startup Ltd",
    "profileImageUrl": "/uploads/profiles/user-123.jpg",
    "isVerified": true,
    "createdAt": "2023-12-01T10:00:00.000Z"
  }
}
```

### User Management Endpoints

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "fullName": "John Updated",
  "companyName": "Updated Company",
  "phoneNumber": "+2348123456789",
  "address": "New Address",
  "bio": "Updated bio"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "fullName": "John Updated",
    "companyName": "Updated Company"
  }
}
```

#### Upload Profile Image
```http
POST /api/users/profile-image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body** (FormData):
```
profileImage: <file>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "profileImageUrl": "/uploads/profiles/profile-1640995200-123456789.jpg"
  }
}
```

### Campaign Endpoints

#### Get All Campaigns
```http
GET /api/campaigns
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `status` (optional): Filter by status
- `featured` (optional): Show only featured campaigns
- `search` (optional): Search in title and description

**Example**:
```http
GET /api/campaigns?page=1&limit=10&category=Education&featured=true
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": 1,
        "title": "Revolutionary EduTech Platform",
        "description": "An innovative platform...",
        "category": "Education",
        "location": "Lagos, Nigeria",
        "target_amount": 5000000,
        "current_amount": 1250000,
        "progress_percentage": 25,
        "minimum_investment": 50000,
        "status": "approved",
        "is_featured": true,
        "main_image_url": "/uploads/campaigns/campaign-1.jpg",
        "founder": {
          "fullName": "Kemi Williams",
          "companyName": "EduTech Nigeria"
        },
        "view_count": 1234,
        "favorite_count": 56,
        "investor_count": 23,
        "days_remaining": 45,
        "createdAt": "2023-11-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Get Campaign by ID
```http
GET /api/campaigns/:id
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Revolutionary EduTech Platform",
    "description": "An innovative platform...",
    "category": "Education",
    "problem_statement": "Over 10 million Nigerian children...",
    "solution": "Our AI-powered platform...",
    "business_plan": "Freemium model with premium features...",
    "target_amount": 5000000,
    "current_amount": 1250000,
    "minimum_investment": 50000,
    "main_image_url": "/uploads/campaigns/campaign-1.jpg",
    "video_url": "https://youtube.com/watch?v=example",
    "founder": {
      "id": 2,
      "fullName": "Kemi Williams",
      "companyName": "EduTech Nigeria",
      "profileImageUrl": "/uploads/profiles/founder-2.jpg",
      "bio": "Former teacher with 10 years experience..."
    },
    "milestones": [
      {
        "id": 1,
        "title": "Platform Development",
        "description": "Complete core platform development...",
        "target_amount": 1500000,
        "current_amount": 1250000,
        "status": "completed"
      }
    ],
    "images": [
      {
        "id": 1,
        "image_url": "/uploads/campaigns/gallery-1.jpg",
        "caption": "Students using our platform"
      }
    ],
    "statistics": {
      "view_count": 1234,
      "favorite_count": 56,
      "investor_count": 23,
      "progress_percentage": 25,
      "days_remaining": 45
    }
  }
}
```

#### Create Campaign
```http
POST /api/campaigns
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "My Startup Campaign",
  "description": "A revolutionary platform that...",
  "category": "Technology",
  "location": "Lagos, Nigeria",
  "target_amount": 2000000,
  "minimum_investment": 25000,
  "problem_statement": "The problem we're solving...",
  "solution": "Our innovative solution...",
  "business_plan": "Our business model is..."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "data": {
    "id": 15,
    "title": "My Startup Campaign",
    "status": "draft",
    "founder_id": 2
  }
}
```

#### Update Campaign
```http
PUT /api/campaigns/:id
Authorization: Bearer <token>
```

**Request Body**: Same as create campaign

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign updated successfully",
  "data": {
    "id": 15,
    "title": "Updated Campaign Title"
  }
}
```

#### Upload Campaign Image
```http
POST /api/campaigns/:id/image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body** (FormData):
```
campaignImage: <file>
caption: "Image description" (optional)
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign image uploaded successfully",
  "data": {
    "imageUrl": "/uploads/campaigns/campaign-15-1640995200.jpg"
  }
}
```

#### Submit Campaign for Review
```http
POST /api/campaigns/:id/submit
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign submitted for review",
  "data": {
    "id": 15,
    "status": "submitted",
    "submitted_at": "2023-12-01T15:30:00.000Z"
  }
}
```

#### Toggle Campaign Favorite
```http
POST /api/campaigns/:id/favorite
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign added to favorites",
  "data": {
    "is_favorited": true,
    "favorite_count": 57
  }
}
```

#### Track Campaign View
```http
POST /api/campaigns/:id/view
```

**Request Body**:
```json
{
  "referrer": "https://google.com", // Optional
  "user_agent": "Mozilla/5.0..." // Optional
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "View tracked",
  "data": {
    "view_count": 1235
  }
}
```

### Investment Endpoints

#### Get My Investments
```http
GET /api/investments/my-investments
Authorization: Bearer <token>
```

**Query Parameters**:
- `status` (optional): Filter by payment status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "investments": [
      {
        "id": 1,
        "amount": 200000,
        "payment_status": "completed",
        "payment_reference": "DARB_INV_123456",
        "investment_date": "2023-11-15T10:00:00.000Z",
        "campaign": {
          "id": 1,
          "title": "Revolutionary EduTech Platform",
          "category": "Education",
          "main_image_url": "/uploads/campaigns/campaign-1.jpg"
        }
      }
    ],
    "summary": {
      "total_invested": 500000,
      "total_investments": 3,
      "pending_amount": 0,
      "completed_amount": 500000
    }
  }
}
```

#### Create Investment
```http
POST /api/investments
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "campaign_id": 1,
  "amount": 100000,
  "investor_message": "Excited to support this project!"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Investment created successfully",
  "data": {
    "id": 25,
    "payment_reference": "DARB_INV_1640995200_25",
    "amount": 100000,
    "payment_status": "pending",
    "paystack_authorization_url": "https://checkout.paystack.com/..."
  }
}
```

#### Verify Payment
```http
GET /api/investments/verify/:reference
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "payment_status": "completed",
    "amount": 100000,
    "gateway_response": {
      "status": "success",
      "reference": "DARB_INV_1640995200_25"
    }
  }
}
```

### Admin Endpoints

#### Get All Campaigns (Admin)
```http
GET /api/admin/campaigns
Authorization: Bearer <admin_token>
```

**Query Parameters**:
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": 1,
        "title": "Revolutionary EduTech Platform",
        "status": "submitted",
        "founder": {
          "fullName": "Kemi Williams",
          "email": "kemi@edutech.ng"
        },
        "submitted_at": "2023-12-01T10:00:00.000Z",
        "target_amount": 5000000
      }
    ]
  }
}
```

#### Approve Campaign
```http
PUT /api/admin/campaigns/:id/approve
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "admin_comments": "Great project! Approved for funding.",
  "is_featured": true // Optional
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign approved successfully",
  "data": {
    "id": 1,
    "status": "approved",
    "approved_at": "2023-12-01T15:30:00.000Z"
  }
}
```

#### Reject Campaign
```http
PUT /api/admin/campaigns/:id/reject
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "rejection_reason": "Insufficient documentation. Please provide more details about your business model.",
  "admin_comments": "Need more detailed financial projections."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Campaign rejected",
  "data": {
    "id": 1,
    "status": "rejected",
    "rejected_at": "2023-12-01T15:30:00.000Z"
  }
}
```

### File Upload Endpoints

#### Upload Profile Image
```http
POST /api/media/profile-image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body**:
```
profileImage: <file> (max 5MB, jpg/jpeg/png/gif)
```

#### Upload Campaign Image
```http
POST /api/media/campaign-image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body**:
```
campaignImage: <file> (max 10MB, jpg/jpeg/png/gif)
caption: "Optional image caption"
```

#### Upload Document
```http
POST /api/media/document
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body**:
```
document: <file> (max 10MB, pdf/doc/docx)
document_type: "business_plan" | "pitch_deck" | "financial_projection"
```

## 📊 Data Models

### User Model
```typescript
interface User {
  id: number;
  email: string;
  fullName: string;
  userType: 'founder' | 'investor' | 'admin';
  companyName?: string;
  phoneNumber?: string;
  address?: string;
  bvn?: string;
  cacNumber?: string;
  accountNumber?: string;
  bankName?: string;
  profileImageUrl?: string;
  bio?: string;
  website?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBvnVerified: boolean;
  isCacVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Campaign Model
```typescript
interface Campaign {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  target_amount: number;
  current_amount: number;
  minimum_investment: number;
  maximum_investment?: number;
  problem_statement?: string;
  solution?: string;
  business_plan?: string;
  market_analysis?: string;
  competitive_advantage?: string;
  financial_projections?: string;
  team_information?: string;
  risks_and_challenges?: string;
  main_image_url?: string;
  video_url?: string;
  pitch_deck_url?: string;
  business_plan_url?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paused' | 'completed' | 'cancelled';
  is_featured: boolean;
  is_urgent: boolean;
  view_count: number;
  favorite_count: number;
  investor_count: number;
  share_count: number;
  start_date?: string;
  end_date?: string;
  duration_days: number;
  founder_id: number;
  reviewed_by?: number;
  admin_comments?: string;
  rejection_reason?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  featured_at?: string;
  completed_at?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Investment Model
```typescript
interface Investment {
  id: number;
  campaign_id: number;
  milestone_id?: number;
  investor_id: number;
  amount: number;
  investment_type: 'campaign' | 'milestone';
  payment_reference: string;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'abandoned' | 'refunded';
  payment_method?: string;
  payment_gateway: 'paystack' | 'flutterwave' | 'bank_transfer';
  payment_gateway_id?: string;
  payment_gateway_response?: object;
  transaction_fee: number;
  platform_fee: number;
  net_amount: number;
  investor_message?: string;
  investor_email?: string;
  investor_phone?: string;
  campaign_snapshot?: object;
  expected_return_percentage?: number;
  expected_return_date?: string;
  total_repaid: number;
  repayment_status: 'none' | 'partial' | 'complete' | 'overdue';
  investment_date: string;
  payment_confirmed_at?: string;
  payment_failed_at?: string;
  refunded_at?: string;
}
```

### Campaign Milestone Model
```typescript
interface CampaignMilestone {
  id: number;
  campaign_id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  deliverables?: string;
  timeline?: string;
  success_metrics?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  order_index: number;
  target_date?: string;
  completed_at?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Notification Model
```typescript
interface Notification {
  id: number;
  user_id: number;
  related_id?: number;
  related_type?: 'campaign' | 'investment' | 'user' | 'system';
  type: string;
  title: string;
  message: string;
  action_url?: string;
  action_text?: string;
  is_read: boolean;
  is_email_sent: boolean;
  is_sms_sent: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read_at?: string;
  email_sent_at?: string;
  sms_sent_at?: string;
  expires_at?: string;
  createdAt: string;
}
```

## 💻 Code Examples

### JavaScript/Node.js Examples

#### Authentication
```javascript
// Login and store token
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Get stored token
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Make authenticated request
async function authenticatedRequest(url, options = {}) {
  const token = getAuthToken();
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
```

#### Campaign Management
```javascript
// Get all campaigns with filters
async function getCampaigns(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/campaigns${queryString ? '?' + queryString : ''}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error;
  }
}

// Create new campaign
async function createCampaign(campaignData) {
  try {
    const response = await authenticatedRequest('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

// Upload campaign image
async function uploadCampaignImage(campaignId, imageFile, caption = '') {
  const formData = new FormData();
  formData.append('campaignImage', imageFile);
  if (caption) formData.append('caption', caption);

  try {
    const token = getAuthToken();
    const response = await fetch(`/api/campaigns/${campaignId}/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData,
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
```

#### Investment Management
```javascript
// Create investment
async function createInvestment(campaignId, amount, message = '') {
  try {
    const response = await authenticatedRequest('/api/investments', {
      method: 'POST',
      body: JSON.stringify({
        campaign_id: campaignId,
        amount: amount,
        investor_message: message,
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      // Redirect to payment URL if provided
      if (data.data.paystack_authorization_url) {
        window.location.href = data.data.paystack_authorization_url;
      }
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error creating investment:', error);
    throw error;
  }
}

// Verify payment
async function verifyPayment(paymentReference) {
  try {
    const response = await authenticatedRequest(`/api/investments/verify/${paymentReference}`);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

// Get user investments
async function getMyInvestments(filters = {}) {
  const queryString = new URLSearchParams(filters).toString();
  const url = `/api/investments/my-investments${queryString ? '?' + queryString : ''}`;
  
  try {
    const response = await authenticatedRequest(url);
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching investments:', error);
    throw error;
  }
}
```

### React Hook Examples

#### Authentication Hook
```javascript
// useAuth.js
import { useState, useContext, createContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and get user data
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  async function fetchUserProfile() {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
      } else {
        // Token invalid, clear it
        logout();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }

  function login(userData, authToken) {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### Campaign Hook
```javascript
// useCampaigns.js
import { useState, useEffect } from 'react';

export function useCampaigns(filters = {}) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchCampaigns();
  }, [JSON.stringify(filters)]);

  async function fetchCampaigns() {
    try {
      setLoading(true);
      setError(null);
      
      const queryString = new URLSearchParams(filters).toString();
      const url = `/api/campaigns${queryString ? '?' + queryString : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.data.campaigns);
        setPagination(data.data.pagination);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    campaigns,
    loading,
    error,
    pagination,
    refetch: fetchCampaigns,
  };
}
```

### Error Handling Examples

#### Global Error Handler
```javascript
// errorHandler.js
export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'ApiError';
  }
}

export async function handleApiResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data.error?.code
    );
  }
  
  return data;
}

// Usage in components
async function handleApiCall() {
  try {
    const response = await fetch('/api/campaigns');
    const data = await handleApiResponse(response);
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          // Redirect to login
          router.push('/login');
          break;
        case 403:
          // Show permission error
          showError('You do not have permission to perform this action');
          break;
        case 422:
          // Handle validation errors
          showValidationErrors(error);
          break;
        default:
          showError(error.message);
      }
    } else {
      showError('An unexpected error occurred');
    }
  }
}
```

## 🧪 Testing

### API Testing with cURL

#### Authentication
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "userType": "founder"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### Campaign Management
```bash
# Get all campaigns
curl http://localhost:5000/api/campaigns

# Get campaigns with filters
curl "http://localhost:5000/api/campaigns?category=Education&featured=true&page=1&limit=10"

# Get specific campaign
curl http://localhost:5000/api/campaigns/1

# Create campaign (requires auth token)
curl -X POST http://localhost:5000/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My Test Campaign",
    "description": "A test campaign",
    "category": "Technology",
    "location": "Lagos, Nigeria",
    "target_amount": 1000000,
    "minimum_investment": 10000
  }'
```

### API Testing with Postman

Create a Postman collection with the following structure:

```json
{
  "info": {
    "name": "Darb Network API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{authToken}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "authToken",
      "value": ""
    }
  ]
}
```

### Unit Testing Examples

#### Backend API Tests (Jest + Supertest)
```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  test('POST /api/auth/register - should register new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'Test User',
      userType: 'founder'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe(userData.email);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/login - should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'founder@test.com',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});
```

#### Frontend Component Tests (React Testing Library)
```javascript
// tests/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../src/components/Login';

// Mock the API service
jest.mock('../src/services/authService', () => ({
  login: jest.fn()
}));

describe('Login Component', () => {
  test('should submit login form', async () => {
    const mockLogin = require('../src/services/authService').login;
    mockLogin.mockResolvedValue({
      success: true,
      data: { id: 1, email: 'test@example.com' },
      token: 'mock-token'
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});
```

## 📋 Changelog

### Version 1.0.0 (Current)

#### Added
- User authentication and registration
- Campaign CRUD operations
- Investment system with payment integration
- Admin dashboard and review workflow
- File upload for profiles and campaigns
- Campaign favorites and view tracking
- Notification system
- User profile management

#### Security
- JWT-based authentication
- Input validation and sanitization
- File upload security
- SQL injection protection
- XSS protection

#### Performance
- Database indexing for common queries
- Pagination for large datasets
- Image optimization
- Response caching headers

### Upcoming Features (v1.1.0)

#### Planned
- Real-time notifications via WebSocket
- Advanced search with Elasticsearch
- Email notification system
- SMS verification
- Social media integration
- Mobile app API enhancements
- Webhook system for third-party integrations

#### API Enhancements
- GraphQL endpoint
- API versioning improvements
- Enhanced filtering and sorting
- Bulk operations
- API key authentication for partners

---

## 📞 Support

### API Support
- **Email**: api-support@darbnetwork.com
- **Documentation**: This document and inline code comments
- **Response Time**: 24-48 hours for non-critical issues

### Reporting Issues
When reporting API issues, please include:
- Endpoint URL and HTTP method
- Request headers and body
- Response status and body
- Error logs from both client and server
- Steps to reproduce

### Rate Limit Increases
Contact us for higher rate limits:
- **Business inquiries**: business@darbnetwork.com
- **Partnership requests**: partnerships@darbnetwork.com

---

**Last Updated**: December 2024  
**API Version**: 1.0.0