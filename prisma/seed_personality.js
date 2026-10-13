const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, 'personality-test-data.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log('--- Seeding Personality Test Info ---');
  await prisma.personalityTestInfo.deleteMany({});
  for (const item of data.info) {
    await prisma.personalityTestInfo.create({
      data: {
        liveId: item.id,
        name: item.name,
        totalQuestions: item.totalQuestions || 10,
        subtitle: item.subtitle || 'Test',
        instruction: item.instruction || 'Know yourself better',
        status: item.status || 'Active'
      }
    });
  }
  console.log(`✓ Seeded ${data.info.length} PersonalityTestInfo record.`);

  console.log('--- Seeding Personality Questions ---');
  await prisma.personalityQuestion.deleteMany({});
  for (const q of data.questions) {
    await prisma.personalityQuestion.create({
      data: {
        liveId: q.id,
        question: q.question,
        answers: q.answers,
        position: q.position || 1,
        status: q.status || 'Active'
      }
    });
  }
  console.log(`✓ Seeded ${data.questions.length} PersonalityQuestion records.`);

  console.log('--- Seeding Personality Tab Results ---');
  await prisma.personalityTabResult.deleteMany({});
  for (const tr of data.tabResults) {
    await prisma.personalityTabResult.create({
      data: {
        liveId: tr.id,
        name: tr.name,
        description: tr.description,
        points: tr.points || '1',
        status: tr.status || 'Active'
      }
    });
  }
  console.log(`✓ Seeded ${data.tabResults.length} PersonalityTabResult records.`);

  console.log('--- Seeding Personality Entries into InquiryLead (category: personality-test) ---');
  await prisma.inquiryLead.deleteMany({
    where: { category: 'personality-test' }
  });

  const entryChunks = [];
  const BATCH_SIZE = 100;
  for (let i = 0; i < data.entries.length; i += BATCH_SIZE) {
    const chunk = data.entries.slice(i, i + BATCH_SIZE).map((e, idx) => ({
      sNo: i + idx + 1,
      liveId: e.id,
      category: 'personality-test',
      name: e.name,
      email: e.email,
      mobile: e.mobile,
      state: e.state || '',
      hearFrom: e.hereFrom || '',
      addedOn: e.date || '',
      extraData: {
        gender: e.gender || '',
        age: e.age || '',
        proBackground: e.proBackground || '',
        purposeGiveTest: e.purposeGiveTest || '',
        result: e.result || '0',
      }
    }));
    await prisma.inquiryLead.createMany({
      data: chunk,
      skipDuplicates: true
    });
  }
  const entryCount = await prisma.inquiryLead.count({ where: { category: 'personality-test' } });
  console.log(`✓ Seeded ${entryCount} Personality Entries into InquiryLead.`);
}

main()
  .catch(e => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
