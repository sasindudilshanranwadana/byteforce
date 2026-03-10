# System Architecture

## Overview
Three-tier architecture: React SPA → Node.js/Express API → Supabase (PostgreSQL).

## Components
- **Frontend:** React 18 + Vite + Tailwind CSS, deployed on Render static site
- **Backend:** Node.js + Express REST API, deployed on Render web service
- **Database:** Supabase (PostgreSQL + Row-Level Security)
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Payments:** Stripe Elements + Webhooks
- **Email:** Nodemailer (Gmail SMTP)
