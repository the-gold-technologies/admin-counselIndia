-- =============================================================================
-- Production migration: security hardening (2026-11-13)
--
-- Brings an existing production database in line with prisma/schema.prisma:
--   User: session revocation + brute-force lockout columns
--   (required by the new login / logout / profile code — deploy will fail
--    at login time without them)
--
-- Properties:
--   * Additive only — no columns dropped, no data rewritten.
--   * Idempotent — safe to run more than once (IF NOT EXISTS everywhere).
--   * Transactional — either everything applies or nothing does.
--   * Fast — ADD COLUMN with a constant default is metadata-only on PG 11+,
--     so no table rewrite / long lock.
--
-- Run (BEFORE deploying the new app build):
--   npm run db:migrate:prod
-- which is:
--   npx prisma db execute --file prisma/sql/2026-11-13_security_hardening.sql --schema prisma/schema.prisma
--
-- Take a backup first:
--   pg_dump "$DATABASE_URL" -Fc -f backup_before_security_hardening.dump
-- =============================================================================

BEGIN;

-- Fail fast instead of queueing behind long-running queries on a busy DB
SET LOCAL lock_timeout = '10s';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sessionVersion"      INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lockedUntil"         TIMESTAMP(3);

COMMIT;

-- -----------------------------------------------------------------------------
-- Verify (run manually in psql; should list all 3 columns):
--
-- SELECT table_name, column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'User' AND column_name IN ('sessionVersion','failedLoginAttempts','lockedUntil');
--
-- Rollback (only if you also roll the app back to the previous build):
--
-- BEGIN;
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "lockedUntil";
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "failedLoginAttempts";
-- ALTER TABLE "User" DROP COLUMN IF EXISTS "sessionVersion";
-- COMMIT;
-- -----------------------------------------------------------------------------
