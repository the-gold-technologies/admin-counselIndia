-- =============================================================================
-- Migration: Page SEO (2026-11-26)
--
-- Adds the "PageSeo" table used by Admin → Page SEO and by the website to build
-- each page's <title>, meta description, keywords, canonical URL, social share
-- tags and robots (index / follow) settings. The row with path '*' holds the
-- site-wide defaults.
--
-- Additive only, idempotent (IF NOT EXISTS / NOT ANY), transactional.
--
-- Run (BEFORE deploying the new admin build):
--   npm run db:migrate:page-seo
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';

CREATE TABLE IF NOT EXISTS "PageSeo" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSeo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PageSeo_path_key" ON "PageSeo"("path");

-- Give the new "Page SEO" section to the existing roles that manage website content.
-- (Super Admins always have it. Other roles can be ticked in Admin -> Roles & Access.)
UPDATE "Role"
   SET "permissions" = array_append(COALESCE("permissions", '{}'), 'page-seo'),
       "updatedAt"   = CURRENT_TIMESTAMP
 WHERE "name" IN ('Admin', 'Adminpower', 'Marketing')
   AND NOT ('page-seo' = ANY(COALESCE("permissions", '{}')));

COMMIT;
