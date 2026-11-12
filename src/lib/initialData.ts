export interface AdmissionItem {
  id: string;
  sNo: number;
  name: string;
  email: string;
  mobile: string;
  courseName: string;
  courseSlug: string;
  admissionDate: string;
  status: "Enrolled" | "Pending" | "Verified" | "Completed" | "Dropped";
  academicCounselor: string;
  feeAmount: number;
  paymentStatus: "Paid" | "Partial" | "Pending";
  batchName: string;
  personalDetails: {
    dob: string;
    age: number;
    gender: string;
    maritalStatus: string;
    nationality: string;
    aadharNumber: string;
    panNumber: string;
    category: string;
    fatherName: string;
    fatherMobile: string;
  };
  address: {
    permanent: string;
    correspondence: string;
    city: string;
    state: string;
    pincode: string;
  };
  courseExpectations: string[];
  educationHistory: {
    level: string;
    courseName: string;
    instituteName: string;
    boardOrUniversity: string;
    yearOfPassing: string;
    scoreOrPercentage: string;
  }[];
}

export const INITIAL_COURSES = [
  {
    id: "c1",
    name: "Counselling Master Course - Foundation",
    slug: "counselling-master-course-foundation",
    duration: "3 Months",
    price: 24999,
  },
  {
    id: "c2",
    name: "Counselling Master Course - Intermediate",
    slug: "counselling-master-course-intermediate",
    duration: "6 Months",
    price: 44999,
  },
  {
    id: "c3",
    name: "Counselling Master Course - Advanced",
    slug: "counselling-master-course-advanced",
    duration: "9 Months",
    price: 64999,
  },
  {
    id: "c4",
    name: "Diploma in Child Psychology and Parenting",
    slug: "diploma-in-child-psychology-and-parenting",
    duration: "6 Months",
    price: 34999,
  },
  {
    id: "c5",
    name: "Certificate in Child Psychology",
    slug: "certificate-in-child-psychology",
    duration: "3 Months",
    price: 19999,
  },
  {
    id: "c6",
    name: "PG Diploma in Counselling Psychology & Clinical Skills",
    slug: "pg-diploma-in-counselling-psychology-clinical-skills",
    duration: "12 Months",
    price: 89999,
  },
  {
    id: "c7",
    name: "Business Growth Master Course",
    slug: "business-growth-master-course",
    duration: "4 Months",
    price: 29999,
  },
  {
    id: "c8",
    name: "Counsellor Entrepreneurship Program",
    slug: "counsellor-entrepreneurship-program",
    duration: "6 Months",
    price: 39999,
  },
];

export const INITIAL_COUNSELORS = [
  "Anand Prakash",
  "Dr. Suhani Saleem",
  "Pooja Sharma",
  "Vikramaditya Rao",
  "Meenakshi Sundaram",
  "Rahul Verma",
];

export const INITIAL_ADMISSIONS: AdmissionItem[] = [
  {
    id: "adm-2046",
    sNo: 1,
    name: "Sample Student 1",
    email: "student1@example.com",
    mobile: "9000000001",
    courseName: "Counselling Master Course - Intermediate",
    courseSlug: "counselling-master-course-intermediate",
    admissionDate: "2026-10-08 11:39 AM",
    status: "Enrolled",
    academicCounselor: "Anand Prakash",
    feeAmount: 44999,
    paymentStatus: "Paid",
    batchName: "Batch Oct-2026 Alpha",
    personalDetails: {
      dob: "1995-01-01",
      age: 37,
      gender: "Female",
      maritalStatus: "Married",
      nationality: "Indian",
      aadharNumber: "XXXX-XXXX-1001",
      panNumber: "ABCDE1001F",
      category: "General",
      fatherName: "Sample Parent 1",
      fatherMobile: "9000000101",
    },
    address: {
      permanent: "1, Sample Street",
      correspondence: "1, Sample Street",
      city: "Dakshina Kannada",
      state: "Karnataka",
      pincode: "000000",
    },
    courseExpectations: [
      "Upskilling & clinical mastery",
      "Improve personal capability of handling complex life situations",
      "Creating social impact & give back to the society",
      "Promotion / Appraisal in existing role",
      "Start private therapy practice",
    ],
    educationHistory: [
      {
        level: "Post-Graduation",
        courseName: "M.Sc Psychology",
        instituteName: "Mangalore University",
        boardOrUniversity: "Mangalore University",
        yearOfPassing: "2013",
        scoreOrPercentage: "78.5%",
      },
      {
        level: "Graduation",
        courseName: "B.A. Psychology & Sociology",
        instituteName: "St. Aloysius College",
        boardOrUniversity: "Mangalore University",
        yearOfPassing: "2010",
        scoreOrPercentage: "81.2%",
      },
      {
        level: "12th Standard",
        courseName: "Higher Secondary (Science)",
        instituteName: "Canara PU College",
        boardOrUniversity: "Karnataka State PU Board",
        yearOfPassing: "2007",
        scoreOrPercentage: "84.0%",
      },
      {
        level: "10th Standard",
        courseName: "SSLC",
        instituteName: "Govt High School",
        boardOrUniversity: "KSEEB",
        yearOfPassing: "2005",
        scoreOrPercentage: "86.4%",
      },
    ],
  },
  {
    id: "adm-2045",
    sNo: 2,
    name: "Sample Student 2",
    email: "student2@example.com",
    mobile: "9000000002",
    courseName: "Counselling Master Course - Foundation",
    courseSlug: "counselling-master-course-foundation",
    admissionDate: "2026-10-07 07:40 PM",
    status: "Enrolled",
    academicCounselor: "Dr. Suhani Saleem",
    feeAmount: 24999,
    paymentStatus: "Paid",
    batchName: "Batch Oct-2026 Foundation",
    personalDetails: {
      dob: "1995-01-01",
      age: 33,
      gender: "Male",
      maritalStatus: "Single",
      nationality: "Indian",
      aadharNumber: "XXXX-XXXX-1002",
      panNumber: "ABCDE1002F",
      category: "OBC",
      fatherName: "Sample Parent 2",
      fatherMobile: "9000000102",
    },
    address: {
      permanent: "2, Sample Street",
      correspondence: "2, Sample Street",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "000000",
    },
    courseExpectations: [
      "Transitioning into mental health counselling",
      "Understanding psychological disorders & diagnosis",
      "Practical client therapy simulation",
    ],
    educationHistory: [
      {
        level: "Graduation",
        courseName: "B.Sc Visual Communication",
        instituteName: "Loyola College",
        boardOrUniversity: "University of Madras",
        yearOfPassing: "2015",
        scoreOrPercentage: "74.0%",
      },
      {
        level: "12th Standard",
        courseName: "HSC",
        instituteName: "Don Bosco School",
        boardOrUniversity: "Tamil Nadu State Board",
        yearOfPassing: "2011",
        scoreOrPercentage: "79.5%",
      },
    ],
  },
  {
    id: "adm-2044",
    sNo: 3,
    name: "Sample Student 3",
    email: "student3@example.com",
    mobile: "9000000003",
    courseName: "Diploma in Child Psychology and Parenting",
    courseSlug: "diploma-in-child-psychology-and-parenting",
    admissionDate: "2026-10-06 02:06 AM",
    status: "Verified",
    academicCounselor: "Pooja Sharma",
    feeAmount: 34999,
    paymentStatus: "Paid",
    batchName: "Batch Oct-2026 Child-Psy",
    personalDetails: {
      dob: "1995-01-01",
      age: 28,
      gender: "Female",
      maritalStatus: "Single",
      nationality: "Indian",
      aadharNumber: "XXXX-XXXX-1003",
      panNumber: "ABCDE1003F",
      category: "General",
      fatherName: "Sample Parent 3",
      fatherMobile: "9000000103",
    },
    address: {
      permanent: "3, Sample Street",
      correspondence: "3, Sample Street",
      city: "Kozhikode",
      state: "Kerala",
      pincode: "000000",
    },
    courseExpectations: [
      "Specialization in child behavioral therapy",
      "Parental counseling techniques",
      "Certification for school counseling",
    ],
    educationHistory: [
      {
        level: "Post-Graduation",
        courseName: "M.A. Applied Psychology",
        instituteName: "Calicut University Campus",
        boardOrUniversity: "University of Calicut",
        yearOfPassing: "2021",
        scoreOrPercentage: "82.0%",
      },
      {
        level: "Graduation",
        courseName: "B.A. Functional English & Psychology",
        instituteName: "Farook College",
        boardOrUniversity: "University of Calicut",
        yearOfPassing: "2019",
        scoreOrPercentage: "85.2%",
      },
    ],
  },
  {
    id: "adm-2043",
    sNo: 4,
    name: "Sample Student 4",
    email: "student4@example.com",
    mobile: "9000000004",
    courseName: "PG Diploma in Counselling Psychology & Clinical Skills",
    courseSlug: "pg-diploma-in-counselling-psychology-clinical-skills",
    admissionDate: "2026-10-05 04:15 PM",
    status: "Pending",
    academicCounselor: "Vikramaditya Rao",
    feeAmount: 89999,
    paymentStatus: "Partial",
    batchName: "Batch Oct-2026 PG-Diploma",
    personalDetails: {
      dob: "1995-01-01",
      age: 31,
      gender: "Male",
      maritalStatus: "Married",
      nationality: "Indian",
      aadharNumber: "XXXX-XXXX-1004",
      panNumber: "ABCDE1004F",
      category: "General",
      fatherName: "Sample Parent 4",
      fatherMobile: "9000000104",
    },
    address: {
      permanent: "4, Sample Street",
      correspondence: "4, Sample Street",
      city: "Pune",
      state: "Maharashtra",
      pincode: "000000",
    },
    courseExpectations: [
      "Extensive 1-year clinical training",
      "Hospital internship readiness",
      "Diagnostic assessment proficiency",
    ],
    educationHistory: [
      {
        level: "Graduation",
        courseName: "B.A. Psychology",
        instituteName: "Fergusson College",
        boardOrUniversity: "Savitribai Phule Pune University",
        yearOfPassing: "2017",
        scoreOrPercentage: "76.8%",
      },
    ],
  },
  {
    id: "adm-2042",
    sNo: 5,
    name: "Sample Student 5",
    email: "student5@example.com",
    mobile: "9000000005",
    courseName: "Counsellor Entrepreneurship Program",
    courseSlug: "counsellor-entrepreneurship-program",
    admissionDate: "2026-10-04 10:20 AM",
    status: "Enrolled",
    academicCounselor: "Anand Prakash",
    feeAmount: 39999,
    paymentStatus: "Paid",
    batchName: "Batch Oct-2026 Entr",
    personalDetails: {
      dob: "1995-01-01",
      age: 35,
      gender: "Female",
      maritalStatus: "Single",
      nationality: "Indian",
      aadharNumber: "XXXX-XXXX-1005",
      panNumber: "ABCDE1005F",
      category: "General",
      fatherName: "Sample Parent 5",
      fatherMobile: "9000000105",
    },
    address: {
      permanent: "5, Sample Street",
      correspondence: "5, Sample Street",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "000000",
    },
    courseExpectations: [
      "Building private clinic business model",
      "Branding & legal compliance for psychologists",
      "Digital marketing for wellness clinics",
    ],
    educationHistory: [
      {
        level: "Post-Graduation",
        courseName: "M.A. Clinical Psychology",
        instituteName: "Calcutta University",
        boardOrUniversity: "University of Calcutta",
        yearOfPassing: "2016",
        scoreOrPercentage: "80.0%",
      },
    ],
  },
];
