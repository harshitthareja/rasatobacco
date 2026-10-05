
ALTER TABLE public.loyalty_members ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.loyalty_points_config (
  id text PRIMARY KEY,
  label text NOT NULL,
  points integer NOT NULL,
  description text,
  active boolean DEFAULT true
);

GRANT SELECT ON public.loyalty_points_config TO anon, authenticated;
GRANT ALL ON public.loyalty_points_config TO service_role;

INSERT INTO public.loyalty_points_config (id, label, points, description) VALUES
  ('signup', 'Welcome Bonus', 100, 'Awarded on joining the loyalty program'),
  ('profile_complete', 'Complete Profile', 50, 'Awarded when all profile fields are filled'),
  ('instagram_tag', 'Instagram Post & Tag', 75, 'Post on Instagram and tag @rasatobacco'),
  ('review', 'Write a Review', 50, 'Submit a product review'),
  ('referral', 'Refer a Friend', 150, 'Friend joins using your referral code'),
  ('birthday', 'Birthday Bonus', 200, 'Awarded on your birthday month')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.loyalty_points_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read config" ON public.loyalty_points_config;
CREATE POLICY "Anyone can read config" ON public.loyalty_points_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Member can read own row" ON public.loyalty_members;
CREATE POLICY "Member can read own row" ON public.loyalty_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Member can update own row" ON public.loyalty_members;
CREATE POLICY "Member can update own row" ON public.loyalty_members FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Member can read own log" ON public.loyalty_points_log;
CREATE POLICY "Member can read own log" ON public.loyalty_points_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service can insert log" ON public.loyalty_points_log;
CREATE POLICY "Service can insert log" ON public.loyalty_points_log FOR INSERT WITH CHECK (true);
