-- Migration: 026_remove_default_certificates.sql
-- Description: Removes default/placeholder reference certificates so only real user-uploaded certificates appear

DELETE FROM certifications 
WHERE name IN (
  'MY Bharat Budget Quest 2026 – Final Round',
  'Certificate of Presentation – AIDE 2026',
  'AIC Nitte Internship'
);
