# ORIVANA Health: setup (phone friendly)

## 1. Supabase (SQL editor, run each file once, in order)
1. `supabase/01_schema.sql`
2. `supabase/02_functions.sql`
3. `supabase/03_rls.sql`
4. `supabase/06_grants.sql`
5. `oh_05_admin_user_PRIVATE.sql` (kept OUTSIDE the repo) creates the first Super Admin (avdhesh20@gmail.com).
Authentication > URL configuration: Site URL = your site; add Redirect URL `https://YOUR-SITE/auth/callback`.
Storage: buckets `oh-media` (public) and `oh-private` (private) are created by 02. Check both exist under Storage.

## 2. Vercel environment variables
See `.env.example`. Required: NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY.

## 3. First login
Open `/admin`, sign in, then Admin > System > Load starter content (once). Then Settings > change password, add contact details.

## 4. What you add in Admin (nothing is invented)
Leadership photos, partners/hospitals, doctors, equipment listings and suppliers, courses/lessons/PDFs/videos/quizzes, events, FAQs, legal text.
A partner, provider or equipment listing is shown as verified only when you set Verification to "verified".

## 5. Donations (payments are OFF by default)
Until you do all three below, the donation form only records "intent to support" and takes no money.
1. Confirm ORIVANA's legal eligibility to receive donations (with your adviser) and turn ON Settings > Donations > "legal eligibility verified".
2. Create a Razorpay account; set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET in Vercel. Webhook URL: `https://YOUR-SITE/api/payments/webhook` with events payment.captured, payment.failed, refund.processed.
3. Turn ON Settings > Donations > "Accept online payments".
Record bank/UPI receipts in Admin > Donations > "Record a contribution received outside the website". Never claim tax benefits unless verified: use Settings > "Tax / registration statement".

## 6. Case workflow
Admin > Assistance cases: change status (timeline + optional email), message the patient, open private documents (logged), set verification. To publish a case: mark Verified, patient consent for public sharing must be ticked, write the approved title/summary, set a verified goal (optional), choose "Approved". Amount raised = paid donations less refunds. Never automatic.
Patients track with Case ID + access code at `/care/track`.
