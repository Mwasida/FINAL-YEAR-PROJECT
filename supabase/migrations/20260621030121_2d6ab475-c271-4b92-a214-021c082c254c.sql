
-- Seed default admin and farmer accounts directly
DO $$
DECLARE
  admin_id uuid;
  farmer_id uuid;
BEGIN
  -- Admin user
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@agrisage.local';
  IF admin_id IS NULL THEN
    admin_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_id, 'authenticated', 'authenticated',
      'admin@agrisage.local', crypt('Admin@1235', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin User"}'::jsonb, now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_id,
      jsonb_build_object('sub', admin_id::text, 'email', 'admin@agrisage.local', 'email_verified', true),
      'email', admin_id::text, now(), now(), now());
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (admin_id, 'admin') ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (admin_id, 'farmer') ON CONFLICT DO NOTHING;

  -- Farmer user
  SELECT id INTO farmer_id FROM auth.users WHERE email = 'farmer@agrisage.local';
  IF farmer_id IS NULL THEN
    farmer_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', farmer_id, 'authenticated', 'authenticated',
      'farmer@agrisage.local', crypt('Farmer@1235', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Farmer"}'::jsonb, now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), farmer_id,
      jsonb_build_object('sub', farmer_id::text, 'email', 'farmer@agrisage.local', 'email_verified', true),
      'email', farmer_id::text, now(), now(), now());
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (farmer_id, 'farmer') ON CONFLICT DO NOTHING;
END $$;
