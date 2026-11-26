/**
 * One-off content update from the client's "New Website Updates" sheet (Nov 2026).
 *
 * Updates ONLY:
 *   - 11 courses (matched by slug): display name + category
 *   - Site settings: WhatsApp / contact numbers -> 8031320449
 *
 * It never deletes or creates records. Safe to re-run (idempotent).
 *
 * Usage:
 *   node prisma/scripts/2026-11-26_client-content-update.js           # dry run (shows changes, writes nothing)
 *   node prisma/scripts/2026-11-26_client-content-update.js --apply   # apply changes
 *
 * Uses DATABASE_URL from .env — check which database it points to before running with --apply.
 */
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

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

function diff(current, wanted) {
  const changes = {};
  for (const [k, v] of Object.entries(wanted)) {
    if (current[k] !== v) changes[k] = { from: current[k], to: v };
  }
  return changes;
}

async function main() {
  console.log(
    APPLY
      ? "=== APPLYING CHANGES ==="
      : "=== DRY RUN (no changes written; pass --apply to write) ==="
  );
  let pending = 0;

  // Courses
  for (const [slug, wanted] of Object.entries(COURSE_UPDATES)) {
    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true, name: true, category: true },
    });
    if (!course) {
      console.log(`! Course not found, skipped: ${slug}`);
      continue;
    }
    const changes = diff(course, wanted);
    if (Object.keys(changes).length === 0) {
      console.log(`  Course up to date: ${slug}`);
      continue;
    }
    pending++;
    for (const [k, { from, to }] of Object.entries(changes)) {
      console.log(`~ Course ${slug} | ${k}: "${from}" -> "${to}"`);
    }
    if (APPLY) await prisma.course.update({ where: { id: course.id }, data: wanted });
  }

  // Site settings
  const settings = await prisma.siteSetting.findUnique({ where: { id: "default" } });
  if (!settings) {
    console.log("! Site settings row 'default' not found, skipped.");
  } else {
    const changes = diff(settings, SETTINGS_UPDATES);
    if (Object.keys(changes).length === 0) {
      console.log("  Site settings up to date");
    } else {
      pending++;
      for (const [k, { from, to }] of Object.entries(changes)) {
        console.log(`~ Settings | ${k}: "${from}" -> "${to}"`);
      }
      if (APPLY)
        await prisma.siteSetting.update({ where: { id: "default" }, data: SETTINGS_UPDATES });
    }
  }

  console.log(`\n${pending} record(s) ${APPLY ? "updated" : "would be updated"}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
