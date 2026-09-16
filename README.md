# HStudio Booking System

Production-ready starter for HStudio. Public booking, customer accounts, self-service booking management, staff/admin auth, availability, time off, services and staff are backed by Supabase. Stripe Checkout and notifications are implemented as Supabase Edge Functions.

## Deploy
1. Create/connect a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Create Hayd and Joe auth users, then run the commented staff mapping statements at the bottom of schema.sql with their UUIDs.
4. Edit `config.js` with your Supabase project URL and publishable key (safe for browser use with RLS). Never put a secret/service-role key in `config.js`.
5. Deploy the folder to Cloudflare Pages / Netlify / any static host.
6. Deploy Edge Functions from `supabase/functions`. Add secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`.
7. In Stripe create a webhook for Checkout completion if you want payment status reconciliation beyond the included success flow.

Without provider credentials the booking engine, availability and admin system still work; online payment/email/SMS require those provider keys.
