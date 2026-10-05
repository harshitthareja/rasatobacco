
CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  business text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  type text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.enquiries TO anon, authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert enquiry" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read enquiries" ON public.enquiries FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.partner_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  company text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  business_type text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  message text DEFAULT '',
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_registrations TO anon, authenticated;
GRANT ALL ON public.partner_registrations TO service_role;
ALTER TABLE public.partner_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert partner reg" ON public.partner_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read partner regs" ON public.partner_registrations FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  source text DEFAULT 'popup' CHECK (source IN ('popup', 'footer')),
  subscribed_at timestamptz DEFAULT now()
);
GRANT SELECT, INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read subscribers" ON public.newsletter_subscribers FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.catalogue_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  collection text NOT NULL,
  requested_at timestamptz DEFAULT now()
);
GRANT INSERT ON public.catalogue_requests TO anon, authenticated;
GRANT ALL ON public.catalogue_requests TO service_role;
ALTER TABLE public.catalogue_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request catalogue" ON public.catalogue_requests FOR INSERT WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider'
  )
  ON CONFLICT (id) DO UPDATE SET
    last_sign_in = now(),
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
