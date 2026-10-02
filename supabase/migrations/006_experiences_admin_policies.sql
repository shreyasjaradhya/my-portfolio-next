GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE experiences TO authenticated;

CREATE POLICY "Authenticated users can view experiences"
  ON experiences
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert experiences"
  ON experiences
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update experiences"
  ON experiences
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete experiences"
  ON experiences
  FOR DELETE
  TO authenticated
  USING (true);
