-- Actor display names on activities + named CRM users
ALTER TABLE public.lead_activities
  ADD COLUMN IF NOT EXISTS actor_name text;

UPDATE auth.users
SET raw_user_meta_data =
  COALESCE(raw_user_meta_data, '{}'::jsonb)
  || '{"full_name":"Reece","name":"Reece"}'::jsonb
WHERE email = 'reecejecooper@gmail.com';

UPDATE auth.users
SET raw_user_meta_data =
  COALESCE(raw_user_meta_data, '{}'::jsonb)
  || '{"full_name":"Carson","name":"Carson"}'::jsonb
WHERE email = 'akaike.ventures@gmail.com';

UPDATE public.lead_activities a
SET actor_name = COALESCE(
  NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''),
  NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
  split_part(u.email, '@', 1),
  u.email,
  'Unknown'
)
FROM auth.users u
WHERE a.user_id = u.id;
