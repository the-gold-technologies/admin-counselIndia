const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// 1. Seed Site Settings
async function seedSettings(prismaInstance) {
  const p = prismaInstance || prisma;
  console.log("--- 1/6 Seeding Site Settings ---");

  const settingsData = {
    id: "default",
    title: "Counselindia",
    footer: "Counselindia",
    referWallet: "100",
    logo: "/uploads/logo_ci-icon_1673585977.png",
    lightLogo: "/uploads/light_logo_logo-dark-text_1640955961.png",
    favicon: "/uploads/favicon_favicon_favicon_1671434128_1673585969.ico",
    companyName: "counselindiaAdmin",
    websiteLink: "counselindia",
    address: "counselindia",
    adminEmail: "counselindia",
    supportEmail: "support@counselindia.co.in",
    helplineNumber: "8888888888",
    whatsNumber: "8888888888",
    emergencyNumber: "9999999999",
    facebookLink: "https://www.facebook.com/profile.php?id=counselindia",
    linkedinLink: "https://www.linkedin.com/company/counselindia",
    twitterLink: "https://twitter.com/counselindia",
    youtubeLink: "https://www.youtube.com/channel/UCPVfFDbCGjHN9DRtkPYkTaQ",
    pinterestLink: "https://in.pinterest.com/counselindia",
    googlePlayAppLink: "",
    iosAppLink: "",
    contactUsMobile: "+91-9518241200",
    contactUsMail: "admissions@counselindiaservices.in",
    contactUsHotline: "+91-8930804054",
    contactUsHeadOffice:
      "12A20, 13th Floor , Sector-96, Noida, Uttar Pradesh, 201301",
    contactUsBranchOffice:
      "1. Evolve Work Studio , 3rd floor , Raj Pinnacle \r\n (Behind Teieradiology Solution) ,  \r\nDoddanekundi Industrial Area,  \r\nBangalore  Karnataka - 560048   \r\n2. Yesssworks Andheri\r\nwww.yesssworks.com\r\n3rd Floor, Ackruti Softech Park, \r\nShree Krishna Nagar, Marol Midc Industry Estate, \r\nAndheri East, Mumbai, Maharashtra 400093",
    contactUsHoursOperation:
      "Monday - Friday: 09:00 - 20:00\r\n<br>\r\nSunday & Saturday: 10:30 - 22:00",
    aboutUs: "<p>about us</p>",
    ourVision: "<p>1</p>",
    privacy: "<p>Privacy</p>",
    termsCondition: "<p>Terms Condition</p>",
    howCanSignup: "<h2>Signup</h2>",
    refundPolicy: "",
    academicPolicy: "",
    contactUsContent: "<p>&nbsp;</p>\r\n\r\n<p>Contact Us</p>",
    footerTitle:
      "Counsel India is the only practical e-learning platform for psychology and counselling programs in I",
    footerCompanyName: "COUNSELINDIA SERVICES PRIVATE LIMITED",
    footerAddress:
      "12A20, 13th Floor, E-Square , Sector 96, Noida, Uttar Pradesh 201301",
    gstNumber: "09AAICC6447N1Z0",
    footerSupportEmail: "wecare@counselindiaservices.in",
    footerWhatsappNumber: "+918448519298",
    footerHelplineNumber: "+919518241200",
    footerTwitterLink: "https://twitter.com/counselindia1?lang=en",
    footerFbLink: "https://www.facebook.com/counselindia/",
    instaLink: "https://www.instagram.com/counsel_india_",
    footerYoutubeLink:
      "https://www.youtube.com/channel/UCWnALe3hLVdGJzVOuEgGoYg",
    footerLinkedinLink: "https://www.linkedin.com/company/28905636/admin/",
  };

  const record = await p.siteSetting.upsert({
    where: { id: "default" },
    update: settingsData,
    create: settingsData,
  });

  console.log("✓ SiteSetting seeded successfully (id: default)");
  return record;
}

// 2. Seed Courses (from courses-complete-data.json)
async function seedCourses(prismaInstance) {
  const p = prismaInstance || prisma;
  console.log("--- 2/6 Seeding Courses ---");

  const jsonPath = path.join(__dirname, "courses-complete-data.json");
  if (!fs.existsSync(jsonPath)) {
    console.log("No courses-complete-data.json found, skipping.");
    return;
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(
    `Loading ${data.length} courses with full media and submodules...`,
  );

  await p.course.deleteMany({});

  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    const slug =
      c.slug && c.slug.trim()
        ? c.slug.trim()
        : c.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
          "-" +
          c.liveId;
    const priceVal =
      parseFloat(c.totalDiscountFee || c.totalProgramFee || 0) || 0;
    const ratingVal = parseFloat(c.rating) || 5.0;
    const posVal = parseInt(c.position) || i + 1;

    await p.course.create({
      data: {
        sNo: c.sNo || i + 1,
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
        category: c.category || "Diploma Programs",
        status: c.status || "Active",
        isActive: c.status === "Active",
        addedOn: c.addedOn || null,
        overviewCount: c.overviewCount || 0,
        learnCount: c.learnCount || 0,
        credentialCount: c.credentialCount || 0,
        curriculumCount: c.curriculumCount || 0,
        overviewData: c.overviewData || c.overviewItems || [],
        learnData: c.learnData || c.learnItems || [],
        credentialData: c.credentialData || c.credentialItems || [],
        curriculumData: c.curriculumData || c.curriculumItems || [],
      },
    });
  }

  const count = await p.course.count();
  console.log(`✓ Seeded ${count} Courses successfully.`);
}

// 3. Seed Admissions (from admissions-data.json)
async function seedAdmissions(prismaInstance) {
  const p = prismaInstance || prisma;
  console.log("--- 3/6 Seeding Admissions ---");

  const jsonPath = path.join(__dirname, "admissions-data.json");
  if (!fs.existsSync(jsonPath)) {
    console.log("No admissions-data.json found, skipping.");
    return;
  }
  const admissions = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  await p.admission.deleteMany({});
  for (const a of admissions) {
    const { id, ...data } = a;
    if (data.admissionDate) data.admissionDate = new Date(data.admissionDate);
    if (data.createdAt) data.createdAt = new Date(data.createdAt);
    if (data.updatedAt) data.updatedAt = new Date(data.updatedAt);
    await p.admission.create({ data });
  }

  const count = await p.admission.count();
  console.log(`✓ Seeded ${count} Admissions successfully.`);
}

// 4. Seed Alumni (from alumni-data.json)
async function seedAlumni(prismaInstance) {
  const p = prismaInstance || prisma;
  console.log("--- 4/6 Seeding Alumni ---");

  const jsonPath = path.join(__dirname, "alumni-data.json");
  if (!fs.existsSync(jsonPath)) {
    console.log("No alumni-data.json found, skipping.");
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(`Loaded ${rawData.length} records from alumni-data.json`);

  await p.alumni.deleteMany({});

  const alumniToInsert = rawData.map((item, index) => {
    let createdDate = new Date();
    if (item.createdAt) {
      const d = new Date(item.createdAt.replace(" ", "T") + "+05:30");
      if (!isNaN(d.getTime())) createdDate = d;
    }

    let updatedDate = createdDate;
    if (item.updatedAt) {
      const d = new Date(item.updatedAt.replace(" ", "T") + "+05:30");
      if (!isNaN(d.getTime())) updatedDate = d;
    }

    return {
      sNo: item.sNo || index + 1,
      name: item.name || "Alumnus",
      email: item.email || `alumni${index + 1}@counselindia.com`,
      mobile: item.mobile || "-",
      image: item.image || null,
      programName: item.programName || "Counselling Master Course",
      certificateNumber: item.certificateNumber || null,
      certificateUrl: item.certificateUrl || null,
      profession: item.profession || "Psychologist / Counsellor",
      skills: item.skills || null,
      isOnline: Boolean(item.isOnline),
      status: item.status || "Active",
      isApproved:
        item.isApproved !== undefined ? Boolean(item.isApproved) : true,
      createdAt: createdDate,
      updatedAt: updatedDate,
    };
  });

  const CHUNK_SIZE = 200;
  for (let i = 0; i < alumniToInsert.length; i += CHUNK_SIZE) {
    const chunk = alumniToInsert.slice(i, i + CHUNK_SIZE);
    await p.alumni.createMany({ data: chunk });
  }

  const count = await p.alumni.count();
  console.log(`✓ Seeded ${count} Alumni successfully.`);
}

// 5. Seed Counselors (from counselor-data.json)
async function seedCounselors(prismaInstance) {
  const p = prismaInstance || prisma;
  console.log("--- 5/6 Seeding Counselors ---");

  const jsonPath = path.join(__dirname, "counselor-data.json");
  if (!fs.existsSync(jsonPath)) {
    console.log("No counselor-data.json found, skipping.");
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(`Loaded ${rawData.length} records from counselor-data.json`);

  await p.counselor.deleteMany({});

  const counselorsToInsert = rawData.map((item, index) => {
    let createdDate = new Date();
    if (item.addedOn) {
      const d = new Date(item.addedOn.replace(" ", "T") + "+05:30");
      if (!isNaN(d.getTime())) createdDate = d;
    }

    let updatedDate = createdDate;
    if (item.updatedOn) {
      const d = new Date(item.updatedOn.replace(" ", "T") + "+05:30");
      if (!isNaN(d.getTime())) updatedDate = d;
    }

    return {
      sNo: item.sNo || index + 1,
      liveId: String(item.liveId || ""),
      name: item.name || "Counselor",
      email: item.email || `counselor${index + 1}@counselindia.com`,
      mobile: item.mobile || "-",
      address: item.address || "",
      city: item.city || "",
      country: item.country || "INDIA",
      designation: item.designation || "Counseling Psychologist",
      language: item.language || "English, Hindi",
      education: item.education || "",
      experience: String(item.experience || ""),
      specialty: item.specialty || "",
      specialty2: item.specialty2 || "",
      expertise: item.expertise || "",
      rciNumber: item.rciNumber || "",
      image: item.image || null,
      identityImage: item.identityImage || null,
      qualificationProof: item.qualificationProof || null,
      cvUrl: item.cvUrl || null,
      bankName: item.bankName || "",
      accountNumber: item.accountNumber || "",
      ifscCode: item.ifscCode || "",
      accountType: item.accountType || "Savings",
      accountHolderName: item.accountHolderName || "",
      userType: item.userType || "Counselor",
      isApproved:
        item.isApproved !== undefined ? Boolean(item.isApproved) : true,
      isOnline: Boolean(item.isOnline),
      videoStatus: Boolean(item.videoStatus),
      videoPrice: item.videoPrice !== undefined ? Number(item.videoPrice) : 0,
      audioStatus: Boolean(item.audioStatus),
      audioPrice: item.audioPrice !== undefined ? Number(item.audioPrice) : 0,
      chatStatus: Boolean(item.chatStatus),
      chatPrice: item.chatPrice !== undefined ? Number(item.chatPrice) : 0,
      expectedCharges:
        item.expectedCharges !== undefined ? Number(item.expectedCharges) : 0,
      councellFees:
        item.councellFees !== undefined ? Number(item.councellFees) : 0,
      commission: item.commission !== undefined ? Number(item.commission) : 0,
      position: Number(item.position) || index + 1,
      about: item.about || "",
      achievements: item.achievements || "",
      whatBringsYou: item.whatBringsYou || "",
      status: item.status || "Active",
      forCourse: item.forCourse || "No",
      personalCounselling: item.personalCounselling || "No",
      addedOn: item.addedOn || null,
      updatedOn: item.updatedOn || null,
      createdAt: createdDate,
      updatedAt: updatedDate,
    };
  });

  const CHUNK_SIZE = 200;
  for (let i = 0; i < counselorsToInsert.length; i += CHUNK_SIZE) {
    const chunk = counselorsToInsert.slice(i, i + CHUNK_SIZE);
    await p.counselor.createMany({ data: chunk });
  }

  const count = await p.counselor.count();
  console.log(`✓ Seeded ${count} Counselors successfully.`);
}

// 6. Seed Course Leads (from course-leads-data.json)
async function seedCourseLeads(prismaInstance) {
  const p = prismaInstance || prisma;
  console.log("--- 6/6 Seeding Course Leads ---");

  const jsonPath = path.join(__dirname, "course-leads-data.json");
  if (!fs.existsSync(jsonPath)) {
    console.log("No course-leads-data.json found, skipping.");
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(`Loaded ${rawData.length} records from course-leads-data.json`);

  await p.courseLead.deleteMany({});

  const leadsToInsert = rawData.map((item, index) => {
    let createdDate = new Date();
    if (item.createdAt) {
      const d = new Date(item.createdAt);
      if (!isNaN(d.getTime())) createdDate = d;
    } else if (item.addedOn) {
      const parts = item.addedOn.trim().split(" ");
      if (parts.length >= 2) {
        const [dPart, tPart] = parts;
        const [day, month, year] = dPart.split("/");
        const isPm = tPart.toLowerCase().includes("pm");
        let [hours, mins] = tPart
          .replace(/(am|pm)/i, "")
          .split(":")
          .map(Number);
        if (isPm && hours < 12) hours += 12;
        if (!isPm && hours === 12) hours = 0;
        const isoStr = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:00+05:30`;
        const d = new Date(isoStr);
        if (!isNaN(d.getTime())) createdDate = d;
      }
    }

    return {
      sNo: item.sNo || index + 1,
      liveId: String(item.liveId || ""),
      userId: String(item.userId || ""),
      name: item.name || "Guest",
      email: item.email || "",
      mobile: item.mobile || "",
      courseName: item.courseName || "General Course Enquiry",
      relationshipManager: item.relationshipManager || "",
      customerSuccessManager: item.customerSuccessManager || "",
      status: item.status || "New",
      notes: item.notes || null,
      source: item.source || "Website",
      addedOn: item.addedOn || null,
      createdAt: createdDate,
      updatedAt: createdDate,
    };
  });

  const CHUNK_SIZE = 200;
  for (let i = 0; i < leadsToInsert.length; i += CHUNK_SIZE) {
    const chunk = leadsToInsert.slice(i, i + CHUNK_SIZE);
    await p.courseLead.createMany({ data: chunk });
  }

  const count = await p.courseLead.count();
  console.log(`✓ Seeded ${count} Course Leads successfully.`);
}

// 7. Seed Single Admin User (superadmin@counselindia.com)
async function seedUser(prismaInstance) {
  const p = prismaInstance || prisma;
  console.log("--- 7/7 Seeding Admin User ---");

  const adminEmail = "superadmin@counselindia.com";
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;
  const hashedPassword = bcrypt.hashSync(adminPassword, 10);

  // Strictly only the single authentic admin user
  await p.user.deleteMany({});

  const user = await p.user.create({
    data: {
      name: "Superadmin",
      email: adminEmail,
      password: hashedPassword,
      role: "SUPERADMIN",
      phone: "+91-9518241200",
      status: "Active",
      avatar: "/uploads/logo_ci-icon_1673585977.png",
    },
  });

  console.log(`✓ Seeded admin user: ${user.email} (${user.role})`);
  return user;
}

// Master Seed Function

// 8. Seed Personality Test
async function seedPersonalityTest(prismaInstance) {
  const p = prismaInstance || prisma;
  console.log("--- 8/8 Seeding Personality Test ---");

  const infoPath = path.join(__dirname, "personality-info.json");
  const questionsPath = path.join(__dirname, "personality-questions.json");
  const tabResultsPath = path.join(__dirname, "personality-tab-results.json");

  // 1. Info
  if (fs.existsSync(infoPath)) {
    const infoData = JSON.parse(fs.readFileSync(infoPath, "utf8"));
    await p.personalityTestInfo.deleteMany({});
    const items = Array.isArray(infoData) ? infoData : [infoData];
    for (const item of items) {
      await p.personalityTestInfo.create({
        data: {
          liveId: item.liveId || item.id || "1",
          name: item.name || "Personality Test One",
          totalQuestions: item.totalQuestions || 10,
          subtitle: item.subtitle || "Test",
          instruction: item.instruction || "Know yourself better",
          status: item.status || "Active",
        },
      });
    }
    console.log(`✓ Seeded ${items.length} PersonalityTestInfo record.`);
  }

  // 2. Questions
  if (fs.existsSync(questionsPath)) {
    const questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
    await p.personalityQuestion.deleteMany({});
    for (const q of questionsData) {
      await p.personalityQuestion.create({
        data: {
          liveId: q.liveId || q.id,
          question: q.question,
          answers: q.answers,
          position: q.position || 1,
          status: q.status || "Active",
        },
      });
    }
    console.log(`✓ Seeded ${questionsData.length} PersonalityQuestion records.`);
  }

  // 3. Tab Results
  if (fs.existsSync(tabResultsPath)) {
    const tabResultsData = JSON.parse(fs.readFileSync(tabResultsPath, "utf8"));
    await p.personalityTabResult.deleteMany({});
    for (const tr of tabResultsData) {
      await p.personalityTabResult.create({
        data: {
          liveId: tr.liveId || tr.id,
          name: tr.name,
          description: tr.description,
          points: tr.points || "1",
          status: tr.status || "Active",
        },
      });
    }
    console.log(`✓ Seeded ${tabResultsData.length} PersonalityTabResult records.`);
  }
}

async function main() {
  console.log("==================================================");
  console.log("🚀 Starting Counsel India CMS Database Seeder");
  console.log("==================================================");

  try {
    await seedUser(prisma);
    await seedSettings(prisma);
    await seedCourses(prisma);
    await seedAdmissions(prisma);
    await seedAlumni(prisma);
    await seedCounselors(prisma);
    await seedCourseLeads(prisma);
    await seedPersonalityTest(prisma);

    console.log("==================================================");
    console.log("✅ All seeds completed successfully!");
    console.log("==================================================");
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = {
  main,
  seedUser,
  seedSettings,
  seedCourses,
  seedAdmissions,
  seedAlumni,
  seedCounselors,
  seedCourseLeads,
  seedPersonalityTest,
};

if (require.main === module) {
  main();
}
