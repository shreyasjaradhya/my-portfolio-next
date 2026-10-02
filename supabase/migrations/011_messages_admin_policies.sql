GRANT SELECT, UPDATE, DELETE ON TABLE messages TO authenticated;

DROP POLICY IF EXISTS "Authenticated users can view messages" ON messages;
CREATE POLICY "Authenticated users can view messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can update messages" ON messages;
CREATE POLICY "Authenticated users can update messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete messages" ON messages;
CREATE POLICY "Authenticated users can delete messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (true);
