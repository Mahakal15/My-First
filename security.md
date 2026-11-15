# Security deployment checklist

- Keep service-role, payment and CAPTCHA secret keys exclusively in server-side secrets.
- Route anonymous submissions through an Edge Function.
- Validate all fields and file contents server-side; do not trust browser MIME metadata.
- Add rate limits and CAPTCHA to submissions, comments, likes and reports.
- Configure least-privilege RLS and Storage policies.
- Restrict upload size, extensions, MIME types and archive extraction.
- Scan uploads for malware before public release.
- Sanitize rendered rich text and validate outbound URLs.
- Add a restrictive Content Security Policy and other security headers.
- Protect admin actions with server-side role checks and audit logs.
- Never execute uploaded code on the application origin.
- Provide privacy, retention and deletion workflows.
