# Setup

1. Install Node.js LTS.
2. Run `npm install`.
3. Run `npm run serve`.
4. Visit `http://localhost:4173`.
5. To enable database reads, create a Supabase project, apply the migration and set `supabaseUrl` and `supabaseAnonKey` in `js/config.js`.
6. Keep public writes disabled until a secure Edge Function is deployed.
