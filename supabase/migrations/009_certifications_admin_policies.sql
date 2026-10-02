GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE certifications TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can view certifications" ON certifications;
CREATE POLICY "Authenticated users can view certifications"
  ON certifications
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert certifications" ON certifications;
CREATE POLICY "Authenticated users can insert certifications"
  ON certifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update certifications" ON certifications;
CREATE POLICY "Authenticated users can update certifications"
  ON certifications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete certifications" ON certifications;
CREATE POLICY "Authenticated users can delete certifications"
  ON certifications
  FOR DELETE
  TO authenticated
  USING (true);
