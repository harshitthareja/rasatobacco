CREATE TABLE IF NOT EXISTS public.loyalty_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  city text,
  created_at timestamptz DEFAULT now(),
  points integer DEFAULT 0,
  tier text DEFAULT 'Bronze' CHECK (tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  total_spent numeric DEFAULT 0,
  birthday date,
  instagram_handle text,
  referral_code text UNIQUE DEFAULT substr(md5(gen_random_uuid()::text), 1, 8),
  referred_by text
);

CREATE TABLE IF NOT EXISTS public.loyalty_points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES public.loyalty_members(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.loyalty_members TO anon, authenticated;
GRANT ALL ON public.loyalty_members TO service_role;
GRANT SELECT ON public.loyalty_points_log TO anon, authenticated;
GRANT ALL ON public.loyalty_points_log TO service_role;

ALTER TABLE public.loyalty_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign up" ON public.loyalty_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read" ON public.loyalty_members FOR SELECT USING (true);
CREATE POLICY "Public read logs" ON public.loyalty_points_log FOR SELECT USING (true);