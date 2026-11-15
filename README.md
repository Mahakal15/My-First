# CODE ZERO STORE

A responsive digital-resource marketplace starter built with HTML5, CSS3, Vanilla JavaScript, Sass and Supabase.

## Current implementation

- Responsive premium dark interface and light-theme toggle.
- Hash-based navigation and category filtering.
- Global client-side search and sorting.
- Local bookmarks and collections storage.
- Resource submission form with browser-local demo mode.
- Optional Supabase public resource reads and pending submissions.
- Initial PostgreSQL schema and restrictive RLS policies.
- Basic PWA manifest and service worker.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run serve
```

Open http://localhost:4173.

You can also serve the folder with VS Code Live Server. Do not open `index.html` directly as a `file://` URL when testing the service worker.

## Configure Supabase

1. Create a Supabase project.
2. Open the SQL Editor and apply `database/migrations/001_initial_schema.sql`.
3. Create a Storage bucket named `resource-files` and configure narrowly scoped policies.
4. Copy the project URL and public publishable/anon key into `js/config.js`.
5. Never put a service-role key in browser code.
6. Implement a Supabase Edge Function for public submissions. It must validate fields, CAPTCHA, rate limits, file type/size, and create pending records.
7. Configure Storage policies to prevent arbitrary public uploads.

The current browser submission path is a starter integration, not a hardened public submission endpoint. For production, replace direct anonymous inserts with the Edge Function described above.

## Important production gaps

This repository is an initial working foundation, not a completed production marketplace. Creator accounts, administrator workflows, moderation UI, secure anonymous upload sessions, resumable uploads, PDF.js integration, code editor integration, social features, payments, full search, analytics, notifications, malware scanning and comprehensive automated tests still require implementation and testing.

The sample resources shown without Supabase are clearly demo content. They are not real community submissions or platform analytics.

## Security

- RLS is enabled on the initial tables.
- Public read access is limited to approved resources.
- No unrestricted anonymous database write policy is included.
- Do not deploy public submissions until the Edge Function and Storage policies are implemented.
- Add CSP/security headers at the hosting layer and validate all uploaded files server-side.

## Deployment

Deploy the static frontend to a static host (Netlify, Vercel static hosting, Cloudflare Pages or equivalent). Configure SPA/static fallback behavior as needed. Deploy Supabase migrations and Edge Functions separately. Configure HTTPS and production security headers.
