const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedAlumni() {
  console.log('--- Starting Alumni Seed (836 records) ---');
  
  const jsonPath = path.join(__dirname, 'alumni-data.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Alumni data file not found at ${jsonPath}`);
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${rawData.length} records from alumni-data.json`);

  // Clear existing alumni
  const deleted = await prisma.alumni.deleteMany({});
  console.log(`Cleared ${deleted.count} old alumni records from database.`);

  // Format data for Prisma
  const alumniToInsert = rawData.map((item, index) => {
    let createdDate = new Date();
    if (item.createdAt) {
      const d = new Date(item.createdAt.replace(' ', 'T') + '+05:30');
      if (!isNaN(d.getTime())) createdDate = d;
    }

    let updatedDate = createdDate;
    if (item.updatedAt) {
      const d = new Date(item.updatedAt.replace(' ', 'T') + '+05:30');
      if (!isNaN(d.getTime())) updatedDate = d;
    }

    return {
      sNo: item.sNo || (index + 1),
      name: item.name || 'Alumnus',
      email: item.email || `alumni${index + 1}@counselindia.com`,
      mobile: item.mobile || '-',
      image: item.image || null,
      programName: item.programName || 'Counselling Master Course',
      certificateNumber: item.certificateNumber || null,
      certificateUrl: item.certificateUrl || null,
      profession: item.profession || 'Psychologist / Counsellor',
      skills: item.skills || null,
      isOnline: Boolean(item.isOnline),
      status: item.status || 'Active',
      isApproved: item.isApproved !== undefined ? Boolean(item.isApproved) : true,
      createdAt: createdDate,
      updatedAt: updatedDate,
    };
  });

  // Batch insert in chunks of 200 using createMany
  const CHUNK_SIZE = 200;
  let totalInserted = 0;
  for (let i = 0; i < alumniToInsert.length; i += CHUNK_SIZE) {
    const chunk = alumniToInsert.slice(i, i + CHUNK_SIZE);
    const res = await prisma.alumni.createMany({
      data: chunk,
    });
    totalInserted += res.count;
    console.log(`  Inserted batch ${Math.floor(i / CHUNK_SIZE) + 1}: ${res.count} records (total: ${totalInserted})`);
  }

  console.log(`✅ Successfully seeded ${totalInserted} Alumni records into PostgreSQL!`);
}

module.exports = { seedAlumni };

if (require.main === module) {
  seedAlumni()
    .catch((e) => {
      console.error('Error seeding alumni:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
