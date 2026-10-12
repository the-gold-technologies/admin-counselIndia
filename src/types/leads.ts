export interface InquiryLeadItem {
  id: string;
  sNo?: number | null;
  liveId?: string | null;
  category: string;
  name?: string | null;
  email?: string | null;
  mobile?: string | null;
  countryCode?: string | null;
  state?: string | null;
  city?: string | null;
  medium?: string | null;
  source?: string | null;
  content?: string | null;
  message?: string | null;
  hearFrom?: string | null;
  courseType?: string | null;
  courseName?: string | null;
  extraData?: any;
  addedOn?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadSubtabMeta {
  id: string; // db category
  slug: string; // url slug
  title: string;
  description: string;
  columns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[];
}

export const LEAD_SUBTABS_CONFIG: Record<string, LeadSubtabMeta> = {
  'subscribe': {
    id: 'subscription',
    slug: 'subscribe',
    title: 'Subscribe',
    description: 'Newsletter and direct subscriber inquiries',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Phone Number' },
      { key: 'medium', label: 'Medium' },
      { key: 'addedOn', label: 'Created At', align: 'right' },
    ],
  },
  'landing-pages': {
    id: 'landing-page',
    slug: 'landing-pages',
    title: 'Landing Pages',
    description: 'Leads captured from marketing landing pages',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Phone Number' },
      { key: 'medium', label: 'Medium' },
      { key: 'addedOn', label: 'Created At', align: 'right' },
    ],
  },
  'exit-intent': {
    id: 'exit-intent',
    slug: 'exit-intent',
    title: 'Exit Intent',
    description: 'Leads captured through exit popup triggers',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Phone Number' },
      { key: 'medium', label: 'Medium' },
      { key: 'addedOn', label: 'Created At', align: 'right' },
    ],
  },
  'contact-us': {
    id: 'contact-us',
    slug: 'contact-us',
    title: 'Contact Us',
    description: 'Inquiries submitted through the contact us page',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'message', label: 'Message' },
      { key: 'hearFrom', label: 'Hear From' },
      { key: 'addedOn', label: 'Created At', align: 'right' },
    ],
  },
  'book-session': {
    id: 'book-session',
    slug: 'book-session',
    title: 'Book a Session',
    description: 'One-on-one counseling session bookings',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'countryCode', label: 'Country Code' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'state', label: 'State' },
      { key: 'city', label: 'City' },
      { key: 'hearFrom', label: 'Hear From' },
      { key: 'addedOn', label: 'Created At', align: 'right' },
    ],
  },
  'ci-business': {
    id: 'ci-business',
    slug: 'ci-business',
    title: 'Ci For Business',
    description: 'Corporate B2B and institutional partnership requests',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'email', label: 'Email' },
      { key: 'message', label: 'Message' },
      { key: 'source', label: 'Source' },
      { key: 'addedOn', label: 'Date', align: 'right' },
    ],
  },
  'personality-test': {
    id: 'personality-test',
    slug: 'personality-test',
    title: 'Personality Test',
    description: 'Free personality and mental health test submissions',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'gender', label: 'Gender' },
      { key: 'age', label: 'Age' },
      { key: 'proBackground', label: 'Pro Background' },
      { key: 'purpose', label: 'Purpose Give Test' },
      { key: 'state', label: 'State' },
      { key: 'addedOn', label: 'Date', align: 'right' },
    ],
  },
  'ebook': {
    id: 'ebook',
    slug: 'ebook',
    title: 'Ebook',
    description: 'Educational resources and ebook downloads',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'courseType', label: 'Course Type' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'hearFrom', label: 'Here From' },
      { key: 'ebookName', label: 'Ebook Name' },
      { key: 'addedOn', label: 'Date', align: 'right' },
    ],
  },
  'newsletter': {
    id: 'newsletter',
    slug: 'newsletter',
    title: 'Newsletter',
    description: 'Counsel India weekly newsletter subscribers',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'medium', label: 'Type' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'newsletterName', label: 'Newsletter Name' },
      { key: 'addedOn', label: 'Date', align: 'right' },
    ],
  },
  'courses-enquiry': {
    id: 'courses-enquiry',
    slug: 'courses-enquiry',
    title: 'Courses Enquiry',
    description: 'Course specific inquiries and brochure downloads',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'courseType', label: 'Course Type' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'hearFrom', label: 'Here From' },
      { key: 'courseName', label: 'Ebook Name' },
      { key: 'addedOn', label: 'Date', align: 'right' },
    ],
  },
  'utm-data': {
    id: 'utm-data',
    slug: 'utm-data',
    title: 'utm data',
    description: 'Campaign source tracking and UTM parameters',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'courseName', label: 'Course ID' },
      { key: 'source', label: 'Source' },
      { key: 'medium', label: 'Medium' },
      { key: 'content', label: 'Content' },
      { key: 'name', label: 'User Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'addedOn', label: 'Updated At', align: 'right' },
    ],
  },
  'landing-page-utm': {
    id: 'landing-page-utm',
    slug: 'landing-page-utm',
    title: 'Landing Page UTM',
    description: 'Landing page campaign conversion tracking',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'courseName', label: 'Course ID' },
      { key: 'source', label: 'Source' },
      { key: 'medium', label: 'Medium' },
      { key: 'content', label: 'Content' },
      { key: 'name', label: 'User Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'addedOn', label: 'Updated At', align: 'right' },
    ],
  },
  'course-registration': {
    id: 'course-registration',
    slug: 'course-registration',
    title: 'course registeration',
    description: 'Online course enrollment application submissions',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'User Details' },
      { key: 'courseName', label: 'Course' },
      { key: 'addedOn', label: 'Date', align: 'right' },
    ],
  },
  'ask-question': {
    id: 'ask-question',
    slug: 'ask-question',
    title: 'Ask Question',
    description: 'Q&A submissions answered by psychologist panel',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'message', label: 'Question' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'hearFrom', label: 'Here From' },
      { key: 'addedOn', label: 'Created at', align: 'right' },
    ],
  },
  'app-data': {
    id: 'app-data',
    slug: 'app-data',
    title: 'App Data',
    description: 'Mobile app downloads and user signups',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'addedOn', label: 'Created at', align: 'right' },
    ],
  },
  'certificate-data': {
    id: 'certificate-data',
    slug: 'certificate-data',
    title: 'certificate_data',
    description: 'Issued course certificates and verification records',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'User Name' },
      { key: 'courseName', label: 'Course Name' },
      { key: 'marks', label: 'Marks' },
      { key: 'email', label: 'Recipient Email' },
      { key: 'certificateType', label: 'Certificate Type' },
      { key: 'viewPath', label: 'View Path' },
      { key: 'addedOn', label: 'Created at', align: 'right' },
    ],
  },
  'leadform-data': {
    id: 'leadform-data',
    slug: 'leadform-data',
    title: 'leadform data',
    description: 'Dynamic lead forms and referred candidate submissions',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'countryCode', label: 'Country Code' },
      { key: 'state', label: 'State' },
      { key: 'city', label: 'City' },
      { key: 'courseName', label: 'Program' },
      { key: 'referByName', label: 'Refer By Name' },
      { key: 'referByEmail', label: 'Refer By Email' },
    ],
  },
  'refer-enquiry': {
    id: 'refer-enquiry',
    slug: 'refer-enquiry',
    title: 'Refer Enquiry',
    description: 'Refer & Earn submissions and rewards tracking',
    columns: [
      { key: 'sNo', label: 'S.No', align: 'center' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'referByName', label: 'Refer By Name' },
      { key: 'referByEmail', label: 'Refer By Email' },
      { key: 'referByPhone', label: 'Refer By Phone' },
      { key: 'courseRefer', label: 'Course Refer' },
      { key: 'addedOn', label: 'Date', align: 'right' },
    ],
  },
};
