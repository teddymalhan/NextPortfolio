-- Deploy before application code that calls activate_resume(integer).
-- Existing multiple-active data keeps the newest upload (highest ID breaks ties).
BEGIN;

LOCK TABLE resumes IN ACCESS EXCLUSIVE MODE;

UPDATE resumes SET is_active = FALSE
WHERE is_active = TRUE AND id <> (
  SELECT id FROM resumes WHERE is_active = TRUE
  ORDER BY uploaded_at DESC NULLS LAST, id DESC LIMIT 1
);
UPDATE resumes
SET is_active = COALESCE(is_active, FALSE),
    uploaded_at = COALESCE(uploaded_at, NOW()),
    mime_type = COALESCE(mime_type, 'application/pdf');


ALTER TABLE resumes
  ALTER COLUMN is_active SET NOT NULL,
  ALTER COLUMN uploaded_at SET NOT NULL,
  ALTER COLUMN mime_type SET NOT NULL;

DROP INDEX IF EXISTS idx_resumes_active;
CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_single_active
  ON resumes (is_active) WHERE is_active = TRUE;

CREATE OR REPLACE FUNCTION activate_resume(target_id INTEGER)
RETURNS SETOF resumes
LANGUAGE plpgsql
AS $$
BEGIN
  -- Serialize activations; lock the target before deactivation so deletion cannot remove it mid-switch.
  PERFORM pg_advisory_xact_lock(724378291);
  PERFORM id FROM resumes WHERE id = target_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;
  UPDATE resumes SET is_active = FALSE WHERE is_active = TRUE AND id <> target_id;
  RETURN QUERY UPDATE resumes SET is_active = TRUE WHERE id = target_id RETURNING *;
END;
$$;

COMMIT;
