# GharHisab Frontend — Agent Context

## Project Overview

**GharHisab** is a tenant billing and property management system for landlords in Nepal.
Next.js 14 frontend (App Router) consuming Django REST API backend.

## Tech Stack

- Next.js 14+ (App Router, TypeScript)
- Tailwind CSS v4
- shadcn/ui components
- React Query (TanStack Query) for data fetching
- Zustand for client state
- next-intl for i18n (English + Nepali)
- next-pwa for offline support
- Lucide React icons

## Project Structure

```
ghar-hisab-frontend/
├── app/                    # App Router pages
│   ├── (auth)/             # Login, register, verify
│   ├── (dashboard)/        # Dashboard, houses, rooms, payments
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing/redirect
├── components/             # Reusable UI components
│   ├── ui/                 # shadcn components
│   ├── layout/             # Sidebar, header, nav
│   └── dashboard/          # Domain-specific components
├── lib/                    # Utilities, API client, hooks
│   ├── api.ts              # Axios/fetch wrapper
│   ├── auth.ts             # JWT management
│   └── utils.ts            # Helpers
├── hooks/                  # Custom React hooks
├── stores/                 # Zustand stores
├── types/                  # TypeScript types
├── messages/               # i18n translation files
│   ├── en.json
│   └── ne.json
└── public/                 # Static assets, manifest.json
```

## API Integration

Backend runs at `http://localhost:8000` (configurable via env).

### Authentication Flow
1. POST `/api/accounts/token/` with email+password → get access+refresh tokens
2. Store tokens in httpOnly cookies (secure) or localStorage
3. Attach `Authorization: Bearer <access_token>` to all requests
4. Auto-refresh before expiry using refresh token

### Key Endpoints
- Auth: `/api/accounts/token/`, `/api/accounts/register/`, `/api/accounts/me/`
- Houses: `/api/houses/`
- Rooms: `/api/rooms/`, `/api/custom/rooms/<id>/detail/`
- Tenants: `/api/tenants/`
- Payments: `/api/payment-histories/`, `/api/custom/rooms/<id>/record-payment/`
- Dashboard: `/api/custom/dashboard/`
- Email: `/api/custom/email-history/`, `/api/custom/email-settings/`

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Email + password login |
| `/register` | New account registration |
| `/verify-email` | Email verification |
| `/dashboard` | Overview stats, recent payments |
| `/houses` | House list, add/edit/delete |
| `/houses/[id]` | House detail with rooms |
| `/rooms/[id]` | Room detail, bills, payments |
| `/payments` | Payment history list |
| `/settings` | Profile, email settings |

## Design System

- **Colors**: Professional blue/indigo palette
- **Typography**: Inter for body, plus for display
- **Components**: shadcn/ui (Radix primitives)
- **Responsive**: Mobile-first, works on all devices
- **RTL**: Not needed (Nepali/English only)

## Conventions

- Use TypeScript strict mode
- All API calls through centralized api.ts
- Use React Query for server state
- Use Zustand for client-only state
- Format currency as Rs. X,XXX (Nepali Rupee)
- Use Asia/Kathmandu timezone
- Support Nepali calendar for billing display

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=GharHisab
```

## Key Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
