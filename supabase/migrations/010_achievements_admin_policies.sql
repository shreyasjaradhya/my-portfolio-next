GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE achievements TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can view achievements" ON achievements;
CREATE POLICY "Authenticated users can view achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert achievements" ON achievements;
CREATE POLICY "Authenticated users can insert achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update achievements" ON achievements;
CREATE POLICY "Authenticated users can update achievements"
  ON achievements
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete achievements" ON achievements;
CREATE POLICY "Authenticated users can delete achievements"
  ON achievements
  FOR DELETE
  TO authenticated
  USING (true);
