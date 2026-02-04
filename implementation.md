# MedFlow — Implementation Guide

## Overview
- **Name**: MedFlow
- **Type**: Static files (Nginx)
- **Stack**: SvelteKit, Svelte 5, TypeScript, Tailwind CSS v4, Chart.js, bits-ui, lucide-svelte
- **Subdomain**: medflow.lavescar.com.tr
- **Idle RAM**: 0MB (static)
- **Disk**: ~8MB

## Architecture
Fully client-side SvelteKit application built as static files. All data is stored in the browser's localStorage, with no backend server required. The app uses a route group `(app)` for authenticated pages and a separate `/login` route. State management is handled through Svelte stores backed by localStorage persistence. The i18n system supports Turkish and English with locale files. UI components are built with bits-ui (headless components) and styled with Tailwind CSS v4.

## Features
- 10 modules:
  - **Dashboard**: Overview stats, charts, upcoming appointments, recent activity
  - **Patients**: CRUD with list, detail, edit, and create views
  - **Appointments**: Scheduling with calendar, detail, edit, and create views
  - **EMR (Electronic Medical Records)**: Patient records, examinations, prescriptions
  - **Billing**: Invoices and payments management
  - **Inventory**: Medical supply tracking with CRUD
  - **Reports**: Financial, appointment, and patient statistics reports with charts
  - **Notifications**: Alert and notification center
  - **Settings**: Clinic info, appearance (dark/light mode), notification preferences
  - **Users**: User management with CRUD
- Dark/light mode toggle
- Turkish (TR) and English (EN) internationalization
- localStorage persistence for all data
- Responsive sidebar navigation

## Demo Credentials
- **Email**: admin@klinik.com
- **Password**: admin123

## Demo Safety Measures
- DEMO watermark displayed on all authenticated pages
- `noindex` meta tag and `robots.txt` with `Disallow: /`
- Console warning indicating this is a demo environment
- All data stored in localStorage only (no server, no database)
- No real patient data; all records are fictional seed data
- No external API calls

## Build & Deploy
```bash
# Install dependencies
cd demos/clinic-crm
bun install   # or npm install

# Build static files
bun run build
# Output: build/ directory

# Deploy
sudo cp -r build/* /var/www/medflow/

# Nginx serves the build/ directory with SPA fallback:
# try_files $uri $uri/ /index.html;
```

## File Structure
```
clinic-crm/
├── package.json                # Dependencies
├── svelte.config.js            # SvelteKit config (static adapter)
├── vite.config.ts              # Vite config
├── vitest.config.ts            # Test config
├── tsconfig.json               # TypeScript config
├── postcss.config.js           # PostCSS / Tailwind
├── components.json             # bits-ui component config
├── static/
│   └── robots.txt              # noindex directive
├── build/                      # Production output
├── tests/
│   ├── setup.ts
│   └── components/
│       └── StatsCard.test.ts
└── src/
    ├── app.html                # HTML shell
    ├── app.css                 # Global styles / Tailwind imports
    ├── app.d.ts                # Type declarations
    ├── lib/
    │   ├── index.ts            # Lib barrel export
    │   ├── utils.ts            # Utility functions
    │   ├── assets/             # Static assets (images, icons)
    │   ├── config/             # App configuration
    │   ├── data/               # Seed/mock data
    │   ├── i18n/
    │   │   └── locales/        # TR and EN translation files
    │   ├── services/           # Business logic services
    │   ├── stores/             # Svelte stores (localStorage-backed)
    │   ├── types/              # TypeScript type definitions
    │   ├── utils/              # Utility modules
    │   └── components/
    │       ├── layout/         # Sidebar, header, app shell
    │       ├── shared/         # Reusable components
    │       ├── ui/             # bits-ui primitives (button, card, dialog, etc.)
    │       ├── dashboard/      # Dashboard widgets
    │       ├── patients/       # Patient-specific components
    │       ├── appointments/   # Appointment components
    │       ├── emr/            # EMR components
    │       ├── billing/        # Billing components
    │       ├── inventory/      # Inventory components
    │       ├── reports/        # Report/chart components
    │       ├── notifications/  # Notification components
    │       ├── settings/       # Settings components
    │       └── users/          # User management components
    └── routes/
        ├── +layout.svelte      # Root layout
        ├── +page.svelte        # Root redirect
        ├── login/
        │   └── +page.svelte    # Login page
        └── (app)/
            ├── +layout.svelte  # Authenticated layout (sidebar + header)
            ├── +layout.ts      # Auth guard
            ├── dashboard/
            ├── patients/       # /patients, /patients/[id], /patients/[id]/edit, /patients/new
            ├── appointments/   # /appointments, /appointments/[id], /appointments/[id]/edit, /appointments/new
            ├── emr/            # /emr, /emr/[patientId], /emr/[patientId]/examination, /emr/[patientId]/prescription
            ├── billing/        # /billing, /billing/invoices/[id], /billing/invoices/new, /billing/payments
            ├── inventory/      # /inventory, /inventory/[id], /inventory/[id]/edit, /inventory/new
            ├── reports/        # /reports, /reports/financial, /reports/appointments, /reports/patient-statistics
            ├── notifications/
            ├── settings/       # /settings, /settings/clinic, /settings/appearance, /settings/notifications
            └── users/          # /users, /users/[id], /users/[id]/edit, /users/new
```

## Key Design Decisions
- **Static-only deployment**: No backend needed, reducing hosting costs and complexity to zero runtime overhead.
- **localStorage persistence**: Provides a realistic CRM feel where data persists across sessions without requiring a database.
- **Route group `(app)`**: SvelteKit route groups separate authenticated and public pages cleanly with a shared layout and auth guard.
- **bits-ui**: Headless component primitives provide accessible, unstyled building blocks that integrate well with Tailwind.
- **i18n with locale files**: Supports the Turkish market (primary) and English (secondary) without a heavy i18n library.
- **Chart.js for reports**: Lightweight charting library sufficient for dashboard visualizations without the weight of D3.

## Verification Checklist
- [ ] `bun install` completes without errors
- [ ] `bun run build` produces a `build/` directory with `index.html`
- [ ] Login with admin@klinik.com / admin123 succeeds
- [ ] Dashboard loads with stats and charts
- [ ] All 10 modules are accessible from the sidebar
- [ ] Patient CRUD: create, view, edit, list all work
- [ ] Appointment scheduling works
- [ ] EMR records load for patients
- [ ] Billing invoices and payments render
- [ ] Inventory items can be created and viewed
- [ ] Reports display charts (financial, appointments, patient stats)
- [ ] Language toggle switches between TR and EN
- [ ] Dark/light mode toggle works
- [ ] DEMO watermark is visible on all pages
- [ ] `robots.txt` contains `Disallow: /`
- [ ] Data persists after page reload (localStorage)
