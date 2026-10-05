CREATE TABLE IF NOT EXISTS public.admin_config (
  key text PRIMARY KEY,
  value text NOT NULL
);
GRANT ALL ON public.admin_config TO service_role;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.admin_config (key, value) VALUES ('admin_password_hash', 'rasa_admin_2024') ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_partner_reg_status ON public.partner_registrations(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON public.enquiries(email);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_members_tier ON public.loyalty_members(tier);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON public.newsletter_subscribers(subscribed_at DESC);