const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, 'admissions-data.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf8');
  const items = JSON.parse(raw);
  console.log(`Loaded ${items.length} records from ${jsonPath}`);

  console.log('Clearing existing records in Admission table...');
  await prisma.admission.deleteMany({});

  console.log('Inserting records in batches...');
  const BATCH_SIZE = 250;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE).map(item => {
      const copy = { ...item };
      if (copy.admissionDate) copy.admissionDate = new Date(copy.admissionDate);
      if (copy.createdAt) copy.createdAt = new Date(copy.createdAt);
      if (copy.updatedAt) copy.updatedAt = new Date(copy.updatedAt);
      return copy;
    });

    await prisma.admission.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log(`Inserted records ${i + 1} to ${Math.min(i + BATCH_SIZE, items.length)}`);
  }

  const total = await prisma.admission.count();
  console.log(`✓ Verification complete: Total ${total} admissions currently in database.`);
}

main()
  .catch(e => {
    console.error('Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
