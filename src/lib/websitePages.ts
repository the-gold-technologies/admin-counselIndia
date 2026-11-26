/**
 * The fixed pages of the public website (counselIndia repo, src/app/**). Page SEO lists these
 * automatically so nobody has to type page addresses by hand — any other address (e.g. a new
 * landing page) can still be added as a custom page.
 *
 * `builtInTitle` is the title hard-coded in the website today. It is used when no SEO is saved
 * for the page here, so the admin can show what Google currently sees.
 * `hideFromGoogle` marks pages that normally should not appear in search (result / thank-you pages).
 *
 * When a page is added to the website, add it here too.
 */
export interface WebsitePage {
  path: string;
  name: string;
  group: WebsitePageGroup;
  builtInTitle?: string;
  hideFromGoogle?: boolean;
}

export type WebsitePageGroup =
  | "Main pages"
  | "Courses"
  | "Community"
  | "Tests & assessments"
  | "Forms"
  | "Policies"
  | "Result pages"
  | "Event pages";

export const PAGE_GROUPS: WebsitePageGroup[] = [
  "Main pages",
  "Courses",
  "Community",
  "Tests & assessments",
  "Forms",
  "Policies",
  "Result pages",
  "Event pages",
];

/** Reserved path of the site-wide defaults row. */
export const DEFAULTS_PATH = "*";

export const WEBSITE_PAGES: WebsitePage[] = [
  // Main pages
  {
    path: "/",
    name: "Home",
    group: "Main pages",
    builtInTitle: "Counsel India - Online Psychology Courses & Therapy",
  },
  {
    path: "/about",
    name: "About Us",
    group: "Main pages",
    builtInTitle: "About Us | Counsel India - Practical Psychology Learning Platform",
  },
  {
    path: "/contact-us",
    name: "Contact Us",
    group: "Main pages",
    builtInTitle: "Contact Us | Counsel India",
  },
  { path: "/blog", name: "Blog", group: "Main pages" },
  {
    path: "/news",
    name: "News & Media",
    group: "Main pages",
    builtInTitle: "News & Media | Counsel India",
  },
  {
    path: "/events",
    name: "Events & Workshops",
    group: "Main pages",
    builtInTitle: "Events & Workshops | Counsel India",
  },
  {
    path: "/faqs",
    name: "FAQs",
    group: "Main pages",
    builtInTitle: "Frequently Asked Questions | Counsel India",
  },
  {
    path: "/membership",
    name: "Membership",
    group: "Main pages",
    builtInTitle: "Counsel India Membership - Online Psychology & Emotional Wellbeing",
  },
  {
    path: "/ci-business",
    name: "CI for Business",
    group: "Main pages",
    builtInTitle: "CI for Business | Corporate Mental Wellness & Training | Counsel India",
  },
  {
    path: "/Har-Ghar-Counsellor",
    name: "Har Ghar Counsellor",
    group: "Main pages",
    builtInTitle: "Har Ghar Counsellor | Counsel India",
  },
  {
    path: "/refer-and-earn",
    name: "Refer and Earn",
    group: "Main pages",
    builtInTitle: "Refer and Earn Rewards up to ₹80,000 | Counsel India",
  },
  {
    path: "/careers",
    name: "Careers",
    group: "Main pages",
    builtInTitle: "Careers | Current Openings at Counsel India",
  },
  {
    path: "/career",
    name: "Career (old address)",
    group: "Main pages",
    builtInTitle: "Careers | Current Openings at Counsel India",
  },
  {
    path: "/support",
    name: "Support",
    group: "Main pages",
    builtInTitle: "Counsel India Support Services | Counsel India",
  },
  { path: "/ebook", name: "E-book", group: "Main pages" },
  { path: "/newsletter", name: "Newsletter", group: "Main pages" },

  // Courses
  {
    path: "/all-courses-list",
    name: "All Courses",
    group: "Courses",
    builtInTitle: "Live Courses and Programs | Counsel India",
  },
  { path: "/growth-courses", name: "Growth Courses", group: "Courses" },

  // Community
  {
    path: "/alumni",
    name: "Alumni",
    group: "Community",
    builtInTitle: "Counsel India Alumni | Join the Community of Learners",
  },
  {
    path: "/learners-network",
    name: "Learners Network",
    group: "Community",
    builtInTitle: "Alumni Network | Counsel India",
  },
  { path: "/counsellors-network", name: "Counsellors Network", group: "Community" },
  {
    path: "/success-stories",
    name: "Success Stories",
    group: "Community",
    builtInTitle: "Success Stories | Counsel India",
  },

  // Tests & assessments
  { path: "/mentalhealthtest", name: "Mental Health Tests", group: "Tests & assessments" },
  {
    path: "/eligibility-test",
    name: "Eligibility Test",
    group: "Tests & assessments",
    builtInTitle: "Eligibility Test | Personality Assessment | Counsel India",
  },
  {
    path: "/personality_test1",
    name: "Personality Test",
    group: "Tests & assessments",
    builtInTitle: "Personality Test | Eligibility Assessment | Counsel India",
  },
  {
    path: "/mental_test1",
    name: "Emotional Well-Being Test",
    group: "Tests & assessments",
    builtInTitle: "Emotional Well-Being Test | Counsel India",
  },
  {
    path: "/mental_test2",
    name: "Quality of Life Test",
    group: "Tests & assessments",
    builtInTitle: "Quality of Life Test | Counsel India",
  },
  {
    path: "/mental_test3",
    name: "General Health Questionnaire",
    group: "Tests & assessments",
    builtInTitle: "General Health Questionnaire | Counsel India",
  },

  // Forms
  {
    path: "/ask-question",
    name: "Ask a Question",
    group: "Forms",
    builtInTitle: "Ask a Question | Counsel India",
  },
  {
    path: "/counsellor-registration",
    name: "Counsellor Registration",
    group: "Forms",
    builtInTitle: "Counsellor Registration | Counsel India",
  },
  {
    path: "/mentor-registration",
    name: "Mentor Registration",
    group: "Forms",
    builtInTitle: "Counsellor Registration | Counsel India",
  },
  {
    path: "/grievance-from",
    name: "Grievance Form",
    group: "Forms",
    builtInTitle: "Grievance Form | Counsel India",
  },

  // Policies
  {
    path: "/privacy-policy",
    name: "Privacy Policy",
    group: "Policies",
    builtInTitle: "Privacy Policy | Counsel India",
  },
  {
    path: "/terms-and-conditions",
    name: "Terms & Conditions",
    group: "Policies",
    builtInTitle: "Terms & Conditions | Counsel India",
  },
  {
    path: "/refund-policy",
    name: "Refund Policy",
    group: "Policies",
    builtInTitle: "Refund Policy | Counsel India",
  },
  {
    path: "/academic-policy",
    name: "Academic Policy",
    group: "Policies",
    builtInTitle: "Academic Policy | Counsel India",
  },

  // Result pages — personal results, normally hidden from Google
  {
    path: "/personality-test/success",
    name: "Personality Test Result",
    group: "Result pages",
    builtInTitle: "Personality Assessment Result | Counsel India",
    hideFromGoogle: true,
  },
  {
    path: "/mentaltest1/success",
    name: "Emotional Well-Being Result",
    group: "Result pages",
    builtInTitle: "Emotional Well-Being Test Result | Counsel India",
    hideFromGoogle: true,
  },
  {
    path: "/mentaltest2/success",
    name: "Quality of Life Result",
    group: "Result pages",
    builtInTitle: "Quality of Life Test Result | Counsel India",
    hideFromGoogle: true,
  },
  {
    path: "/mentaltest3/success",
    name: "General Health Result",
    group: "Result pages",
    builtInTitle: "General Health Test Result | Counsel India",
    hideFromGoogle: true,
  },
  {
    path: "/mental_test1/success",
    name: "Emotional Well-Being Result (alt)",
    group: "Result pages",
    builtInTitle: "Emotional Well-Being Test Result | Counsel India",
    hideFromGoogle: true,
  },
  {
    path: "/mental_test2/success",
    name: "Quality of Life Result (alt)",
    group: "Result pages",
    builtInTitle: "Quality of Life Test Result | Counsel India",
    hideFromGoogle: true,
  },
  {
    path: "/mental_test3/success",
    name: "General Health Result (alt)",
    group: "Result pages",
    builtInTitle: "General Health Test Result | Counsel India",
    hideFromGoogle: true,
  },
];

/**
 * Event pages of the website. Events are written in the website code
 * (counselIndia → src/components/events/data/eventsData.ts) and have no admin form, so each
 * event is listed here and gets its own SEO in Page SEO. Add new events here too.
 */
export const EVENT_PAGES: WebsitePage[] = [
  {
    path: "/events/masterclass-on-relationship-psychology",
    name: "Masterclass on Relationship Psychology",
    group: "Event pages",
    builtInTitle: "Masterclass on Relationship Psychology | Counsel India Events",
  },
  {
    path: "/events/emotional-well-being-and-happiness",
    name: "Emotional Well-Being and Happiness",
    group: "Event pages",
    builtInTitle: "Emotional Well-Being and Happiness | Counsel India Events",
  },
  {
    path: "/events/3-day-live-online-bootcamp-on-self-healing-live-a-happy-life",
    name: "3-Day LIVE & Online Bootcamp on Self-Healing & Live a Happy Life!",
    group: "Event pages",
    builtInTitle:
      "3-Day LIVE & Online Bootcamp on Self-Healing & Live a Happy Life! | Counsel India Events",
  },
  {
    path: "/events/skills-required-to-become-a-counsellor",
    name: "Skills Required to become a Counsellor",
    group: "Event pages",
    builtInTitle: "Skills Required to become a Counsellor | Counsel India Events",
  },
  {
    path: "/events/one-day-at-counsel-india",
    name: "One Day at Counsel India",
    group: "Event pages",
    builtInTitle: "One Day at Counsel India | Counsel India Events",
  },
  {
    path: "/events/master-emotional-well-being-and-happiness",
    name: "Master Emotional Well-being and Happiness",
    group: "Event pages",
    builtInTitle: "Master Emotional Well-being and Happiness | Counsel India Events",
  },
  {
    path: "/events/become-a-counsellor-guarantee-10x-growth-in-life",
    name: "Become a counsellor & guarantee 10x growth in life",
    group: "Event pages",
    builtInTitle: "Become a counsellor & guarantee 10x growth in life | Counsel India Events",
  },
  {
    path: "/events/competitive-exam-with-healthy-mind-booster-program",
    name: "Competitive Exam with Healthy Mind - Booster Program",
    group: "Event pages",
    builtInTitle: "Competitive Exam with Healthy Mind - Booster Program | Counsel India Events",
  },
  {
    path: "/events/workshop-on-nurturing-attachment-in-your-child-with-expressive-art",
    name: "Workshop on Nurturing Attachment in Your Child with Expressive Art!",
    group: "Event pages",
    builtInTitle:
      "Workshop on Nurturing Attachment in Your Child with Expressive Art! | Counsel India Events",
  },
  {
    path: "/events/how-to-upskill-your-career-in-the-field-of-psychology-and-earn-in-6-figures",
    name: "How to Upskill your Career in the field of psychology and Earn in 6 figures",
    group: "Event pages",
    builtInTitle:
      "How to Upskill your Career in the field of psychology and Earn in 6 figures | Counsel India Events",
  },
  {
    path: "/events/emotional-intelligence-through-expressive-art",
    name: "Emotional Intelligence through Expressive ART",
    group: "Event pages",
    builtInTitle: "Emotional Intelligence through Expressive ART | Counsel India Events",
  },
  {
    path: "/events/how-to-become-a-successful-counsellor-10x-your-income",
    name: "How To Become A Successful Counsellor & 10X Your Income",
    group: "Event pages",
    builtInTitle: "How To Become A Successful Counsellor & 10X Your Income | Counsel India Events",
  },
  {
    path: "/events/roadmap-to-become-a-successful-counsellor-5x-your-earning",
    name: "Roadmap to become a successful counsellor, 5x\\u00a0your\\u00a0earning",
    group: "Event pages",
    builtInTitle:
      "Roadmap to become a successful counsellor, 5x\\u00a0your\\u00a0earning | Counsel India Events",
  },
  {
    path: "/events/emotional-wellbeing-and-happiness",
    name: "Emotional Wellbeing and Happiness",
    group: "Event pages",
    builtInTitle: "Emotional Wellbeing and Happiness | Counsel India Events",
  },
  {
    path: "/events/start-your-career-in-psychology-5x-your-growth",
    name: "Start Your Career in Psychology & 5x Your Growth",
    group: "Event pages",
    builtInTitle: "Start Your Career in Psychology & 5x Your Growth | Counsel India Events",
  },
  {
    path: "/events/how-to-grow-as-a-counsellor-and-earn-7lpa",
    name: "How to grow as a Counsellor and earn 7LPA",
    group: "Event pages",
    builtInTitle: "How to grow as a Counsellor and earn 7LPA | Counsel India Events",
  },
  {
    path: "/events/counsellor-se-charcha-episode-2",
    name: "Counsellor Se Charcha - Episode 2",
    group: "Event pages",
    builtInTitle: "Counsellor Se Charcha - Episode 2 | Counsel India Events",
  },
  {
    path: "/events/step-by-step-process-to-become-counsellor-and-earn-at-least-7-lpa",
    name: "Step by Step process to become Counsellor and earn at least 7 LPA",
    group: "Event pages",
    builtInTitle:
      "Step by Step process to become Counsellor and earn at least 7 LPA | Counsel India Events",
  },
  {
    path: "/events/counsellor-se-charcha",
    name: "Counsellor Se Charcha",
    group: "Event pages",
    builtInTitle: "Counsellor Se Charcha | Counsel India Events",
  },
  {
    path: "/events/become-a-counsellor-and-guarantee-10x-growth-in-life",
    name: "Become a Counsellor and Guarantee 10X Growth in Life",
    group: "Event pages",
    builtInTitle: "Become a Counsellor and Guarantee 10X Growth in Life | Counsel India Events",
  },
  {
    path: "/events/how-to-grow-as-a-counsellor-and-earn-50k-month",
    name: "How to grow as a Counsellor and earn 50K/month",
    group: "Event pages",
    builtInTitle: "How to grow as a Counsellor and earn 50K/month | Counsel India Events",
  },
  {
    path: "/events/manage-your-day-to-day-life",
    name: "Manage your day to day life",
    group: "Event pages",
    builtInTitle: "Manage your day to day life | Counsel India Events",
  },
  {
    path: "/events/successful-counsellor",
    name: "How to become a successful counsellor and 10x your income",
    group: "Event pages",
    builtInTitle:
      "How to become a successful counsellor and 10x your income | Counsel India Events",
  },
  {
    path: "/events/crack-competitive-exams-with-a-healthy-mind-exclusive-bootcamp",
    name: "Crack Competitive Exams with a Healthy Mind : Exclusive Bootcamp!",
    group: "Event pages",
    builtInTitle:
      "Crack Competitive Exams with a Healthy Mind : Exclusive Bootcamp! | Counsel India Events",
  },
];

/**
 * Pages built per item. Their SEO is saved in Page SEO under these addresses (one row per item,
 * e.g. /course/therapy-master-course or /counsellors-details/94 — counsellors by their ID).
 * Items with nothing saved use their name & description. Blog posts keep their own SEO in Blogs.
 */
export const ITEM_PAGE_GROUPS: { prefix: string; group: ItemPageGroup; example: string }[] = [
  { prefix: "/course/", group: "Course pages", example: "/course/therapy-master-course" },
  {
    prefix: "/counsellors-details/",
    group: "Counsellor pages",
    example: "/counsellors-details/94",
  },
];
export type ItemPageGroup = "Course pages" | "Counsellor pages";

export const itemGroupFor = (path: string): ItemPageGroup | null =>
  ITEM_PAGE_GROUPS.find((g) => path.startsWith(g.prefix))?.group || null;

/**
 * Shown under the Page SEO list: one page per item, each with its OWN SEO entry.
 * `key` is where that SEO is stored, so no two items ever share SEO.
 */
export const DYNAMIC_PAGES: {
  path: string;
  name: string;
  managedIn: string;
  key: string;
  href: string;
}[] = [
  {
    path: "/blog-detail/…",
    name: "Blog posts",
    managedIn: "SEO section of each post (Blogs → edit post).",
    key: "Saved on the post itself",
    href: "/blogs",
  },
  {
    path: "/course/…",
    name: "Course pages",
    managedIn: "SEO tab of each course (Courses → edit → SEO).",
    key: "/course/<course web address>",
    href: "/courses",
  },
  {
    path: "/counsellors-details/…",
    name: "Counsellor pages",
    managedIn: "SEO section of each counsellor's form (Manage Counsellors → edit).",
    key: "/counsellors-details/<counsellor ID>",
    href: "/counsellors",
  },
];

export const ALL_WEBSITE_PAGES: WebsitePage[] = [...WEBSITE_PAGES, ...EVENT_PAGES];

export const findWebsitePage = (path: string) => ALL_WEBSITE_PAGES.find((p) => p.path === path);
