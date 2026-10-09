const { seedAlumni } = require('./seed-alumni');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding PostgreSQL counselindia_cms database...');

  const courses = [
    { name: 'Counselling Master Course - Foundation', slug: 'counselling-master-course-foundation', duration: '3 Months', price: 24999, category: 'CI Programs' },
    { name: 'Counselling Master Course - Intermediate', slug: 'counselling-master-course-intermediate', duration: '6 Months', price: 44999, category: 'CI Programs' },
    { name: 'Counselling Master Course - Advanced', slug: 'counselling-master-course-advanced', duration: '9 Months', price: 64999, category: 'CI Programs' },
    { name: 'Diploma in Child Psychology and Parenting', slug: 'diploma-in-child-psychology-and-parenting', duration: '6 Months', price: 34999, category: 'Psychology' },
    { name: 'Certificate in Child Psychology', slug: 'certificate-in-child-psychology', duration: '3 Months', price: 19999, category: 'Psychology' },
    { name: 'PG Diploma in Counselling Psychology & Clinical Skills', slug: 'pg-diploma-in-counselling-psychology-clinical-skills', duration: '12 Months', price: 89999, category: 'Clinical' },
    { name: 'Business Growth Master Course', slug: 'business-growth-master-course', duration: '4 Months', price: 29999, category: 'Entrepreneurship' },
    { name: 'Counsellor Entrepreneurship Program', slug: 'counsellor-entrepreneurship-program', duration: '6 Months', price: 39999, category: 'Entrepreneurship' },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const admissions = [
    {
      sNo: 1,
      name: 'Akshatha D Shetty',
      email: 'shettyaksh89@gmail.com',
      mobile: '9164522093',
      courseName: 'Counselling Master Course - Intermediate',
      courseSlug: 'counselling-master-course-intermediate',
      status: 'Enrolled',
      academicCounselor: 'Anand Prakash',
      feeAmount: 44999,
      paymentStatus: 'Paid',
      batchName: 'Batch Oct-2026 Alpha',
      dob: '1989-02-08',
      age: 37,
      gender: 'Female',
      maritalStatus: 'Married',
      nationality: 'Indian',
      aadharNumber: '9422-4733-8489',
      panNumber: 'ABCPS8912K',
      category: 'General',
      fatherName: 'S K Dayananda Shetty',
      fatherMobile: '9448123990',
      permanentAddress: 'Asha Nilaya Village Keyyuru Post Madavu, Near Merla Bus Stand',
      correspondenceAddress: 'Sector 62, Noida, Uttar Pradesh',
      city: 'Dakshina Kannada',
      state: 'Karnataka',
      pincode: '574210',
      courseExpectations: JSON.stringify([
        'Upskilling & clinical mastery',
        'Improve personal capability of handling complex life situations',
        'Creating social impact & give back to the society',
        'Promotion / Appraisal in existing role',
        'Start private therapy practice'
      ]),
      educationHistory: JSON.stringify([
        { level: 'Post-Graduation', courseName: 'M.Sc Psychology', instituteName: 'Mangalore University', boardOrUniversity: 'Mangalore University', yearOfPassing: '2013', scoreOrPercentage: '78.5%' },
        { level: 'Graduation', courseName: 'B.A. Psychology & Sociology', instituteName: 'St. Aloysius College', boardOrUniversity: 'Mangalore University', yearOfPassing: '2010', scoreOrPercentage: '81.2%' },
        { level: '12th Standard', courseName: 'Higher Secondary (Science)', instituteName: 'Canara PU College', boardOrUniversity: 'Karnataka State PU Board', yearOfPassing: '2007', scoreOrPercentage: '84.0%' },
        { level: '10th Standard', courseName: 'SSLC', instituteName: 'Govt High School', boardOrUniversity: 'KSEEB', yearOfPassing: '2005', scoreOrPercentage: '86.4%' }
      ])
    },
    {
      sNo: 2,
      name: 'Dhamodharan K',
      email: 'kdhamo@gmail.com',
      mobile: '9003142001',
      courseName: 'Counselling Master Course - Foundation',
      courseSlug: 'counselling-master-course-foundation',
      status: 'Enrolled',
      academicCounselor: 'Dr. Suhani Saleem',
      feeAmount: 24999,
      paymentStatus: 'Paid',
      batchName: 'Batch Oct-2026 Foundation',
      dob: '1993-05-14',
      age: 33,
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Indian',
      aadharNumber: '6712-9843-1102',
      panNumber: 'BGKPD4321R',
      category: 'OBC',
      fatherName: 'Kannan K',
      fatherMobile: '9840219987',
      permanentAddress: '42, Gandhi Road, T. Nagar',
      correspondenceAddress: '42, Gandhi Road, T. Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      courseExpectations: JSON.stringify([
        'Transitioning into mental health counselling',
        'Understanding psychological disorders & diagnosis',
        'Practical client therapy simulation'
      ]),
      educationHistory: JSON.stringify([
        { level: 'Graduation', courseName: 'B.Sc Visual Communication', instituteName: 'Loyola College', boardOrUniversity: 'University of Madras', yearOfPassing: '2015', scoreOrPercentage: '74.0%' },
        { level: '12th Standard', courseName: 'HSC', instituteName: 'Don Bosco School', boardOrUniversity: 'Tamil Nadu State Board', yearOfPassing: '2011', scoreOrPercentage: '79.5%' }
      ])
    },
    {
      sNo: 3,
      name: 'Susmitha K S',
      email: 'kssusmitha313@gmail.com',
      mobile: '6238615690',
      courseName: 'Diploma in Child Psychology and Parenting',
      courseSlug: 'diploma-in-child-psychology-and-parenting',
      status: 'Verified',
      academicCounselor: 'Pooja Sharma',
      feeAmount: 34999,
      paymentStatus: 'Paid',
      batchName: 'Batch Oct-2026 Child-Psy',
      dob: '1997-11-22',
      age: 28,
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'Indian',
      aadharNumber: '8834-1290-7761',
      panNumber: 'CYKPS1190Q',
      category: 'General',
      fatherName: 'Suresh Kumar K',
      fatherMobile: '9447102938',
      permanentAddress: 'Krishna Vilas, Near Temple Road',
      correspondenceAddress: 'Krishna Vilas, Near Temple Road',
      city: 'Kozhikode',
      state: 'Kerala',
      pincode: '673001',
      courseExpectations: JSON.stringify([
        'Specialization in child behavioral therapy',
        'Parental counseling techniques',
        'Certification for school counseling'
      ]),
      educationHistory: JSON.stringify([
        { level: 'Post-Graduation', courseName: 'M.A. Applied Psychology', instituteName: 'Calicut University Campus', boardOrUniversity: 'University of Calicut', yearOfPassing: '2021', scoreOrPercentage: '82.0%' },
        { level: 'Graduation', courseName: 'B.A. Functional English & Psychology', instituteName: 'Farook College', boardOrUniversity: 'University of Calicut', yearOfPassing: '2019', scoreOrPercentage: '85.2%' }
      ])
    },
    {
      sNo: 4,
      name: 'Rohit Deshmukh',
      email: 'rohit.deshmukh@gmail.com',
      mobile: '9822194821',
      courseName: 'PG Diploma in Counselling Psychology & Clinical Skills',
      courseSlug: 'pg-diploma-in-counselling-psychology-clinical-skills',
      status: 'Pending',
      academicCounselor: 'Vikramaditya Rao',
      feeAmount: 89999,
      paymentStatus: 'Partial',
      batchName: 'Batch Oct-2026 PG-Diploma',
      dob: '1995-08-19',
      age: 31,
      gender: 'Male',
      maritalStatus: 'Married',
      nationality: 'Indian',
      aadharNumber: '5561-2940-1049',
      panNumber: 'DFGPD1092M',
      category: 'General',
      fatherName: 'Vilas Deshmukh',
      fatherMobile: '9822019283',
      permanentAddress: 'Flat 402, Shivam Residency, Kothrud',
      correspondenceAddress: 'Flat 402, Shivam Residency, Kothrud',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411038',
      courseExpectations: JSON.stringify([
        'Extensive 1-year clinical training',
        'Hospital internship readiness',
        'Diagnostic assessment proficiency'
      ]),
      educationHistory: JSON.stringify([
        { level: 'Graduation', courseName: 'B.A. Psychology', instituteName: 'Fergusson College', boardOrUniversity: 'Savitribai Phule Pune University', yearOfPassing: '2017', scoreOrPercentage: '76.8%' }
      ])
    },
    {
      sNo: 5,
      name: 'Ananya Sen Gupta',
      email: 'ananya.sengupta@outlook.com',
      mobile: '9830114920',
      courseName: 'Counsellor Entrepreneurship Program',
      courseSlug: 'counsellor-entrepreneurship-program',
      status: 'Enrolled',
      academicCounselor: 'Anand Prakash',
      feeAmount: 39999,
      paymentStatus: 'Paid',
      batchName: 'Batch Oct-2026 Entr',
      dob: '1991-03-30',
      age: 35,
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'Indian',
      aadharNumber: '3310-8849-2019',
      panNumber: 'AFRPS8831L',
      category: 'General',
      fatherName: 'Subir Sen Gupta',
      fatherMobile: '9830029381',
      permanentAddress: '18/2, Ballygunge Circular Road',
      correspondenceAddress: '18/2, Ballygunge Circular Road',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700019',
      courseExpectations: JSON.stringify([
        'Building private clinic business model',
        'Branding & legal compliance for psychologists',
        'Digital marketing for wellness clinics'
      ]),
      educationHistory: JSON.stringify([
        { level: 'Post-Graduation', courseName: 'M.A. Clinical Psychology', instituteName: 'Calcutta University', boardOrUniversity: 'University of Calcutta', yearOfPassing: '2016', scoreOrPercentage: '80.0%' }
      ])
    }
  ];

  for (const a of admissions) {
    await prisma.admission.create({ data: a });
  }

  await seedAlumni();
  console.log('Successfully seeded database counselindia_cms in PostgreSQL!');
  await prisma[""]();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
