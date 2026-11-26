/**
 * Counsel India CMS — data update (client "New Website Updates" sheet, Nov 2026)
 *
 * One command that brings an EXISTING database up to date with today's changes.
 * Unlike seed.js it never deletes or resets anything, so it is safe on live data
 * and safe to run more than once.
 *
 *   1. Courses  — 11 courses renamed + grouped into Masters / PG Diploma / Certification Programs
 *   2. Settings — WhatsApp / helpline / contact numbers → 8031320449
 *   3. Blogs    — 110 blogs from the old admin with SEO + tags (prisma/blogs-data.json,
 *                 prisma/blogs-seo-data.json)
 *   4. Staff    — roles & staff from the old admin (prisma/staff-roles-data.json). New staff are
 *                 inactive until a Super Admin sets their password in Staff & Roles.
 *
 * Run the migrations first (separately):  npm run db:migrate:blogs && npm run db:migrate:staff-roles
 * Then:                                   npm run update
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { seedBlogs, seedStaffAndRoles } = require("./seed");

const prisma = new PrismaClient();

const MASTERS = "Masters Programs";
const PG_DIPLOMA = "PG Diploma Programs";
const CERTIFICATION = "Certification Programs";

const COURSE_UPDATES = {
  "masters-in-psychology-work-integrated-skill-based-program": {
    name: "M.A. in Psychology",
    category: MASTERS,
  },
  "masters-in-clinical-psychology": { name: "M.A. in Clinical Psychology", category: MASTERS },
  "masters-in-child-psychology-work-integrated-skill-based-program)": {
    name: "M.A. in Child Psychology and Developmental Psychology",
    category: MASTERS,
  },
  "pg-diploma-in-counselling-psychology-clinical-skills": {
    name: "PG Diploma in Counselling Psychology and Clinical Skills",
    category: PG_DIPLOMA,
  },
  "diploma-in-child-psychology-parenting": {
    name: "Diploma in Child Psychology and Parenting",
    category: PG_DIPLOMA,
  },
  "counselling-master-course-foundation": {
    name: "Counselling Master Course – Foundation",
    category: CERTIFICATION,
  },
  "counselling-master-course-intermediate": {
    name: "Counselling Master Course – Intermediate",
    category: CERTIFICATION,
  },
  "counselling-master-course-advanced": {
    name: "Counselling Master Course – Advanced",
    category: CERTIFICATION,
  },
  "certificate-in-child-psychology": {
    name: "Certificate in Child Psychology",
    category: CERTIFICATION,
  },
  "advanced-certificate-in-child-psychology": {
    name: "Advanced Certificate in Child Psychology",
    category: CERTIFICATION,
  },
  "therapy-master-course": { name: "Therapy Master Course", category: CERTIFICATION },
};

const SETTINGS_UPDATES = {
  helplineNumber: "8031320449",
  whatsNumber: "8031320449",
  footerHelplineNumber: "8031320449",
  footerWhatsappNumber: "8031320449",
  contactUsMobile: "+91-8031320449",
  contactUsHotline: "+91-8031320449",
};

// 1. Courses
async function updateCourses() {
  console.log("--- 1/4 Updating Courses ---");
  let updated = 0;
  for (const [slug, data] of Object.entries(COURSE_UPDATES)) {
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      console.log(`  ! Course not found, skipped: ${slug}`);
      continue;
    }
    if (course.name === data.name && course.category === data.category) continue;
    await prisma.course.update({ where: { id: course.id }, data });
    updated++;
  }
  console.log(`✓ Courses: ${updated} updated.`);
}

// 2. Site settings
async function updateSettings() {
  console.log("--- 2/4 Updating Site Settings ---");
  const settings = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  if (!settings) {
    console.log("  ! Site settings not found, skipped.");
    return;
  }
  await prisma.siteSetting.update({ where: { id: "default" }, data: SETTINGS_UPDATES });
  console.log("✓ Site settings: contact numbers updated.");
}

async function main() {
  console.log("==================================================");
  console.log("🔄 Counsel India CMS — Data Update");
  console.log("==================================================");

  try {
    await updateCourses();
    await updateSettings();
    await seedBlogs(prisma);
    await seedStaffAndRoles(prisma);

    console.log("==================================================");
    console.log("✅ All updates completed successfully!");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ Update failed with error:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
