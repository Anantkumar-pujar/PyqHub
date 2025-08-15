-- Schema for PyqHub
-- Run automatically by Postgres container during first initialization

-- Create `users` table to match provided schema image
-- Columns: id, username, password, role, email, reset_token, reset_token_expires, created_at, updated_at

CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	role VARCHAR(20),
	email VARCHAR(100),
	reset_token VARCHAR(255),
	reset_token_expires TIMESTAMP WITHOUT TIME ZONE,
	created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
	updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- Add index on reset_token for quicker lookup during password resets
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Uploads table used by uploadRoutes.js
CREATE TABLE IF NOT EXISTS uploads (
	id SERIAL PRIMARY KEY,
	filename VARCHAR(255) NOT NULL,
	filetype VARCHAR(50) NOT NULL,
	filesize BIGINT NOT NULL,
	uploaded_by VARCHAR(100) NOT NULL,
	uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
	description TEXT,
	subject_name VARCHAR(100) NOT NULL,
	subject_code VARCHAR(50) NOT NULL,
	academic_year VARCHAR(20) NOT NULL,
	category VARCHAR(50) NOT NULL,
	status VARCHAR(20) NOT NULL DEFAULT 'pending',
	file_url TEXT,
	public_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);
CREATE INDEX IF NOT EXISTS idx_uploads_subject ON uploads(subject_name, subject_code);
-- Optional: index uploaded_by if you plan to query by uploader frequently
CREATE INDEX IF NOT EXISTS idx_uploads_uploaded_by ON uploads(uploaded_by);

-- Session table for connect-pg-simple (if needed)
CREATE TABLE IF NOT EXISTS "session" (
	sid VARCHAR NOT NULL COLLATE "default",
	sess JSON NOT NULL,
	expire TIMESTAMP(6) NOT NULL
);

-- Ensure `sid` is unique for ON CONFLICT usage. Some Postgres versions don't support
-- ALTER ... ADD CONSTRAINT IF NOT EXISTS, so create a unique index if missing.
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE c.relkind = 'i' AND c.relname = 'idx_session_sid'
	) THEN
		CREATE UNIQUE INDEX idx_session_sid ON "session" (sid);
	END IF;
END
$$;

