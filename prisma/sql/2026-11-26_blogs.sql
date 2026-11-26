-- =============================================================================
-- Migration: Blog module (2026-11-26)
--
-- Adds the "Blog" table used by Admin → Blogs and the website blog pages,
-- including SEO fields (meta title/description/keywords, canonical URL,
-- social share image) and tags.
--
-- Properties:
--   * Additive only — creates a new table; no existing table is touched.
--   * Idempotent — safe to run more than once (IF NOT EXISTS everywhere). Also
--     upgrades a Blog table created earlier without the SEO / tag columns.
--   * Transactional — either everything applies or nothing does.
--
-- Run (BEFORE deploying the new admin build):
--   npm run db:migrate:blogs
-- which is:
--   npx prisma db execute --file prisma/sql/2026-11-26_blogs.sql --schema prisma/schema.prisma
--
-- Then load the data:
--   npm run seed
--
-- Take a backup first:
--   pg_dump "$DATABASE_URL" -Fc -f backup_before_blogs.dump
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';

CREATE TABLE IF NOT EXISTS "Blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'Counsel India',
    "category" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Published',
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- SEO + tags (added separately so older Blog tables are upgraded too)
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "metaKeywords" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "ogImage"      TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "tags"         TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Blog_slug_key" ON "Blog"("slug");
CREATE INDEX IF NOT EXISTS "Blog_status_publishedAt_idx" ON "Blog"("status", "publishedAt");

COMMIT;
