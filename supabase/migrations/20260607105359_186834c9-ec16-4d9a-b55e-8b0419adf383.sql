
-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
          NEW.raw_user_meta_data->>'phone');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- THREADS
CREATE TABLE public.threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX threads_user_idx ON public.threads(user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.threads TO authenticated;
GRANT ALL ON public.threads TO service_role;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "threads owner all" ON public.threads FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER threads_touch BEFORE UPDATE ON public.threads
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- MESSAGES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  parts jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_thread_idx ON public.messages(thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages owner all" ON public.messages FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DISEASES (public read)
CREATE TABLE public.diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  crop text,
  symptoms text,
  causes text,
  treatment text,
  prevention text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.diseases TO anon, authenticated;
GRANT ALL ON public.diseases TO service_role;
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diseases public read" ON public.diseases FOR SELECT TO anon, authenticated USING (true);

-- PRODUCTS (public read)
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  usage text,
  price numeric(10,2),
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);

-- SHOPS (public read)
CREATE TABLE public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  contact text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.shops TO anon, authenticated;
GRANT ALL ON public.shops TO service_role;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shops public read" ON public.shops FOR SELECT TO anon, authenticated USING (true);

-- PRODUCT <-> DISEASE
CREATE TABLE public.disease_products (
  disease_id uuid NOT NULL REFERENCES public.diseases(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  PRIMARY KEY (disease_id, product_id)
);
GRANT SELECT ON public.disease_products TO anon, authenticated;
GRANT ALL ON public.disease_products TO service_role;
ALTER TABLE public.disease_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "disease_products public read" ON public.disease_products FOR SELECT TO anon, authenticated USING (true);

-- PRODUCT <-> SHOP
CREATE TABLE public.product_shops (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, shop_id)
);
GRANT SELECT ON public.product_shops TO anon, authenticated;
GRANT ALL ON public.product_shops TO service_role;
ALTER TABLE public.product_shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_shops public read" ON public.product_shops FOR SELECT TO anon, authenticated USING (true);

-- DIAGNOSES
CREATE TABLE public.diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text,
  disease_name text,
  crop text,
  confidence numeric(4,3),
  symptoms text,
  treatment text,
  prevention text,
  recommended_product_ids uuid[],
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX diagnoses_user_idx ON public.diagnoses(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnoses TO authenticated;
GRANT ALL ON public.diagnoses TO service_role;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diagnoses owner all" ON public.diagnoses FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEED DATA
INSERT INTO public.diseases (name, crop, symptoms, causes, treatment, prevention) VALUES
('Tomato Leaf Blight','Tomato','Dark brown spots on leaves with yellow halos; lesions expand and leaves wither.','Fungal infection (Alternaria/Phytophthora) thriving in warm humid conditions.','Apply Mancozeb or Copper-based fungicides every 7-10 days; remove infected leaves.','Rotate crops; avoid overhead watering; ensure spacing for airflow; use resistant varieties.'),
('Wheat Rust','Wheat','Orange-brown pustules on leaves and stems; reduced yield.','Puccinia fungus spread by wind in cool moist weather.','Spray Propiconazole or Tebuconazole at flag-leaf stage.','Plant rust-resistant varieties; early sowing; remove volunteer wheat.'),
('Rice Blast','Rice','Diamond-shaped lesions on leaves; neck rot at panicle base.','Magnaporthe oryzae fungus, favored by high humidity and nitrogen.','Apply Tricyclazole or Carbendazim; drain field briefly.','Balanced fertilizer; resistant varieties; clean seed.'),
('Powdery Mildew','Cucurbits','White powdery patches on leaves and stems.','Fungal pathogens in warm dry conditions with humid nights.','Sulfur dust or Potassium bicarbonate spray; neem oil for organic.','Resistant varieties; airflow; avoid excess nitrogen.'),
('Maize Fall Armyworm','Maize','Ragged holes in leaves; sawdust-like frass in whorl.','Spodoptera frugiperda larvae.','Spray Emamectin Benzoate or Spinosad at dusk.','Pheromone traps; early planting; intercropping with legumes.');

INSERT INTO public.products (name, description, usage, price) VALUES
('Mancozeb 75% WP','Broad-spectrum protective fungicide','Mix 2g per liter of water; spray every 7-10 days',8.50),
('Copper Oxychloride','Contact fungicide & bactericide','Mix 3g per liter; spray fortnightly',6.00),
('Ridomil Gold','Systemic + contact fungicide','Mix 2.5g per liter; apply 2-3 sprays',14.00),
('Propiconazole 25% EC','Systemic triazole fungicide','1ml per liter; spray at first sign of disease',12.00),
('Tricyclazole 75% WP','Rice blast specialist','0.6g per liter; spray at boot stage',10.00),
('Sulfur 80% WDG','Organic-friendly mildew control','3g per liter; spray weekly',5.00),
('Emamectin Benzoate 5%','Lepidopteran insecticide','0.4g per liter; spray at dusk',9.00),
('Neem Oil 1500ppm','Organic broad-spectrum','5ml per liter; weekly spray',7.50);

INSERT INTO public.shops (name, address, contact, latitude, longitude) VALUES
('Green Valley Agro','12 Market Road, Pune','+91-98765-43210',18.5204,73.8567),
('Kisan Krishi Kendra','Main Bazaar, Nashik','+91-99887-12345',19.9975,73.7898),
('FarmFresh Supplies','Sector 21, Hyderabad','+91-90909-11122',17.3850,78.4867);

-- link products to diseases
WITH d AS (SELECT id, name FROM public.diseases), p AS (SELECT id, name FROM public.products)
INSERT INTO public.disease_products (disease_id, product_id)
SELECT d.id, p.id FROM d, p WHERE
 (d.name='Tomato Leaf Blight' AND p.name IN ('Mancozeb 75% WP','Copper Oxychloride','Ridomil Gold'))
 OR (d.name='Wheat Rust' AND p.name IN ('Propiconazole 25% EC','Mancozeb 75% WP'))
 OR (d.name='Rice Blast' AND p.name IN ('Tricyclazole 75% WP','Propiconazole 25% EC'))
 OR (d.name='Powdery Mildew' AND p.name IN ('Sulfur 80% WDG','Neem Oil 1500ppm'))
 OR (d.name='Maize Fall Armyworm' AND p.name IN ('Emamectin Benzoate 5%','Neem Oil 1500ppm'));

-- link products to shops (every product carried by every shop for v1)
INSERT INTO public.product_shops (product_id, shop_id)
SELECT p.id, s.id FROM public.products p CROSS JOIN public.shops s;
