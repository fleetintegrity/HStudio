# North & Co. Barber Booking Sales Demo

Interactive fictional barber-shop demonstration built from the original HStudio booking system.

The `main` branch is the generic North & Co. sales demo. It includes the public website, live booking journey, customer account experience and staff/owner management dashboard backed by the demo Supabase project.

## Important

- North & Co. is fictional. Demo names, customers, appointments and shop information must remain fictional.
- Do not enter real customer or payment data into the demo.
- Keep search engines out of the demo (`noindex` / robots disallow).
- The original HStudio code is preserved separately on `hstudio-archive-2026-09-16`. Do not modify that archive branch when evolving the sales demo.
- `config.js` contains only the browser-safe Supabase publishable key. Never place a secret/service-role key in frontend code.

## Demo areas

- `index.html` — North & Co. sales-demo homepage
- `booking.html` — interactive customer booking journey
- `account.html` — customer account / booking management
- `staff-login.html` — demo staff sign-in
- `admin.html` — owner/barber dashboard

The customer and staff experiences share the same live demo backend so changes to services, availability, appointments and shop configuration can be demonstrated across both sides of the product.
