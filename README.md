# Twinstars ERP

A monorepo ERP SaaS scaffold built with Next.js (web) and NestJS (API).

## Architecture

```
apps/
  web/     # Next.js App Router UI (port 3000)
  api/     # NestJS API (port 3001)
docker-compose.yml   # PostgreSQL
```

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
