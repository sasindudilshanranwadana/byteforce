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

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for individual contribution details.

## Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Query
- **Backend:** Node.js, Express.js
- **Database + Auth:** Supabase (PostgreSQL + Auth + Row-Level Security)
- **Authentication:** Supabase Auth + Google OAuth
- **Payments:** Stripe Elements (sandbox mode)
- **Email:** Nodemailer (Gmail SMTP)

> **Sprint 2 Migration (April 2026):** The stack was migrated from MySQL + Sequelize + manual JWT/bcrypt to Supabase to reduce auth boilerplate and leverage Row-Level Security at the database layer. See the Confluence System Architecture page for full details.

## Project Structure
```
byteforce/
├── .github/workflows/  # CI pipeline (lint + build on push/PR)
├── frontend/           # React + Vite SPA
│   └── src/
│       ├── pages/      # All screen components
│       ├── components/ # Reusable UI components
│       └── lib/        # Supabase client, API helpers
├── backend/            # Node.js/Express API
│   ├── controllers/    # Route logic
│   ├── routes/         # API routes
│   ├── middleware/     # Supabase JWT verification, error handler
│   └── config/         # Supabase + Stripe config
└── prototype/          # 11-screen interactive HTML prototype
```

## Setup Instructions

### Prerequisites
- Node.js v20+
- A Supabase project (free tier works)
- Stripe test-mode API keys

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, STRIPE_SECRET_KEY
npm run dev           # Starts on http://localhost:3001
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env  # Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLIC_KEY
npm run dev           # Starts on http://localhost:5173
```

## API Endpoints

Authentication is handled client-side via Supabase Auth + Google OAuth. Express middleware verifies the Supabase JWT on protected routes.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/campaigns | — | Browse/search campaigns |
| GET | /api/campaigns/:id | — | Campaign detail |
| POST | /api/campaigns | JWT (campaigner) | Create campaign |
| PUT | /api/campaigns/:id | JWT (owner) | Update campaign |
| DELETE | /api/campaigns/:id | JWT (owner/admin) | Delete campaign |
| POST | /api/donations | JWT | Record a donation |
| GET | /api/donations/my | JWT | Backer donation history |
| POST | /api/payments/checkout | JWT | Create Stripe PaymentIntent |
| POST | /api/payments/webhook | Stripe sig | Webhook handler |
| GET | /api/rewards/:campaignId | — | List reward tiers |
| POST | /api/rewards | JWT (owner) | Create reward tier |
| GET | /api/updates/:campaignId | — | Campaign updates |
| POST | /api/updates | JWT (owner) | Post update (triggers emails) |
| GET | /api/notifications | JWT | User notification log |
| GET | /api/admin/campaigns | JWT (admin) | All campaigns |
| PUT | /api/admin/campaigns/:id/approve | JWT (admin) | Approve campaign |
| PUT | /api/admin/campaigns/:id/reject | JWT (admin) | Reject campaign |
| GET | /api/analytics/campaign/:id | JWT (owner) | Campaigner analytics |

Full schemas: see Confluence "API Documentation – Crowdfunding Platform".

## Sprint Status

| Sprint | Weeks | Status | Focus |
|--------|-------|--------|-------|
| 1 | 3–6 | ✅ Closed | Setup, docs, requirements, UML |
| 2 | 7–8 | ✅ Closed | Auth, campaigns, donations, admin (+ Supabase migration) |
| 3 | 9–10 | 🚧 Active | Reward tiers, updates, notifications, analytics, donation history, social sharing |
| 4 | 11 | ⏳ Upcoming | Testing + final report (Assessment 02, due 18–24 May 2026) |

### Sprint 2 — Implemented
- ✅ SCRUM-17: User Registration and Login (Google OAuth via Supabase)
- ✅ SCRUM-18: Create and Publish a Campaign
- ✅ SCRUM-19: Browse and Search Campaigns
- ✅ SCRUM-20: Donate via Stripe Elements
- ✅ SCRUM-21: Campaign Progress Bar
- ✅ SCRUM-26: Admin Campaign Moderation

### Sprint 3 — In Progress (feature branches)
- 🚧 SCRUM-22: Reward Tiers (`feature/scrum-22-reward-tiers`)
- 🚧 SCRUM-23: Post Campaign Updates (`feature/scrum-23-campaign-updates`)
- 🚧 SCRUM-24: Email Notifications (`feature/scrum-24-email-notifications`)
- 🚧 SCRUM-25: Campaigner Analytics Dashboard (`feature/scrum-25-analytics-dashboard`)
- 🚧 SCRUM-27: Backer Donation History (`feature/scrum-27-donation-history`)
- 🚧 SCRUM-28: Social Media Sharing (`feature/scrum-28-social-sharing`)

## Documentation
- Atlassian workspace: https://byteforce.atlassian.net
- Jira project: SCRUM
- Confluence space: Byteforce (15 pages — Sprint Plan, User Stories, System Architecture, API Docs, UML Diagrams, Test Plans, Risks, Meeting Minutes, etc.)

_Last refreshed: 14 May 2026_
