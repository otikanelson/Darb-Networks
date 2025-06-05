# Darb Network - Nigerian Startup Crowdfunding Platform

<div align="center">
  <img src="assets/Logo.png" alt="Darb Network Logo" width="200"/>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
  [![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)
  [![MySQL Version](https://img.shields.io/badge/mysql-8.0-orange)](https://www.mysql.com/)
</div>

## 📖 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Contact](#contact)

## 🌟 Overview

Darb Network is a comprehensive crowdfunding platform specifically designed for the Nigerian startup ecosystem. It connects ambitious entrepreneurs with verified investors through a transparent, milestone-based funding approach that ensures accountability and reduces investment risk.

### Why Darb Network?

- **🇳🇬 Nigerian-Focused**: Built specifically for Nigerian startups with local payment integration and regulatory compliance
- **✅ Verified Ecosystem**: BVN and CAC verification ensures authentic participants
- **📊 Transparent Process**: Real-time tracking of campaign progress and fund utilization
- **🎯 Milestone-Based**: Investors fund specific project phases, reducing risk
- **👨‍💼 Admin Oversight**: Professional review and approval process for quality control

## ✨ Features

### For Founders 👨‍💼
- **Campaign Creation**: Rich campaign builder with media support
- **Draft Management**: Save and edit campaigns before submission
- **Real-time Analytics**: Track views, favorites, and funding progress
- **Investor Communication**: Direct messaging with potential investors
- **Milestone Tracking**: Manage funding milestones and deliverables

### For Investors 💰
- **Campaign Discovery**: Advanced search and filtering options
- **Portfolio Management**: Track all investments in one place
- **Due Diligence**: Access detailed founder and project information
- **Secure Payments**: Integrated payment processing with Paystack
- **Investment History**: Complete transaction and performance history

### For Administrators 🛠️
- **Campaign Review**: Comprehensive review and approval workflow
- **User Management**: Monitor and manage platform participants
- **Analytics Dashboard**: Platform-wide statistics and insights
- **Content Moderation**: Ensure quality and compliance standards
- **Featured Campaigns**: Promote high-potential startups

## 🚀 Tech Stack

### Backend
- **Node.js** - Server runtime environment
- **Express.js** - Web application framework
- **MySQL** - Primary database
- **Sequelize** - ORM for database management
- **JWT** - Authentication and authorization
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Nodemailer** - Email notifications

### Frontend
- **React 18** - User interface library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Icon library
- **Framer Motion** - Animation library

### Payment Integration
- **Paystack** - Nigerian payment gateway (ready for integration)
- **Flutterwave** - Alternative payment option (planned)

### Development Tools
- **Vite** - Frontend build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://www.mysql.com/downloads/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control system

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.14+, or Linux

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/otikanelson/darb-network.git
cd darb-network
```

### 2. Setup Project Structure
```bash
# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

### 3. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
```bash
# Copy environment template
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=darb_network_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development

# Paystack Configuration (Optional for development)
PAYSTACK_SECRET_KEY=pk_test_ea0d848cec6a2e81e72725d69efed66b8cee91cc
PAYSTACK_PUBLIC_KEY=sk_test_6861e282bc112e55b5a42f81013f898b29831768
```

### 4. Database Setup

#### Create Database and Tables
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE darb_network_db;

# Exit MySQL
exit

# Run schema setup
mysql -u root -p darb_network_db < database/schema.sql

# Load sample data (optional but recommended)
mysql -u root -p darb_network_db < database/seed-data.sql
```

### 5. Frontend Setup

#### Install Dependencies
```bash
cd ../frontend
npm install
```

#### Environment Configuration (if needed)
```bash
# Create frontend environment file (optional)
echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local
```

### 6. Start the Application

#### Option 1: Start Both Services Separately
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Option 2: Start Both Services Concurrently
```bash
# From project root
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs (when implemented)

## 🎯 Usage

### Default Login Credentials

The sample data includes test accounts for each user type:

#### Admin Account
- **Email**: `admin@darbnetwork.com`
- **Password**: `admin2025`
- **Access**: Full platform administration

#### Founder Account
- **Email**: `otikanelson29`
- **Password**: `292025`
- **Access**: Create and manage campaigns

#### Investor Account
- **Email**: `otikanelson`
- **Password**: `2025`
- **Access**: Browse and invest in campaigns

### Getting Started

#### For Founders:
1. Register as a founder or use the test account
2. Complete your profile with business information
3. Create your first campaign using the guided wizard
4. Upload compelling images and videos
5. Submit for admin review
6. Track performance once approved

#### For Investors:
1. Register as an investor or use the test account
2. Browse approved campaigns
3. Use filters to find campaigns that match your interests
4. Review campaign details and founder information
5. Make investments through secure payment processing
6. Track your investment portfolio

#### For Administrators:
1. Login with admin credentials
2. Review submitted campaigns in the admin dashboard
3. Approve or reject campaigns with feedback
4. Manage users and monitor platform activity
5. Feature promising campaigns for increased visibility

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer your_jwt_token_here
```

### Key Endpoints

#### Authentication
```bash
POST /auth/register          # User registration
POST /auth/login             # User login
GET  /auth/profile           # Get user profile
```

#### Campaigns
```bash
GET    /campaigns            # Get all approved campaigns
POST   /campaigns            # Create new campaign
GET    /campaigns/:id        # Get campaign details
PUT    /campaigns/:id        # Update campaign
DELETE /campaigns/:id        # Delete campaign
POST   /campaigns/:id/image  # Upload campaign image
GET    /campaigns/featured   # Get featured campaigns
```

#### Users
```bash
GET  /users/profile          # Get user profile
PUT  /users/profile          # Update profile
POST /users/profile-image    # Upload profile image
```

#### Admin
```bash
GET  /admin/campaigns        # Get all campaigns for review
PUT  /admin/campaigns/:id/approve    # Approve campaign
PUT  /admin/campaigns/:id/reject     # Reject campaign
```

#### Investments (Ready for implementation)
```bash
POST /investments/create     # Create investment
GET  /investments/verify/:ref # Verify payment
GET  /investments/my-investments # Get user investments
```

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

## 🗄️ Database Schema

### Core Tables

#### Users
Stores all platform users (founders, investors, admins)
```sql
- id (Primary Key)
- email (Unique)
- password (Hashed)
- fullName
- userType (founder/investor/admin)
- companyName
- profileImageUrl
- isActive, isVerified
- createdAt, updatedAt
```

#### Campaigns
Stores all campaign information
```sql
- id (Primary Key)
- title, description, category, location
- target_amount, current_amount, minimum_investment
- status (draft/submitted/approved/rejected)
- founder_id (Foreign Key)
- main_image_url
- view_count, favorite_count
- createdAt, updatedAt
```

#### Investments
Tracks all investment transactions
```sql
- id (Primary Key)
- campaign_id, investor_id (Foreign Keys)
- amount, payment_reference
- payment_status, payment_method
- investment_date, confirmed_at
```

### Database Views
- **campaign_details**: Enriched campaign data with founder information
- **investment_summary**: Aggregated investment statistics

## 📁 Project Structure

```
darb-network/
├── backend/                 # Backend application
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── uploads/            # File upload storage
│   ├── .env.example        # Environment template
│   ├── package.json        # Backend dependencies
│   └── server.js           # Entry point
├── frontend/               # Frontend application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── assets/         # Images, icons
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── database/               # Database files
│   ├── schema.sql          # Complete database schema
│   └── seed-data.sql       # Sample data
├── docs/                   # Additional documentation
├── setup.sh               # Project setup script
├── package.json           # Root package.json
└── README.md              # This file
```

## 👨‍💻 Development Guidelines

### Code Style
- **Backend**: Follow Node.js best practices with ESLint
- **Frontend**: React best practices with functional components and hooks
- **Database**: Use consistent naming conventions (snake_case for columns)

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push and create pull request
git push origin feature/your-feature-name
```

### Commit Convention
Follow conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Environment-Specific Development

#### Development Mode
- Hot reloading enabled
- Detailed error logging
- CORS configured for localhost
- Sample data available

#### Production Considerations
- Environment variables validation
- Error handling and logging
- Security headers
- Database connection pooling
- File upload limits

## 🚀 Deployment

### Prerequisites for Production
- VPS or cloud server (AWS, DigitalOcean, etc.)
- Domain name
- SSL certificate
- Production database
- Email service (for notifications)
- Payment gateway credentials

### Deployment Steps

#### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server

# Install PM2 for process management
sudo npm install -g pm2
```

#### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/darb-network.git
cd darb-network

# Install dependencies
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# Setup environment
cp backend/.env.example backend/.env
# Edit .env with production values

# Setup database
mysql -u root -p < database/schema.sql
```

#### 3. Process Management
```bash
# Start backend with PM2
cd backend
pm2 start server.js --name "darb-backend"

# Setup nginx for frontend
sudo apt install nginx
# Configure nginx to serve frontend build files
```

#### 4. SSL and Domain
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### Docker Deployment
```bash
# Using Docker Compose
docker-compose up -d

# Or build custom images
docker build -t darb-backend ./backend
docker build -t darb-frontend ./frontend
```

## 🤝 Contributing

We welcome contributions to Darb Network! Here's how you can help:

### Ways to Contribute
- 🐛 Report bugs
- 💡 Suggest new features
- 📖 Improve documentation
- 🔧 Submit code changes
- 🧪 Write tests

### Development Setup for Contributors
1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Write/update tests
6. Submit a pull request

### Code Review Process
- All submissions require review
- Tests must pass
- Code must follow style guidelines
- Documentation must be updated

### Getting Help
- Join our Discord community (link coming soon)
- Open an issue for bugs or questions
- Email us at dev@darbnetwork.com

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MySQL service
sudo systemctl status mysql

# Reset MySQL password
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'newpassword';
FLUSH PRIVILEGES;
```

#### Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :5173

# Kill process
kill -9 PID
```

#### File Upload Issues
```bash
# Check directory permissions
ls -la backend/uploads/
sudo chmod -R 755 backend/uploads/

# Create directories if missing
mkdir -p backend/uploads/profiles
mkdir -p backend/uploads/campaigns
```

#### Frontend Build Errors
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

### Getting Support

#### Before Reporting Issues
1. Check this README for solutions
2. Search existing GitHub issues
3. Ensure you're using supported versions

#### When Reporting Bugs
Include:
- Operating system and version
- Node.js version
- Error messages and logs
- Steps to reproduce
- Expected vs actual behavior

#### Priority Support
For urgent issues affecting production:
- Email: support@darbnetwork.com
- Include "URGENT" in subject line
- Provide detailed system information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

## 📞 Contact

### Project Maintainers
- **Lead Developer**: Your Name (your.email@example.com)
- **Project Manager**: PM Name (pm.email@example.com)
- **Design Lead**: Designer Name (design.email@example.com)

### Community
- **Website**: https://darbnetwork.com
- **Email**: hello@darbnetwork.com
- **Twitter**: [@DarbNetwork](https://twitter.com/DarbNetwork)
- **LinkedIn**: [Darb Network](https://linkedin.com/company/darb-network)

### Business Inquiries
- **Partnerships**: partnerships@darbnetwork.com
- **Investment**: investors@darbnetwork.com
- **Press**: press@darbnetwork.com

---

<div align="center">
  <p>Made with ❤️ for the Nigerian startup ecosystem</p>
  <p>
    <a href="#top">Back to Top ↑</a>
  </p>
</div>

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✨ Initial release
- 🔐 User authentication and authorization
- 📝 Campaign creation and management
- 👨‍💼 Admin dashboard and review process
- 📊 Basic analytics and reporting
- 💳 Payment gateway integration ready
- 📱 Responsive design for all devices

### Upcoming Features
- 🔔 Real-time notifications
- 📧 Email marketing integration
- 🎯 Advanced analytics dashboard
- 📱 Mobile application
- 🌍 Multi-language support
- 🏦 Bank integration for faster KYC

---

> **Note**: This project is actively maintained and under continuous development. For the latest updates and features, please check our [releases page](https://github.com/yourusername/darb-network/releases).
