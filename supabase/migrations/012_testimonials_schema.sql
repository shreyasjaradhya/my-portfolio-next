CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  avatar_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_testimonials_display_order ON public.testimonials(display_order);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.testimonials TO authenticated;

CREATE POLICY "Public can view testimonials"
  ON public.testimonials
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can view testimonials"
  ON public.testimonials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert testimonials"
  ON public.testimonials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update testimonials"
  ON public.testimonials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete testimonials"
  ON public.testimonials
  FOR DELETE
  TO authenticated
  USING (true);
