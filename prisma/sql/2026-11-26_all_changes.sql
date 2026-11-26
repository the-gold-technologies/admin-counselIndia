-- =============================================================================
-- ALL database changes of 2026-11-26 in one file
--
--   1. Blogs                      (Admin → Blogs)
--   2. Staff roles & access       (Admin → Staff & Roles)
--   3. Course main category       (CI Programs / IPA / AIU / MIT)
--   4. Page SEO                   (Admin → Page SEO, + permission for existing roles)
--   5. Featured counsellors       ("Show at top" / active trainers)
--   6. Page SEO data imported from the old admin (135 pages)
--
-- Safe to run more than once:
--   * Additive only — creates tables / columns / indexes, never drops or rewrites data.
--   * Idempotent — IF NOT EXISTS everywhere; the Page SEO import skips pages that
--     already have SEO (ON CONFLICT DO NOTHING), so edits made in the admin are kept.
--   * One transaction — either everything is applied or nothing is.
--
-- Run (BEFORE deploying the new admin build):
--   npm run db:migrate:2026-11-26
-- which is:
--   npx prisma db execute --file prisma/sql/2026-11-26_all_changes.sql --schema prisma/schema.prisma
--
-- Take a backup first:
--   pg_dump "$DATABASE_URL" -Fc -f backup_before_2026-11-26.dump
--
-- =============================================================================

BEGIN;

SET LOCAL lock_timeout = '10s';

-- -----------------------------------------------------------------------------
-- 1. Blogs — Blog table with SEO fields and tags (Admin → Blogs)
-- -----------------------------------------------------------------------------

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

ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "metaKeywords" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "ogImage"      TEXT;
ALTER TABLE "Blog" ADD COLUMN IF NOT EXISTS "tags"         TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "Blog_slug_key" ON "Blog"("slug");
CREATE INDEX IF NOT EXISTS "Blog_status_publishedAt_idx" ON "Blog"("status", "publishedAt");

-- -----------------------------------------------------------------------------
-- 2. Staff roles — Role table + User.roleId (Admin → Staff & Roles)
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 3. Course main category — CI Programs / IPA / AIU / MIT
-- -----------------------------------------------------------------------------

ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "mainCategory" TEXT DEFAULT 'CI Programs';

-- -----------------------------------------------------------------------------
-- 4. Page SEO — PageSeo table + 'page-seo' permission for Admin, Adminpower, Marketing
-- -----------------------------------------------------------------------------

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

UPDATE "Role"
   SET "permissions" = array_append(COALESCE("permissions", '{}'), 'page-seo'),
       "updatedAt"   = CURRENT_TIMESTAMP
 WHERE "name" IN ('Admin', 'Adminpower', 'Marketing')
   AND NOT ('page-seo' = ANY(COALESCE("permissions", '{}')));

-- -----------------------------------------------------------------------------
-- 5. Featured counsellors — "Show at top" (active trainers) for Admin → Manage Counsellors
-- -----------------------------------------------------------------------------

ALTER TABLE "Counselor" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Counselor_isFeatured_sNo_idx" ON "Counselor"("isFeatured", "sNo");

-- -----------------------------------------------------------------------------
-- 6. Page SEO imported from the old admin (admin.counselindia.com → Page SEO)
-- Same data as prisma/page-seo-data.json (also loaded by `npm run seed`).
-- Pages that already have SEO are left untouched.
-- -----------------------------------------------------------------------------

INSERT INTO "PageSeo" ("id", "path", "pageName", "metaTitle", "metaDescription", "metaKeywords", "ogImage", "noIndex", "noFollow", "updatedBy", "createdAt", "updatedAt")
SELECT
  'ps' || substr(md5(v.path || clock_timestamp()::text || random()::text), 1, 23),
  v.path, v.page_name, v.meta_title, v.meta_description, v.meta_keywords, v.og_image,
  false, false, 'Imported from old admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (VALUES
  ('/', 'Home', 'Get Best Psychology and Counselling Courses', 'Psychology courses at Counsel India offer expert-led training in mental health, counseling, and therapy helping you build a successful career in psychology.', 'psychology courses, RCI Certified trainers', 'https://admin.counselindia.com/project/public/seo/1697697710.jpeg'),
  ('/Har-Ghar-Counsellor', 'Har Ghar Counsellor', 'Har Ghar Counsellor | Mission to Promote Mental Health', 'Join Counsel India''s Har Ghar Counsellor initiative and be part of our mission to make mental health support accessible to every home. Learn more today!', 'har ghar counsellor', NULL),
  ('/about', 'About Us', 'E- learning platform for psychology & counselling | Counsel India', 'Counsel India is a practical online platform for psychology and counselling programs in India. Read more about Counsel India', 'careers in psychology, about psychology, counselling psychology, psychology online courses, can you tell me about counsel india', 'https://admin.counselindia.com/project/public/seo/1684995135.png'),
  ('/academic-policy', 'Academic Policy', 'Your Guide to Academic Policies at Counsel India', 'Our approach is straightforward and transparent, ensuring clarity and understanding for all students. Learn more about our policies today!', 'counsel india policy, ensuring clarity', NULL),
  ('/all-courses-list', 'All Courses', 'All Courses List - Find Your Path to Success with Counsel India', 'Counsel India offers Diploma, Certificate, Self-paced courses for Psychology, Counselling and Therapies. Get courses now Online psychology course', 'Online psychology course, E-learning psychology, Virtual psychology classes, psychology courses, Diploma in psychology, Certificate in psychology, best psychology course', 'https://admin.counselindia.com/project/public/seo/1697698199.jpeg'),
  ('/alumni', 'Alumni', 'Counsel India Alumni | Join the Community of Learners', 'Explore Counsel India''s Alumni to reconnect, network, and grow with a community of psychology professionals and graduates.', 'counsel india alumni', NULL),
  ('/ask-question', 'Ask a Question', 'Get Answers to Your Questions', 'Have questions about counselling, psychology, or personal growth? Get clarity and guidance on your journey to mental well-being today!', 'questions about counselling', NULL),
  ('/blog', 'Blog', 'Counsel India - Insights on Psychology and Counselling | Blog', 'Get informed insights and analysis on Psychology and Counselling with Counsel India blog. Learn about latest news, tutorials, concepts, career insights', 'Psychology  blogs, Counselling blogs, educational blogs', 'https://admin.counselindia.com/project/public/seo/1684995199.png'),
  ('/career', 'Career (old address)', 'Explore Exciting Opportunities', 'Explore the latest job vacancies in the field of counselling! Find your dream role in counseling today.', 'career, vacancies, counselling', NULL),
  ('/careers', 'Careers', 'Explore Exciting Opportunities', 'Explore the latest job vacancies in the field of counselling! Find your dream role in counseling today.', 'career, vacancies, counselling', NULL),
  ('/ci-business', 'CI for Business', 'Expert Mentorship for Your Business', 'Our counselling services provide personalized support for entrepreneurs, offering guidance, and strategies. Start your journey with our expert counselling today!', 'Expert Mentorship, entrepreneurs, personalized support, Mentorship', 'https://admin.counselindia.com/project/public/seo/1684995176.png'),
  ('/contact-us', 'Contact Us', 'Contact Us for Expert Psychology and Counseling Courses', 'Get in touch with Counsel India to inquire about our comprehensive psychology and counseling courses. Contact us today', 'psychology and counseling courses, mental health, Counsel India', 'https://admin.counselindia.com/project/public/seo/1698662424.png'),
  ('/counsellors-details/102', 'Gunjan Sandhani', 'Gunjan Sandhani - Clinical Psychologist and Counsellor in India', 'Meet Gunjan Sandhani, a highly skilled clinical psychologist and counsellor based in India. Schedule a session today.', 'Gunjan Sandhani, clinical psychologist, counsellor', NULL),
  ('/counsellors-details/13', 'Michelle Luis', 'Michelle Luis: Experienced Counselling Psychologist', 'Meet Michelle Luis, an experienced counselling psychologist at Counsel India.', 'Michelle Luis, counselling psychologist', NULL),
  ('/counsellors-details/135', 'SHWETA NAIR', 'Shweta Nair: Psychologist & Counsellor', 'Discover the expertise of Shweta Nair, a skilled psychologist and counsellor offering professional mental health support.', 'Shweta Nair, skilled psychologist, professional mental health', NULL),
  ('/counsellors-details/139', 'Bivek Pradhan', 'Bivek Pradhan: Experienced Psychologist & Counsellor', 'Meet Bivek Pradhan, a skilled psychologist and counsellor offering expert mental health support.', 'Bivek Pradhan, skilled psychologist, mental health support', NULL),
  ('/counsellors-details/14', 'Priyancy Goyal', 'Priyancy Goyal: Counselling Psychologist & Counsellor', 'Meet Priyancy Goyal, a seasoned counselling psychologist and counsellor at Counsel India. Schedule a session today.', 'Priyancy Goyal, counselling psychologist, counsellor at Counsel India', NULL),
  ('/counsellors-details/141', 'Sana Panagar', 'Sana Panagar: Psychologist & Counsellor at Counsel India', 'A seasoned psychologist and counsellor offering professional guidance at Counsel India.', 'counsellor offering, professional guidance, Counsel India', NULL),
  ('/counsellors-details/146', 'Atul Yadav', 'Atul Yadav: Experienced Counselling Psychologist & Counsellor', 'Discover the expertise of Atul Yadav, a seasoned counselling psychologist and committed counsellor.', 'Atul Yadav, counselling psychologist, committed counsellor', NULL),
  ('/counsellors-details/15', 'P Hanumanth Rao', 'P Hanumanth Rao: Career and Skill Counsellor | Counsel India', 'Meet P Hanumanth Rao, a seasoned career and skill counsellor at Counsel India. Book a session today!', 'P Hanumanth Rao, career and skill counsellor', NULL),
  ('/counsellors-details/152', 'VARNICA KOTNALA', 'Varnica Kotnala: Experienced Clinical Psychologist & Counsellor', 'Discover expert counseling services with Varnica Kotnala, a seasoned psychologist and counsellor.', 'Varnica Kotnala, counseling services, psychologist and counsellor', NULL),
  ('/counsellors-details/16', 'Yashasvini Rathore', 'Yashasvini Rathore: Career Counselor and Skill Trainer', 'Meet Yashasvini Rathore, a seasoned career counselor and skill trainer at Counsel India.', NULL, NULL),
  ('/counsellors-details/166', 'Aakriti Khosla', 'Aakriti Khosla - Psychologist & Counsellor', 'Aakriti Khosla, a skilled psychologist and counsellor, offers expert mental health services to help you navigate life''s challenges.', 'Aakriti Khosla, skilled psychologist and counsellor, mental health services', NULL),
  ('/counsellors-details/168', 'Shruti Mittal', 'Shruti Mittal: Art Therapist, Psychologist & Counsellor in India', 'Meet Shruti Mittal, a trusted psychologist and counsellor offering expert guidance and support in India.', 'Shruti Mittal, psychologist and counsellor, expert guidance', NULL),
  ('/counsellors-details/17', 'Kavya.C', 'Empower Your Future with Expert Career Counselling | Kavya.C', 'As a trusted career counsellor and psychologist, Kavya.C provides personalized guidance to help you navigate your career path with confidence and clarity.', 'career counsellor, Kavya.C provides personalized guidance, career path with confidence', NULL),
  ('/counsellors-details/170', 'Nazima Sayyed', 'Nazima Sayyed: Experienced Psychologist and Counsellor', 'Nazima Sayyed is an experienced psychologist and counsellor offering professional mental health support and guidance.', 'Nazima Sayyed, psychologist and counsellor, mental health support', NULL),
  ('/counsellors-details/171', 'Glory Bhatia', 'Glory Bhatia: Experienced Psychologist and Counsellor', 'Discover the expertise of Glory Bhatia, a trusted psychologist and counsellor. Schedule a session now.', NULL, NULL),
  ('/counsellors-details/177', 'Jeemol.P.Bejoy', 'Jeemol P. Bejoy: Experienced Psychologist and Counselor', 'Meet Jeemol P. Bejoy, offering professional counselling services. With years of experience, she provides personalized support for mental health', 'Jeemol P. Bejoy, professional counselling services, personalized support', NULL),
  ('/counsellors-details/179', 'Mohita Aggarwal', 'Mohita Aggarwal: Experienced Psychologist & Counsellor', 'Meet Mohita Aggarwal, a seasoned psychologist and counsellor offering expert therapy services. Contact Mohita today for personalized counselling sessions.', 'Mohita Aggarwal, psychologist and counsellor, expert therapy services, personalized counselling sessions', NULL),
  ('/counsellors-details/18', 'Ayushi Madaan', 'Ayushi Madaan: Experienced Clinical Psychologist & Counsellor', 'Explore the expertise of Ayushi Madaan, a seasoned clinical psychologist and skilled counsellor.', 'Ayushi Madaan, seasoned clinical psychologist, skilled counsellor', NULL),
  ('/counsellors-details/19', 'Anastasiia Maksymovska', 'Online Psychology Courses & Therapy | Counsel India|', 'Renowned Psychologist, Psychotherapist & Sexologist. Trusted Counsel India expert offering comprehensive counseling services.', 'psychologist, sexologist, counselling services, Anastasiia counsellor', NULL),
  ('/counsellors-details/191', 'Sarita Shukla', 'Sarita Shukla | Psychologist Counsellor', 'Meet Sarita Shukla, a dedicated psychologist counsellor specializing in mental wellness.', 'Sarita Shukla, psychologist counsellor, mental wellness', NULL),
  ('/counsellors-details/199', 'Tamanna Grewal', 'Experienced Psychologist & Counsellor at Counsel India', 'A dedicated psychologist and counsellor at Counsel India, offering expert guidance for emotional wellness and personal growth', 'dedicated psychologist, counsellor, guidance for emotional wellness, personal growth, Experienced Psychologist', NULL),
  ('/counsellors-details/20', 'Darline Gonzalez', 'Darline Gonzalez: Experienced Psychologist & Counsellor', 'Meet Darline Gonzalez, a seasoned psychologist and counsellor providing expert mental health support.', 'Darline Gonzalez, psychologist and counsellor, mental health support', NULL),
  ('/counsellors-details/202', 'Arpita Chatterjee', 'Experienced Music Therapist at Counsel India', 'A skilled music therapist at Counsel India. Explore emotional healing and well-being through personalized musical journeys.', 'skilled music, therapist, Explore emotiona, personalized musical journeys, Therapist at Counsel India', NULL),
  ('/counsellors-details/203', 'Durga Gupta', 'Experienced Psychologist & Counsellor at Counsel India', 'A trusted psychologist and counsellor at Counsel India. Offering expert guidance for emotional well-being and personal growth', 'psychologist, counsellor at Counsel India, expert guidance, emotional well-being, Experienced Psychologist', NULL),
  ('/counsellors-details/204', 'Sakshi Makkar', 'Expert Psychologist & Counsellor at Counsel India', 'A trusted psychologist and counsellor at Counsel India. Offering compassionate guidance and support for mental well-being', 'trusted psychologist, counsellor, compassionate guidance, mental well-being, Psychologist', NULL),
  ('/counsellors-details/207', 'Kriti Kamal', 'Experienced Psychologist & Counsellor in India', 'A trusted psychologist and counsellor at Counsel India. With years of expertise, she offers compassionate guidance for mental wellness', 'Experienced Psychologist, counsellor, compassionate guidance, mental wellness, emotional healing', NULL),
  ('/counsellors-details/213', 'Nivedita Sharma', 'Psychologist at Counsel India | Expert Mental Health Services', 'A dedicated psychologist at Counsel India, offering expert mental health services.', 'Counsel India, dedicated psychologist, health services', NULL),
  ('/counsellors-details/220', 'Lauren Michelle Colletti', 'Lauren Michelle Colletti - Psychologist & Counsellor', 'Meet Lauren Michelle Colletti, a highly experienced psychologist and counsellor. Connect with Lauren for personalized mental health care today.', 'Lauren Michelle Colletti, personalized mental health', NULL),
  ('/counsellors-details/227', 'ADITI GUPTA', 'Psychologist at Counsel India | Mental Health Expert', 'A seasoned psychologist at Counsel India, offering expert guidance and support for mental health challenges.', 'seasoned psychologist, expert guidance, mental health challenges', NULL),
  ('/counsellors-details/228', 'Aastha Khatter', 'Expert Psychologist | Transforming Lives Through Therapy', 'A dedicated psychologist offering compassionate therapy to help you overcome challenges and achieve mental well-being. Schedule a session today.', 'Expert Psychologist, Transforming Lives, psychologist, session, overcome challenges', NULL),
  ('/counsellors-details/229', 'Komal', 'Expert Psychologist & Counsellor Services | Counsel India', 'A trusted psychologist and counsellor at Counsel India. Get personalized support and therapy for your mental well-being. Book your session now!', 'trusted psychologist, personalized support, mental well-being', NULL),
  ('/counsellors-details/23', 'Ms. Monica', 'Ms. Monica: Experienced Counselling Psychologist', 'Meet Ms. Monica, a seasoned counselling psychologist at Counsel India.', 'Ms. Monica, counselling psychologist', NULL),
  ('/counsellors-details/232', 'Himanshu Malik', 'Experienced Psychologist | Expert Counseling Services | Counsel India', 'A seasoned psychologist offering expert counseling services. He specializes in providing personalized therapy to help you overcome life''s challenges', 'Experienced Psychologist, Expert, Counseling Services', NULL),
  ('/counsellors-details/233', 'Ananya Dewan', 'Experienced Psychologist at Counsel India', 'A seasoned psychologist at Counsel India. Ananya provides compassionate and effective therapy services to individuals seeking support.', 'psychologist, compassionate, effective therapy, individuals seeking support', NULL),
  ('/counsellors-details/234', 'Smriti Jain', 'Smriti Jain | Psychologist & Mental Health Expert | Counsel India', 'A dedicated psychologist specializing in mental health. Smriti helps individuals overcome challenges and achieve emotional well-being.', 'Smriti Jain, Mental Health Expert, dedicated psychologist, individuals overcome', NULL),
  ('/counsellors-details/238', 'Shelly Ahuja', 'Experienced Psychologist Offering Expert Mental Health Services', 'A seasoned psychologist dedicated to providing professional mental health services. Shelly offers personalized counselling and therapy.', 'Expert Mental Health, Experienced Psychologist, personalized counselling', NULL),
  ('/counsellors-details/239', 'Nida M P', 'Expert Psychologist & Counsellor at Counsel India', 'A trusted psychologist and counsellor at Counsel India. With expertise in emotional wellness, she offers compassionate support and guidance.', 'trusted psychologist, Counsel India, emotional wellness, support and guidance', NULL),
  ('/counsellors-details/24', 'Medhavi Sood', 'Medhavi Sood: Experienced Clinical Psychologist & Counsellor', 'Meet Medhavi Sood, a skilled clinical psychologist and counsellor at Counsel India.', 'Medhavi Sood, clinical psychologist', NULL),
  ('/counsellors-details/240', 'SHAGUN BHARDWAJ', 'Experienced Psychologist & Counsellor at Counsel India', 'A trusted psychologist and counsellor at Counsel India. Expert in emotional well-being, she offers compassionate guidance for a brighter tomorrow.', 'psychologist, counsellor at Counsel India, emotional well-being, guidance, Experienced Psychologist', NULL),
  ('/counsellors-details/241', 'Vaibhav Jain', 'Experienced Psychologist Offering Expert Mental Health Support', 'A trusted psychologist with years of experience providing compassionate mental health care.', 'Mental Health Support, personal counselling, compassionate', NULL),
  ('/counsellors-details/25', 'Rashmi Soin', 'Rashmi Soin: Parent Coach & Counselling Psychologist', 'Meet Rashmi Soin, a seasoned parent coach and counselling psychologist at Counsel India.', 'Rashmi Soin, parent coach, counselling psychologist', NULL),
  ('/counsellors-details/250', 'Shivangi Srivastava', 'Experienced Psychologist and Counsellor at Counsel India', 'Meet Shivangi Srivastava, a seasoned psychologist and counsellor offering expert guidance and support.', 'Shivangi Srivastava, psychologist and counsellor, expert guidance', NULL),
  ('/counsellors-details/258', 'SHREYA NAYAK', 'Shreya Nayak | Psychologist Counsellor| Mental Health Expert', 'Meet Shreya Nayak, a trusted psychologist counsellor offering expert guidance and support.', 'Shreya Nayak, psychologist counsellor, guidance and support', NULL),
  ('/counsellors-details/259', 'Anjali Seth', 'Anjali Seth | Psychologist & Counsellor | Expert in Mental Health', 'Meet Anjali Seth, a dedicated psychologist and counsellor specializing in providing expert mental health support.', 'Anjali Seth, dedicated psychologist, expert mental health support', NULL),
  ('/counsellors-details/26', 'Jyoti S Sharma', 'Jyoti S Sharma: Experienced Music Therapist & Counselor', 'Meet Jyoti S Sharma, an accomplished music therapist and counsellor at Counsel India.', 'Jyoti S Sharma, music therapist, counsellor at Counsel India', NULL),
  ('/counsellors-details/263', 'Aqsa Qayyum', 'Expert Psychologist & Counsellor at Counsel India', 'A seasoned psychologist and counsellor at Counsel India, offering compassionate guidance and professional therapy services tailored to your needs.', 'Counsel India, compassionate guidance, professional', NULL),
  ('/counsellors-details/265', 'Capt Purba Panchbhai (Retd)', 'Psychologist & Counsellor | Counsel India', 'A seasoned psychologist and counsellor at Counsel India. Capt Purba offers expert guidance and support for mental well-being. Book a session today.', 'Capt Purba, guidance and support, mental well-being', NULL),
  ('/counsellors-details/266', 'Apurva Sharma', 'Experienced Psychologist & Counsellor at Counsel India', 'A seasoned psychologist and counsellor at Counsel India. Apurva provides compassionate therapy and guidance to help with challenges effectively.', 'counsellor at Counsel India, Apurva provides compassionate therapy, challenges effectively', NULL),
  ('/counsellors-details/267', 'Tanya Bansal', 'Expert Psychologist & Counsellor | Counsel India', 'A seasoned psychologist and skilled counsellor at Counsel India. Get support for mental well-being with Tanya''s compassionate approach.', 'seasoned psychologist, skilled counsellor, mental well-being, compassionate approach', NULL),
  ('/counsellors-details/269', 'Sweta A. Gorania', 'Sweta A. Gorania - Psychologist and Counsellor|Expert Guidance', 'Sweta provides personalized support to help you navigate life''s challenges effectively. Schedule a consultation today.', 'Sweta, personalized support, life''s challenges', NULL),
  ('/counsellors-details/27', 'Radhika Gulati', 'Radhika Gulati: Experienced Clinical Psychologist & Counsellor', 'Meet Radhika Gulati, a seasoned clinical psychologist and counsellor at Counsel India.', 'Radhika Gulati, clinical psychologist', NULL),
  ('/counsellors-details/270', 'Tanya Chadha', 'Experienced Psychologist and Counsellor at Counsel India', 'A seasoned psychologist and counsellor at Counsel India. Tanya offers compassionate guidance and support to individuals seeking mental health services.', 'Tanya offers, individuals seeking, seeking mental health services, Counsel India', NULL),
  ('/counsellors-details/272', 'Simran Parekh', 'Psychologist & Counsellor at Counsel India', 'A skilled psychologist and counsellor at Counsel India, offering expert mental health services.', 'psychologist, Counsel India, mental health', NULL),
  ('/counsellors-details/278', 'Sneha Gulati', 'Experienced Psychologist & Counsellor| Counsel India', 'Meet Sneha Gulati, a highly skilled psychologist and counsellor providing expert mental health support. Schedule a session today!', 'Sneha Gulati, skilled psychologist and counsellor, expert mental health support', NULL),
  ('/counsellors-details/279', 'Pragya Singh', 'Pragya Singh | Psychologist & Counsellor | Expert Guidance', 'Meet Pragya Singh, a trusted psychologist and counsellor providing expert guidance for individuals seeking support.', 'Pragya Singh, psychologist and counsellor, seeking support', NULL),
  ('/counsellors-details/281', 'Akshaya Devi', 'Akshaya Devi - Psychologist and Counsellor', 'Meet Akshaya Devi, a dedicated psychologist. Schedule a session today!', 'Akshaya Devi, dedicated psychologist', NULL),
  ('/counsellors-details/282', 'Priyanka pathak', 'Priyanka Pathak: Psychologist & Counsellor in India', 'Meet Priyanka Pathak, a trusted psychologist and counsellor offering expert mental health support in India.', 'Priyanka Pathak, trusted psychologist, expert mental health', NULL),
  ('/counsellors-details/289', 'Deepshikha Mishra', 'Experienced Psychologist & Counsellor | Counsel India', 'A seasoned psychologist and counsellor offering expert guidance at Counsel India. Book a session today!', 'counsellor offering, guidance at Counsel India, seasoned psychologist', NULL),
  ('/counsellors-details/290', 'Kanishka Agrawal', 'Experienced Psychologist & Counsellor at Counsel India', 'A seasoned psychologist and compassionate counsellor at Counsel India. Book a session today.', 'seasoned psychologist, counsellor at Counsel India', NULL),
  ('/counsellors-details/292', 'Rishabh Singh Sengar', 'Rishabh Singh Sengar: Expert Psychologist & Counsellor in India', 'Meet Rishabh Singh Sengar, a trusted psychologist and counsellor offering professional services in India.', 'Rishabh Singh Sengar, psychologist and counsellor, professional services', NULL),
  ('/counsellors-details/30', 'Pooja S. Naragachche', 'Pooja S. Naragachche - Experienced Counselling Therapist', 'Meet Pooja S. Naragachche, a skilled and compassionate therapist specializing in counselling therapy at Counsel India.', 'Pooja S. Naragachche, therapist specializing', NULL),
  ('/counsellors-details/300', 'Soumitri Bag Majumder', 'Expert Psychologist & Counsellor | Counsel India', 'A trusted psychologist and counsellor at Counsel India. Get expert support and guidance for your mental health journey.', 'trusted psychologist, Counsel India, support and guidance, mental health journey', NULL),
  ('/counsellors-details/31', 'Nupur Gupta', 'Nupur Gupta: Experienced Clinical Psychologist & Counsellor', 'Meet Nupur Gupta, a seasoned clinical psychologist and counsellor, offering expert guidance and support for mental health challenges.', 'Nupur Gupta, clinical psychologist, mental health challenges', NULL),
  ('/counsellors-details/315', 'Dr.Niharika Ghosh', 'Experienced Psychologist & Counsellor | Counsel India', 'A seasoned psychologist and counsellor offering compassionate guidance and support.', 'counsellor, compassionate guidance', NULL),
  ('/counsellors-details/33', 'Aanchal Harjai', 'Aanchal Harjai: Clinical Psychologist and Counsellor', 'Meet Aanchal Harjai, a seasoned clinical psychologist and counsellor at Counsel India. Schedule a session today.', 'Aanchal Harjai, clinical psychologist, Counsel India', NULL),
  ('/counsellors-details/76', 'Gunjan Joshi', 'Gunjan Joshi | Psychologist and Counsellor', 'Meet Gunjan Joshi, a skilled psychologist and counsellor dedicated to providing effective mental health support. Explore her expertise and services today.', 'Gunjan Joshi, killed psychologist, mental health support', NULL),
  ('/counsellors-network', 'Counsellors Network', 'India Best Counsellors | Counsel India', 'Get the best counsellors in India at Counsel India.', 'Best Counsellors', 'https://admin.counselindia.com/project/public/seo/1684995068.png'),
  ('/course/advance-certification-in-industrial-organizational-psychology', 'Advance Certification in Industrial Organizational Psychology', 'Advance Certification in Industrial-Organizational Psychology | Counsel India', 'Boost your career with Counsel India''s advanced certification in industrial-organizational psychology. Learn about the interactions between people at work, human behavior, and organizational efficiency. Join Now', 'ounsel India, advanced certification, industrial-organizational, psychology, organizational efficiency, human behavior', NULL),
  ('/course/advanced-certificate-in-career-counselling', 'Advanced Certificate in Career Counselling', 'Advanced Certificate in Career Counselling Programs', 'Earn your Advanced Certificate in Career Counselling with CounselIndia''s comprehensive program. Equip yourself with the skills', 'Career, Counselling, CounselIndia, Advanced Certificate', NULL),
  ('/course/advanced-certificate-in-child-psychology', 'Advanced Certificate in Child Psychology', 'Advanced Certificate in Child Psychology | Counsel India', 'Explore the dynamics of child psychology with our Advanced Certificate in Child Psychology course.', 'child psychology, Advanced, Certificate, Child Psychology course', NULL),
  ('/course/advanced-certificate-in-counselling-psychotherapy', 'Advanced Certificate in Counselling & Psychotherapy', 'Advanced Certificate in Counselling & Psychotherapy', 'Earn your Advanced Certificate in Counselling & Psychotherapy with Counsel India.', 'Advanced Certificate, Counselling, Psychotherapy, Counsel India', NULL),
  ('/course/advanced-certificate-in-industrial-organizational-psychology', 'Advanced Certificate in Industrial-Organizational Psychology', 'Advanced Certificate in Industrial-Organizational Psychology', 'Enhance your professional journey with our Advanced Certificate in Industrial-Organizational Psychology. Gain valuable skills to thrive in the workplace.', 'Industrial-Organizational, Psychology, Advanced Certificate, professional journey', NULL),
  ('/course/advanced-certificate-in-life-coaching', 'Advanced Certificate in Life Coaching', 'Advanced Certificate in Life Coaching Course | Counsel India', 'Earn your Advanced Certificate in Advanced Certificate in Life Coaching with Counsel India.', 'Advanced Certificate, Life Coaching, Coaching, Counsel India', NULL),
  ('/course/business-growth-master-course', 'Business Growth Master Course', 'Accelerate Your Success with Business Growth Master Course', 'Learn essential strategies, innovative techniques, and gain insights to drive sustainable growth. Enroll today to take your business to the next level!', 'business, business growth, psychology, master course', NULL),
  ('/course/certificate-in-career-counselling', 'Certificate in Career Counselling', 'Certificate in Career Counselling Course | Counsel India', 'Begin your career with our comprehensive Certificate in Career Counselling Program at Counsel India. Gain valuable skills and insights to guide individuals', 'Certificate in Career Counselling, career, Counselling Program, Counsel India', NULL),
  ('/course/certificate-in-child-psychology', 'Certificate in Child Psychology', 'Certificate in Child Psychology Program | Enroll Today', 'Explore our Certificate in Child Psychology course to deepen your insights into child development and behavior.', 'Certificate in Child Psychology, Child, child development and behavior', 'https://admin.counselindia.com/project/public/seo/1684994444.jpg'),
  ('/course/certificate-in-counselling-psychology', 'Certificate in Counselling Psychology', 'Certificate in Counselling Psychology | Counsel India', 'Onboard a transformative journey with our Certificate in Counselling Psychology Program at Counsel India.', 'Certificate in Counselling Psychology Program, Counselling Psychology, transformative journey', NULL),
  ('/course/certificate-in-mindful-living', 'Certificate in Mindful Living', 'Certificate in Mindful Living Course | Counsel India', 'Join Counsel India for our Certificate in Mindful Living course. Enhance your life with mindfulness techniques for inner peace and balance. Enroll now', 'Certificate, Mindful Living course, mindfulnes, Certificate in Mindful Living Course', NULL),
  ('/course/counselling-master-course-advanced', 'Counselling Master Course – Advanced', 'Master Advanced Counselling Techniques with Counsel India', 'Understand specialized methodologies, enhance your skills, and empower yourself to support clients effectively.', 'counselling techniques, counselling, counselling course, psychology', 'https://admin.counselindia.com/project/public/seo/1684994681.jpg'),
  ('/course/counselling-master-course-foundation', 'Counselling Master Course – Foundation', 'Counsel India | Master Course in Counselling: Foundation Level', 'Join Counsel India for a transformative Master Course in Counselling at the Foundation Level.', 'counselling, career in counselling, Counselling - Foundation Level, Master Course in Counselling, Counsel India', 'https://admin.counselindia.com/project/public/seo/1698907302.jpeg'),
  ('/course/counselling-master-course-intermediate', 'Counselling Master Course – Intermediate', 'Intermediate Counselling Master Course', 'Explore key concepts, practical techniques, and gain confidence in supporting individuals through their challenges.', 'counselling, counselling master course, psychology, psychology courses', 'https://admin.counselindia.com/project/public/seo/1698918875.jpg'),
  ('/course/counsellor-entrepreneurship-program', 'Counsellor Entrepreneurship Program', 'Counsellor''s Entrepreneurship Program', 'Gain essential skills in marketing, client management, and financial strategies. Enroll now to turn your passion into a successful venture!', 'entrepreneurship, business, psychology, mental health, client management', 'https://admin.counselindia.com/project/public/seo/1684994802.jpg'),
  ('/course/diploma-in-child-psychology-parenting', 'Diploma in Child Psychology and Parenting', 'Diploma in Child Psychology & Parenting | Counsel India', 'This program gives you the essential skills to support child development and effective parenting. Enroll now to make a positive impact!', 'Child Psychology, Parenting, Diploma in Child Psychology, Psychlogy, Counsel India', NULL),
  ('/course/diploma-in-industrial-organizational-psychology', 'Diploma in Industrial-Organizational Psychology', 'Diploma in Industrial-Organizational Psychology | Counsel India', 'This program offers comprehensive training in workplace behavior and organizational development. Gain valuable skills for the modern workforce.', 'Industrial-organizational psychology, diploma in industrial-organizational psychology, counsel india, psychology', NULL),
  ('/course/masters-in-child-psychology-work-integrated-skill-based-program)', 'M.A. in Child Psychology and Developmental Psychology', 'Earn an MA in Child Psychology | UGC-Recognized Course', 'Pursue an MA in Child Psychology with Counsel India in partnership with Galgotias University.', 'MA in Child Psychology, UGC apporoved course, child psychology, MA in psychology, galgotia university', NULL),
  ('/course/masters-in-industrial-organizational-psychology', 'Masters in Industrial & Organizational Psychology', 'Master''s in Industrial-Organizational Psychology | Counsel India', 'Pursue a Master''s in Industrial-Organizational Psychology with Counsel India. Develop expertise in the growing field of organizational behavior.', 'Industrial-Organizational Psychology, Counsel India, organizational, behavior, psychology, Master''s in Industrial-Organizational Psychology', NULL),
  ('/course/masters-in-psychology-work-integrated-skill-based-program', 'M.A. in Psychology', 'MA in Psychology | Explore Human Behavior', 'Prepare for a rewarding career in counselling, organizational behavior, and more.', 'MA in Psychology, Explore Human Behavior', NULL),
  ('/course/mba-in-entrepreneurial-psychology', 'MBA in Entrepreneurial Psychology', 'MBA in Entrepreneurial Psychology | Counsel India', 'Combine business strategy with human behavior with our MBA in Entrepreneurial Psychology program for a unique mix of insight and innovation.', 'Entrepreneurial Psychology, business strategy, MBA', NULL),
  ('/course/pg-diploma-in-counselling-psychology-clinical-skills', 'PG Diploma in Counselling Psychology and Clinical Skills', 'PG Diploma in Counselling Psychology & Clinical Skills', 'This program offers comprehensive training in therapeutic techniques and clinical practice. Enroll now to upskill in your career in counselling psychology.', 'counselling psychology, clinical skills', NULL),
  ('/course/pg-diploma-in-guidance-and-counselling', 'PG Diploma in Guidance and Counselling', 'PG Diploma in Guidance and Counselling - Counsel India', 'PG Diploma in Guidance and Counselling with Counsel India. Our program is designed to provide you skills and knowledge to become a successful counsellor.', 'guidance and counselling, PG Diplom, Counselling knowledge, Counselling skills, diploma in counselling psychology, diploma in guidance and counselling, pg diploma in guidance and counselling, best pg diploma course, best pg diploma course in india', 'https://admin.counselindia.com/project/public/seo/1684994917.jpg'),
  ('/course/pg-diploma-in-guidance-counselling', 'PG Diploma in Guidance & Counselling', 'PG Diploma in Guidance & Counselling | Counsel India', 'This program provides intensive training to excel in educational and personal counselling. Become a skilled counsellor today!', 'PG Diploma, Guidance & Counselling, Psychology, Counsel India', NULL),
  ('/course/post-graduate-diploma-in-child-psychology-development', 'Post Graduate Diploma in Child Psychology & Development', 'PG Diploma in Child Psychology & Development | Counsel India', 'Develop the skills for understanding young minds with our PG Diploma in Child Psychology & Development.', 'PG Diploma, Counselling Psychology, Clinical Skills', NULL),
  ('/course/post-graduate-diploma-in-counselling-and-psychotherapy', 'Post Graduate Diploma in Counselling and Psychotherapy', 'PG Diploma in Counselling and Psychotherapy | Counsel India', 'Redefine success with our specialized PG Diploma in Counselling & Psychotherapy. Become a changemaker with the right skills.', 'PG, Diploma, Counselling, Psychotherapy, PG Diploma, Counsel India', NULL),
  ('/course/post-graduate-diploma-in-guidance-counselling', 'Post Graduate Diploma in Guidance & Counselling', 'PG Diploma in Guidance & Counselling | Counsel India', 'Build the right skills to make an impact in people''s lives with our specialized PG Diploma in Guidance & Counselling.', 'PG Diploma, Guidance, Counselling, necessary skills, counselindia', NULL),
  ('/course/post-graduate-diploma-in-industrial-and-organisational-psychology', 'Post Graduate Diploma in Industrial and Organisational Psychology', 'PG Diploma in Industrial and Organizational Psychology', 'Grow your career with our PG Diploma in Industrial & Organizational Psychology.', 'PG, Diploma, Industrial & Organizational, Psychology, PG Diploma', NULL),
  ('/course/post-graduate-diploma-in-life-coaching', 'Post Graduate Diploma in Life Coaching', 'Post Graduate Diploma in Life Coaching | Counsel India', 'Boost your career trajectory with our specialized Post Graduate Diploma in Life Coaching at Counsel India.', 'career, Post Graduate, Diploma in Life Coaching, Counsel India', NULL),
  ('/course/professional-diploma-in-career-counselling', 'Professional Diploma in Career Counselling', 'Professional Diploma in Career Counselling | Counsel India', 'Explore our comprehensive Professional Diploma in Career Counselling at Counsel India. Gain expertise in guiding individuals towards fulfilling careers.', 'Career, Counselling, Counsel India, Professional Diploma', NULL),
  ('/course/psychology-for-everyday-life', 'Psychology for Everyday Life', 'Psychology for Everyday Life | Online Course by Counsel India', 'Explore the fascinating world of psychology in everyday life with Counsel India''s online course. Enhance your understanding of human behavior. Join now', 'psychology, everyday life, online course, human behavior, emotions, cognition, mental well-being, interpersonal relationships, self-discovery, personal growth', NULL),
  ('/course/psychology-for-professional-success', 'Certification in Psychology for Professional Success', 'Psychology for Professional Success - Counsel India', 'Tap into your strengths with Counsel India''s Certification in Psychology for Professional Success. Enroll now and take the first step towards a brighter future!', 'Certification in Psychology', NULL),
  ('/course/psychology-internship-clinical-psychology', 'Psychology Internship (Clinical Psychology)', 'Psychology Internship | Clinical Psychology | Counsel India', 'Gain hands-on experience in clinical psychology with our psychology internship program.', 'psychology internship, clinical psychology internship, treatment', 'https://admin.counselindia.com/project/public/seo/1684994633.jpg'),
  ('/course/psychology-internship-industrial-psychology', 'Psychology Internship (Industrial Psychology)', 'Psychology Internship in Industrial Psychology | Counsel India', 'Join our psychology internship program in industrial psychology to gain practical experience and enhance your skills. Explore more with our expert mentors', 'psychology internship, industrial psychology, practical experience, skill enhancement, industrial psychology program, expert mentors, online internship', 'https://admin.counselindia.com/project/public/seo/1684994878.jpg'),
  ('/course/therapy-master-course', 'Therapy Master Course', 'Therapy Master Course | Transform Lives with Counsel India', 'Enroll in Counsel India’s Therapy Master Course and gain the skills to become a certified therapist.', 'Therapy Master Course', 'https://admin.counselindia.com/project/public/seo/1684994940.jpg'),
  ('/ebook', 'E-book', 'Counsel India | Free Counselling and Psychology eBooks', 'Explore our library of free eBooks on counselling and psychology subjects. Counsel India provides eBooks on anxiety, depression and other topics.', 'eBooks, psychology ebooks, counseling ebooks, psychology subjects, anxiety, depression, depression ebooks', 'https://admin.counselindia.com/project/public/seo/1684994960.jpg'),
  ('/eligibility-test', 'Eligibility Test', 'Take a Free Personality Test Online | Counsel India', 'Discover your true self with our free online personality test. Get detailed analysis into your personality traits, strengths, and weaknesses.', 'personality test quiz, personality test, online personality test, free personality test, personality traits, self-discovery, my personality test, personality test for career', 'https://admin.counselindia.com/project/public/seo/1684995223.png'),
  ('/events', 'Events & Workshops', 'Discover Exciting Mental-Health Events for Personal Growth', 'Join us for insightful workshops, supportive gatherings, and transformative sessions focused on guiding you towards a happier, healthier life.', 'transformative, supportive, happier, workshop, events', 'https://admin.counselindia.com/project/public/seo/1684995243.png'),
  ('/events/emotional-wellbeing-and-happiness', 'Unlocking Emotional Wellbeing and Finding Happiness', 'Unlocking Emotional Wellbeing and Finding Happiness | Join our Bootcamp', 'Join our insightful event on emotional wellbeing and happiness, hosted by Counsel India. Explore expert advice and practical tips to enhance your mental health and lead a happier, more fulfilling life', 'bootcamp, events, workshop, counsel india workshop, counselindia event, counselindia bootcamp', NULL),
  ('/events/how-to-grow-as-a-counsellor-and-earn-50k-month', 'Grow as a Counsellor & Earn 50k Monthly!', 'Grow as a Counsellor & Earn 50k Monthly!', 'Learn how to develop your skills, attract clients, and increase your income to reach 50k a month as a successful counsellor.', 'successfull', NULL),
  ('/events/manage-your-day-to-day-life', 'Work-Life Balance Workshop', 'Work-Life Balance Workshop', 'Join our workshop focused on achieving balance between work and life.', 'workshop, work life balance', NULL),
  ('/events/mega-offline-event-roadmap-to-become-a-successful-counselor-5x-your-earning', 'Expert Counselling Roadmap for 5x Earnings', 'Expert Counselling Roadmap for 5x Earnings', 'Our expert-guided roadmap equips you with the skills and strategies to become a highly successful counsellor, boosting your earnings fivefold.', 'roadmap, successful counsellor, equips', NULL),
  ('/events/start-your-career-in-psychology-5x-your-growth', 'Start Your Psychology Career and Multiply Your Growth', 'Start Your Psychology Career and Multiply Your Growth', 'Achieve 5x growth potential with expert guidance, practical skills, and personalized mentorship. Explore Counsel India for a thriving career ahead.', 'potential, mentorship, giudance, practical skills', NULL),
  ('/events/step-by-step-process-to-become-counsellor-and-earn-at-least-7-lpa', 'Learn How to Become a Counselor and Earn 7 LPA!', 'Learn How to Become a Counselor and Earn 7 LPA!', 'Discover the step-by-step guide to becoming a counsellor, build a rewarding career while earning up to 7 LPA.', 'workshop, step by step, counsellor', NULL),
  ('/faqs', 'FAQs', 'Ask Anything! Your Questions Answered Here at Counsel India', 'Got questions? Explore a range of topics and ask anything on Counsel India''s ''Ask a Question'' section. Expert responses await!', 'FAQ, questions, ask a question', NULL),
  ('/membership', 'Membership', 'Join Our Family: Explore Membership Benefits Today!', 'Discover exclusive perks, community support, and exciting resources with our membership.', 'membership, community support', 'https://admin.counselindia.com/project/public/seo/1684995161.png'),
  ('/mentalhealthtest', 'Mental Health Tests', 'Mental Health Test - Assess Your Well-being with Counsel India', 'Counsel India''s test helps you understand your mental state and offers guidance for better mental health. Start your journey towards mental wellness today!', 'Mental health test, personality test', NULL),
  ('/mentor-registration', 'Mentor Registration', 'Join Our Mentor Network - Register as a Mentor | Counsel India', 'Become a part of our compassionate counselling team. Register as a counsellor today and make a difference in the lives of many.', 'register, counsellor, part', NULL),
  ('/news', 'News & Media', 'Stay Updated with Latest News and Media Coverage!', 'Explore the latest news, updates, and media coverage of Counsel India''s initiatives, programs, and events.', 'latest news, media coverage of Counsel India', NULL),
  ('/newsletter', 'Newsletter', 'Stay Informed with Counsel India''s Newsletter', 'Sign up for Counsel India''s newsletter to receive valuable insights, tips, and updates straight to your inbox.', 'Counsel India''s newsletter, valuable insights, straight to your inbox', NULL),
  ('/privacy-policy', 'Privacy Policy', 'Privacy Policy: Your Data, Your Trust.', 'Our Privacy Policy outlines how we safeguard your data and maintain your trust.', 'privacy policy, data, safeguard', NULL),
  ('/refer-and-earn', 'Refer and Earn', 'Refer and Earn | Get Rewarded for Referring Friends to Counsel India', 'Join Counsel India''s Refer and Earn program and earn rewards for every friend you refer. Get started now and share the benefits of our courses with your friends', 'Referring Friends, courses, Counsel India, program and earn rewards', NULL),
  ('/refund-policy', 'Refund Policy', 'Our Refund Policy: our commitment to transparency', 'We''re committed to providing a hassle-free experience when it comes to refunds.', NULL, NULL),
  ('/success-stories', 'Success Stories', 'Success Stories: True Stories, Real Inspirations', 'Explore our collection of inspiring success stories from individuals who have thrived with our services.', 'Success Stories, inspiring, services', NULL),
  ('/support', 'Support', 'Counsel India Learner Support', 'Welcome to the top-tier support services provided by Counsel India. Our expert team is here to assist you with a range of solutions to meet your needs.', 'support, solution', NULL),
  ('/terms-and-conditions', 'Terms & Conditions', 'Understand Your Rights: Counsel India''s Terms and Conditions', 'Discover the rules and guidelines governing your use of Counsel India''s services in plain, easy-to-understand language.', 'terms and condition, Counsel India', NULL)
) AS v(path, page_name, meta_title, meta_description, meta_keywords, og_image)
ON CONFLICT ("path") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 7. AboutMember — Core Team, Advisors & Consultants (Admin → Team & Advisors)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "AboutMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "image" TEXT,
    "category" TEXT NOT NULL DEFAULT 'core',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AboutMember_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AboutMember_category_isActive_order_idx" ON "AboutMember"("category", "isActive", "order");

-- Seed default team members if table is empty
INSERT INTO "AboutMember" ("id", "name", "designation", "image", "category", "order", "isActive", "createdAt", "updatedAt")
VALUES
  ('seed-core-1', 'Sapna Singh', 'Finance Associate', 'https://prod-s3.counselindia.com/meet_our_team/sapna%20finance%20photo_1756911088.jpeg', 'core', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-core-2', 'Shubham Sharma', 'Sr. Manager - Business Development & Operations', 'https://prod-s3.counselindia.com/meet_our_team/shubham_1753159155.jpeg', 'core', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-core-3', 'Deepanjali Soni', 'Assistant HR Manager', 'https://prod-s3.counselindia.com/meet_our_team/deepanjali_1753159327.jpeg', 'core', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-core-4', 'Rocky Bhati', 'Compliance Officer', 'https://prod-s3.counselindia.com/meet_our_team/rocky_1753159466.jpeg', 'core', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-core-5', 'Shubham', 'Marketing Manager', 'https://prod-s3.counselindia.com/meet_our_team/shubham.jpg', 'core', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-adv-1', 'Prem sir', 'Strategic Advisor', NULL, 'advisor', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-adv-2', 'Sajal sir', 'Growth & Business Advisor', NULL, 'advisor', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-adv-3', 'Ayush Sir', 'Advisory Board Member', NULL, 'advisor', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-cons-1', 'Nitin Dev Purohit', 'Consultant and Management Lawyer', 'https://prod-s3.counselindia.com/meet_our_team/3_1716458706.jpeg', 'consultant', 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-cons-2', 'Nitya Bansal', 'Legal Consultant', 'https://prod-s3.counselindia.com/meet_our_team/1_1716458651.jpg', 'consultant', 5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed-cons-3', 'Gaurav Kochhar', 'Legal Consultant', 'https://prod-s3.counselindia.com/meet_our_team/2_1716458535.jpg', 'consultant', 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

COMMIT;
