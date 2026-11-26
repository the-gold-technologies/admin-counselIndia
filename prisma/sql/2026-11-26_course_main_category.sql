-- =============================================================================
-- Migration: Course main category (2026-11-26)
--
-- Adds "Course"."mainCategory" — the top-level group shown in the website's
-- course menu: CI Programs, IPA, AIU, MIT. The existing "category" column stays
-- as the sub-category (Masters Programs, PG Diploma Programs, ...).
--
-- Additive, idempotent, transactional. Existing courses default to 'CI Programs';
-- `npm run seed` reloads courses with their main category (IPA courses → 'IPA').
--
-- Run:  npm run db:migrate:course-main-category
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';

ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "mainCategory" TEXT DEFAULT 'CI Programs';

COMMIT;
