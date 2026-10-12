const { PrismaClient } = require('@prisma/client');

async function seedSettings(prismaInstance) {
  const prisma = prismaInstance || new PrismaClient();

  const settingsData = {
    id: "default",
    // Admin Settings
    title: "Counselindia",
    footer: "Counselindia",
    referWallet: "100",
    logo: "/uploads/logo_ci-icon_1673585977.png",
    lightLogo: "/uploads/light_logo_logo-dark-text_1640955961.png",
    favicon: "/uploads/favicon_favicon_favicon_1671434128_1673585969.ico",

    // Config Settings
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

    // Contact Us Settings
    contactUsMobile: "+91-9518241200",
    contactUsMail: "admissions@counselindiaservices.in",
    contactUsHotline: "+91-8930804054",
    contactUsHeadOffice: "12A20, 13th Floor , Sector-96, Noida, Uttar Pradesh, 201301",
    contactUsBranchOffice: "1. Evolve Work Studio , 3rd floor , Raj Pinnacle \r\n (Behind Teieradiology Solution) ,  \r\nDoddanekundi Industrial Area,  \r\nBangalore  Karnataka - 560048   \r\n2. Yesssworks Andheri\r\nwww.yesssworks.com\r\n3rd Floor, Ackruti Softech Park, \r\nShree Krishna Nagar, Marol Midc Industry Estate, \r\nAndheri East, Mumbai, Maharashtra 400093",
    contactUsHoursOperation: "Monday - Friday: 09:00 - 20:00\r\n<br>\r\nSunday & Saturday: 10:30 - 22:00",

    // Content Settings
    aboutUs: "<p>about us</p>",
    ourVision: "<p>1</p>",
    privacy: "<p>Privacy</p>",
    termsCondition: "<p>Terms Condition</p>",
    howCanSignup: "<h2>Signup</h2>",
    refundPolicy: "",
    academicPolicy: "",
    contactUsContent: "<p>&nbsp;</p>\r\n\r\n<p>Contact Us</p>",

    // Footer Settings
    footerTitle: "Counsel India is the only practical e-learning platform for psychology and counselling programs in I",
    footerCompanyName: "COUNSELINDIA SERVICES PRIVATE LIMITED",
    footerAddress: "12A20, 13th Floor, E-Square , Sector 96, Noida, Uttar Pradesh 201301",
    gstNumber: "09AAICC6447N1Z0",
    footerSupportEmail: "wecare@counselindiaservices.in",
    footerWhatsappNumber: "+918448519298",
    footerHelplineNumber: "+919518241200",
    footerTwitterLink: "https://twitter.com/counselindia1?lang=en",
    footerFbLink: "https://www.facebook.com/counselindia/",
    instaLink: "https://www.instagram.com/counsel_india_",
    footerYoutubeLink: "https://www.youtube.com/channel/UCWnALe3hLVdGJzVOuEgGoYg",
    footerLinkedinLink: "https://www.linkedin.com/company/28905636/admin/",
  };

  const record = await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: settingsData,
    create: settingsData,
  });

  console.log("✓ SiteSetting seeded successfully in PostgreSQL (id: default)");
  return record;
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedSettings(prisma)
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      prisma.$disconnect();
      process.exit(1);
    });
}

module.exports = { seedSettings };
