# Backend setup

Supabase is used for PostgreSQL, Auth, Storage and Edge Functions. The initial migration defines the public resource table and enables RLS. Approved resources are readable publicly. Anonymous writes are intentionally not enabled.

Recommended Edge Function endpoints:
- `submit-resource`: CAPTCHA verification, rate limiting, metadata validation, controlled storage upload and pending submission.
- `moderate-resource`: administrator-only approve/reject workflow.
- `resource-download`: validates visibility and records download events.
- `record-view`: rate-limited view tracking.

All administrator authorization must be enforced server-side.
