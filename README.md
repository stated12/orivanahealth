# ORIVANA Health
Next.js 16 (App Router) + Supabase + Vercel. Public site, ORIVANA Care case management, medical tourism, training (LMS), equipment discovery, partners, community health, Health Navigator, Donate for the Needy, admin at `/admin`. See `docs/SETUP.md`.
Tables are prefixed `oh_`. Server code uses the Supabase service-role key; RLS is enabled on every table as a backstop. Private case documents live in the `oh-private` bucket and are opened only through short-lived signed links (audited).
