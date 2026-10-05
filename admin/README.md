# RASA Admin Console

A standalone React app for running the store, kept separate from the public
website. It talks to the same Supabase project through the admin edge functions
(`admin-data`, `admin-update`, `admin-shipping`). Each function checks the
caller's role server-side, so this bundle holds no secrets.

## Run locally

```sh
cd admin
cp .env.example .env   # fill in the same VITE_SUPABASE_* values as the website
npm install
npm run dev            # http://localhost:5174
```

## Deploy

Build with `npm run build` and host `admin/dist` as a static site on its own
domain, e.g. `admin.rasatobacco.com` on Vercel, Netlify or Cloudflare Pages.
Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the host's
environment.

If you use Google sign-in, add the admin URL to Supabase → Authentication →
URL Configuration → Redirect URLs.

## Granting admin access

Have the person sign up or sign in once, then run this in the Supabase SQL editor:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'owner@rasatobacco.com';
```

Remove access with `DELETE FROM public.user_roles WHERE user_id = '…';`.

## Order flow

1. **Checkout (website):** `create-order` prices the buyer's cart on the server,
   adds the shipping fee from Store Settings, saves a `pending` order and creates
   a Razorpay order. The browser then opens the Razorpay Standard Checkout modal.
2. **Payment:** `verify-payment` checks
   `HMAC-SHA256(order_id|payment_id, KEY_SECRET)`. Only when the signature
   matches does the order become `paid` / `confirmed`. At that point stock is
   decremented and the cart is emptied. `razorpay-webhook` does the same
   if the buyer closes the tab before verification.
3. **Fulfilment (here):** Orders → filter **Ready to ship** → open the order →
   **Book shipment**. Flexi creates the shipment and returns an AWB, and the order
   moves to `processing`.
4. **Schedule pickup** and **Print labels** work on one order or on several
   selected orders.
5. **Sync tracking** (or **Track** on a single order) pulls Flexi tracking,
   moving the order to `shipped` and then `delivered`. Buyers also see the
   tracking timeline on their order page.

## Edge function secrets (Supabase → Edge Functions → Secrets)

| Secret | Purpose |
| --- | --- |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Create orders and verify payment signatures |
| `RAZORPAY_WEBHOOK_SECRET` | Verify Razorpay webhooks (optional, but recommended) |
| `FLEXI_BASE_URL` | `https://uat.flexiworld.in/api/v1/customer` (switch to the production URL at go-live) |
| `FLEXI_EMAIL`, `FLEXI_PASSWORD` | Flexi account used to get an API token |

Razorpay webhook: in Dashboard → Webhooks, add
`https://<project-ref>.supabase.co/functions/v1/razorpay-webhook` with the events
`payment.captured`, `order.paid` and `payment.failed`.
