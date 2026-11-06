CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  blob_url TEXT NOT NULL,
  blob_key TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  uploaded_by TEXT,
  uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
  file_size INTEGER,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  notes TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_resumes_single_active ON resumes(is_active) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_resumes_uploaded_at ON resumes(uploaded_at DESC);

-- Apply migration_resume_invariants.sql after this base schema to install atomic activation.


