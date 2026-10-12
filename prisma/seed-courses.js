const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCourses() {
  const jsonPath = path.join(__dirname, 'courses-complete-data.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('No courses-complete-data.json found, skipping.');
    return;
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Seeding ${data.length} courses with full media and submodules into PostgreSQL...`);
  
  await prisma.course.deleteMany({});
  
  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    const slug = (c.slug && c.slug.trim()) ? c.slug.trim() : (c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + c.liveId);
    const priceVal = parseFloat(c.totalDiscountFee || c.totalProgramFee || 0) || 0;
    const ratingVal = parseFloat(c.rating) || 5.0;
    const posVal = parseInt(c.position) || (i + 1);
    
    await prisma.course.create({
      data: {
        sNo: c.sNo || (i + 1),
        liveId: String(c.liveId),
        name: c.name,
        slug: slug,
        coverImage: c.coverImage || null,
        backgroundImage: c.backgroundImage || null,
        coverImageApp: c.coverImageApp || null,
        backgroundImageApp: c.backgroundImageApp || null,
        brochure: c.brochure || null,
        scSchemePdf: c.scSchemePdf || null,
        duration: c.duration || null,
        listDuration: c.listDuration || null,
        enrolmentSeats: c.enrolment || null,
        lessons: c.lessons || null,
        description: c.subdescription || c.name,
        subdescription: c.subdescription || null,
        aboutUs: c.aboutUs || null,
        mepscAbout: c.mepscAbout || null,
        universityAdvantage: c.universityAdvantage || null,
        howWillBenefit: c.howWillBenefit || null,
        ojt: c.ojt || null,
        mentorshipGuide: c.mentorshipGuide || null,
        dreamJob: c.dreamJob || null,
        whoCanJoin: c.whoCanJoin || null,
        headings: c.headings || [],
        cheadings: c.cheadings || [],
        rating: ratingVal,
        price: priceVal,
        totalProgramFee: c.totalProgramFee || null,
        totalDiscountFee: c.totalDiscountFee || null,
        totalDiscountPercent: c.totalDiscountPercent || null,
        oneTimeFee: c.oneTimeFee || null,
        oneTimeDiscountFee: c.oneTimeDiscountFee || null,
        oneTimeDiscountPercent: c.oneTimeDiscountPercent || null,
        startRange: c.startRange || null,
        endRange: c.endRange || null,
        paymentLink: c.paymentLink || null,
        nextBatchDate: c.nextBatchDate || null,
        position: posVal,
        category: c.category || 'Diploma Programs',
        status: c.status || 'Active',
        isActive: c.status === 'Active',
        addedOn: c.addedOn || null,
        overviewCount: c.overviewCount || 0,
        learnCount: c.learnCount || 0,
        credentialCount: c.credentialCount || 0,
        curriculumCount: c.curriculumCount || 0,
        overviewData: c.overviewItems || [],
        learnData: c.learnItems || [],
        credentialData: c.credentialItems || [],
        curriculumData: c.curriculumItems || []
      }
    });
  }
  
  const count = await prisma.course.count();
  console.log(`Seeded courses successfully in exact order! Total: ${count}`);
}

module.exports = { seedCourses };

if (require.main === module) {
  seedCourses().catch(console.error).finally(() => prisma.$disconnect());
}
