# Twinstars ERP

A monorepo ERP SaaS scaffold built with Next.js (web), NestJS (API), and a GitHub Pages–deployable SPA (Vite + React + Supabase).

## Architecture

```
apps/
  web/     # Next.js App Router UI (port 3000)
  api/     # NestJS API (port 3001)
  spa/     # Vite + React SPA deployed to GitHub Pages (Supabase-backed)
supabase/
  migrations/   # SQL schema + RLS policies for Supabase
docker-compose.yml   # PostgreSQL (used by apps/api)
```

## GitHub Pages SPA

Live URL: **https://twinstarsgroup.github.io/erp/**

### Purpose

`apps/spa` is a lightweight, fully-static ERP frontend that runs entirely on GitHub Pages.  
It replaces the need for a running NestJS API for basic CRUD operations by talking directly to [Supabase](https://supabase.com).

Features available in the SPA:
- Google OAuth login (restricted to `@twinstarsgroup.com`)
- Dashboard with receipt/voucher counts
- Receipts: list and create
- Vouchers: list and create

> **Limitations vs. `apps/api`**: PDF generation, email sending, file attachments, and Google Drive integration are *not* available in the SPA.  These features require the NestJS API.  They can be added later via Supabase Edge Functions if needed.

### Local development

```bash
cd apps/spa
cp .env.example .env.local      # fill in your Supabase credentials
npm install
npm run dev                      # http://localhost:5173
```

### Production build

```bash
cd apps/spa
npm run build                    # outputs to apps/spa/dist/
npm run preview                  # preview at http://localhost:4173/erp/
```

### Supabase environment variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable / anon key |

**Local**: copy `.env.example` → `.env.local` in `apps/spa/` and fill in values.

**GitHub Actions**: add the variables in your repository settings:
- Go to **Settings → Secrets and variables → Actions → Variables** (not Secrets, since these are publishable keys).
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### GitHub Pages setup (one-time)

1. Go to **Settings → Pages** in this repository.
2. Set **Source** to `GitHub Actions`.
3. Push to `main` (or trigger `workflow_dispatch`) — the `pages.yml` workflow builds and deploys automatically.

### Supabase database setup

Run the migration in `supabase/migrations/0001_initial_schema.sql` via the Supabase SQL editor (or `supabase db push` if using the Supabase CLI).  
Then follow the bootstrap comments at the bottom of that file to insert the initial tenant and admin profile.

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Google Cloud project with OAuth 2.0 credentials

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

### 2. Configure API

```bash
cd apps/api
cp .env.example .env
# Edit .env with your values
```

### 3. Configure Web

```bash
cd apps/web
cp .env.example .env.local
```

### 4. Install dependencies

```bash
# From repo root
npm install
```

### 5. Run database migrations

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 6. Start the apps

```bash
# Terminal 1 - API
cd apps/api && npm run dev

# Terminal 2 - Web
cd apps/web && npm run dev
```

Visit http://localhost:3000

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable APIs:
   - Google Drive API
   - Gmail API
   - Google+ API (for profile)
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URI: `http://localhost:3001/auth/google/callback`
5. Copy Client ID and Client Secret to `apps/api/.env`

### Required OAuth Scopes

- `email`
- `profile`
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/gmail.send`

## Environment Variables

### apps/api/.env

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Long random string for session signing |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |
| `ADMIN_EMAIL` | Allowed admin email (admin@twinstarsgroup.com) |
| `LOGO_PATH` | Path to company logo PNG (default: assets/logo.png) |

### apps/web/.env.local

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | NestJS API base URL |

## Company Logo

Replace `apps/api/assets/logo.png` and `apps/web/public/logo.png` with your company logo.
The logo appears in:
- PDF documents
- Web app header (all pages)

## Features

- **Google OAuth** - Admin-only login (admin@twinstarsgroup.com)
- **Receipts** - CR-YYYY-000001 sequential numbering
- **Payment Vouchers** - PV-YYYY-000001 sequential numbering  
- **File Attachments** - Upload PDF/JPG/PNG to Google Drive (max 25MB)
- **PDF Download** - Generate PDF with company logo
- **Email** - Send PDF via Gmail API

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /auth/google | Initiate Google OAuth |
| GET | /auth/me | Current user info |
| GET | /auth/logout | Logout |
| POST | /receipts | Create receipt |
| GET | /receipts | List receipts |
| GET | /receipts/:id/pdf | Download PDF |
| POST | /receipts/:id/email | Email receipt |
| POST | /receipts/:id/attachments | Upload attachment |
| POST | /vouchers | Create voucher |
| GET | /vouchers | List vouchers |
| GET | /vouchers/:id/pdf | Download PDF |
| POST | /vouchers/:id/email | Email voucher |
| POST | /vouchers/:id/attachments | Upload attachment |
