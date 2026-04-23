# Byteforce — Crowdfunding Platform

**PRT581: Principles of Software Systems | Charles Darwin University | Semester 1, 2026**

A web-based crowdfunding platform enabling campaigners to raise funds and backers to support creative projects.

## Team
| Name | Role |
|------|------|
| Sasindu Dilshan Ranwadana | Team Lead / Project Manager |
| B A Senuja Linal Bandara Chandrasena | Developer |
| Lahiru Vimukthi | Developer / Researcher |
| Hansana Thulith | Developer |

## Tech Stack
- **Frontend:** React.js 18, React Router v6, Axios
- **Backend:** Node.js, Express.js, Sequelize ORM
- **Database:** MySQL
- **Payments:** Stripe (sandbox mode)
- **Auth:** JWT + bcrypt
- **Email:** Nodemailer (Gmail SMTP)

## Project Structure
```
byteforce/
├── frontend/          # React.js SPA
│   └── src/
│       ├── pages/     # All screen components
│       ├── components/# Reusable UI components
│       ├── context/   # Auth context (JWT)
│       └── services/  # Axios API service
└── backend/           # Node.js/Express API
    ├── controllers/   # Route logic
    ├── models/        # Sequelize models
    ├── routes/        # API routes
    ├── middleware/    # JWT auth, error handler
    └── config/        # Database config
```

## Setup Instructions

### Prerequisites
- Node.js v18+
- MySQL 8.0+

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env        # Fill in your DB credentials and keys
# Create the database in MySQL: CREATE DATABASE byteforce_db;
npm run dev                 # Starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start                   # Starts on http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register new user |
| POST | /api/auth/login | — | Login, returns JWT |
| GET | /api/auth/me | JWT | Get current user |
| GET | /api/campaigns | — | Browse/search campaigns |
| GET | /api/campaigns/:id | — | Campaign detail |
| POST | /api/campaigns | JWT (campaigner) | Create campaign |
| GET | /api/campaigns/my | JWT | My campaigns |
| POST | /api/payments/checkout | JWT (backer) | Initiate Stripe payment |
| POST | /api/payments/webhook | Stripe | Payment confirmation |
| GET | /api/donations/history | JWT | Backer donation history |
| GET | /api/admin/campaigns | JWT (admin) | All campaigns |
| PUT | /api/admin/campaigns/:id/moderate | JWT (admin) | Approve/suspend/reject |
| GET | /api/admin/stats | JWT (admin) | Platform stats |

## Sprint 2 Stories Implemented
- ✅ SCRUM-17: User Registration and Login
- ✅ SCRUM-18: Create and Publish a Campaign
- ✅ SCRUM-19: Browse and Search Campaigns
- ✅ SCRUM-20: Donate to a Campaign via Payment Gateway (Stripe sandbox)
- ✅ SCRUM-21: Display Campaign Progress Bar
- ✅ SCRUM-26: Admin Campaign Moderation