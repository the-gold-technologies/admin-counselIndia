-- =============================================================================
-- Migration: Staff & Roles access control (2026-11-26)
--
-- Adds the "Role" table (name + admin sections it can open) and links each
-- admin user to a role via "User"."roleId".
--   * SUPERADMIN users keep full access.
--   * STAFF users can only open the sections listed in their role.
--
-- Properties:
--   * Additive only — new table + one nullable column; no data rewritten.
--   * Idempotent — safe to run more than once.
--   * Transactional — either everything applies or nothing does.
--
-- Run (BEFORE deploying the new admin build):
--   npm run db:migrate:staff-roles
-- which is:
--   npx prisma db execute --file prisma/sql/2026-11-26_staff_roles.sql --schema prisma/schema.prisma
--
-- Then load the roles & staff from the old admin:
--   npm run update
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';

CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Role_name_key" ON "Role"("name");

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleId" TEXT;

CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_roleId_fkey') THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey"
      FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

COMMIT;
