GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE education TO authenticated;

CREATE POLICY "Authenticated users can view education"
  ON education
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert education"
  ON education
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update education"
  ON education
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete education"
  ON education
  FOR DELETE
  TO authenticated
  USING (true);
