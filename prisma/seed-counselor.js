const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedCounselors() {
  console.log('--- Starting Counselor Seed ---');
  
  const jsonPath = path.join(__dirname, 'counselor-data.json');
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Counselor data file not found at ${jsonPath}`);
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${rawData.length} records from counselor-data.json`);

  // Clear existing counselors
  const deleted = await prisma.counselor.deleteMany({});
  console.log(`Cleared ${deleted.count} old counselor records from database.`);

  const counselorsToInsert = rawData.map((item, index) => {
    let createdDate = new Date();
    if (item.addedOn) {
      const d = new Date(item.addedOn.replace(' ', 'T') + '+05:30');
      if (!isNaN(d.getTime())) createdDate = d;
    }

    let updatedDate = createdDate;
    if (item.updatedOn) {
      const d = new Date(item.updatedOn.replace(' ', 'T') + '+05:30');
      if (!isNaN(d.getTime())) updatedDate = d;
    }

    return {
      sNo: item.sNo || (index + 1),
      liveId: String(item.liveId || ''),
      name: item.name || 'Counselor',
      email: item.email || `counselor${index + 1}@counselindia.com`,
      mobile: item.mobile || '-',
      address: item.address || '',
      city: item.city || '',
      country: item.country || 'INDIA',
      designation: item.designation || 'Counseling Psychologist',
      language: item.language || 'English, Hindi',
      education: item.education || '',
      experience: String(item.experience || ''),
      specialty: item.specialty || '',
      specialty2: item.specialty2 || '',
      expertise: item.expertise || '',
      rciNumber: item.rciNumber || '',
      
      image: item.image || null,
      identityImage: item.identityImage || null,
      qualificationProof: item.qualificationProof || null,
      cvUrl: item.cvUrl || null,

      bankName: item.bankName || '',
      accountNumber: item.accountNumber || '',
      ifscCode: item.ifscCode || '',
      accountType: item.accountType || '',
      accountHolderName: item.accountHolderName || '',

      userType: item.userType || 'Counselor',
      isApproved: Boolean(item.isApproved),
      isOnline: Boolean(item.isOnline),
      videoStatus: Boolean(item.videoStatus),
      videoPrice: Number(item.videoPrice) || 0,
      audioStatus: Boolean(item.audioStatus),
      audioPrice: Number(item.audioPrice) || 0,
      chatStatus: Boolean(item.chatStatus),
      chatPrice: Number(item.chatPrice) || 0,
      expectedCharges: Number(item.expectedCharges) || 0,
      councellFees: Number(item.councellFees) || 0,
      commission: Number(item.commission) || 0,
      position: Number(item.position) || 0,

      about: item.about || '',
      achievements: item.achievements || '',
      whatBringsYou: item.whatBringsYou || '',

      status: item.status || 'Active',
      forCourse: item.forCourse || 'No',
      personalCounselling: item.personalCounselling || 'No',

      addedOn: item.addedOn || null,
      updatedOn: item.updatedOn || null,
      createdAt: createdDate,
      updatedAt: updatedDate,
    };
  });

  const CHUNK_SIZE = 150;
  let totalInserted = 0;
  for (let i = 0; i < counselorsToInsert.length; i += CHUNK_SIZE) {
    const chunk = counselorsToInsert.slice(i, i + CHUNK_SIZE);
    const res = await prisma.counselor.createMany({
      data: chunk,
    });
    totalInserted += res.count;
    console.log(`  Inserted batch ${Math.floor(i / CHUNK_SIZE) + 1}: ${res.count} records (total: ${totalInserted})`);
  }

  console.log(`✅ Successfully seeded ${totalInserted} Counselor records into PostgreSQL!`);
}

module.exports = { seedCounselors };

if (require.main === module) {
  seedCounselors()
    .catch((e) => {
      console.error('Error seeding counselors:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
