CREATE TABLE IF NOT EXISTS public.laundry (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0
);

INSERT INTO public.laundry (name, display_order)
VALUES
  ('Ironing', 1),
  ('Dry cleaning', 2),
  ('Washing', 3)
ON CONFLICT (name) DO UPDATE
SET display_order = EXCLUDED.display_order;

GRANT SELECT ON TABLE public.laundry TO anon, authenticated;
