export interface SubModuleItem {
  title: string;
  type?: string;
  position?: string | number;
  status?: string;
  image?: string;
}

export interface DynamicHeading {
  heading: string;
  value: string;
}

export interface Course {
  id: string;
  sNo?: number;
  liveId?: string;
  name: string;
  slug: string;
  coverImage?: string | null;
  backgroundImage?: string | null;
  coverImageApp?: string | null;
  backgroundImageApp?: string | null;
  brochure?: string | null;
  scSchemePdf?: string | null;
  duration?: string | null;
  listDuration?: string | null;
  enrolmentSeats?: string | null;
  lessons?: string | null;
  description?: string | null;
  subdescription?: string | null;
  aboutUs?: string | null;
  mepscAbout?: string | null;
  universityAdvantage?: string | null;
  howWillBenefit?: string | null;
  ojt?: string | null;
  mentorshipGuide?: string | null;
  dreamJob?: string | null;
  whoCanJoin?: string | null;
  badgeText?: string | null;
  badgeBg?: string | null;
  rating?: number | null;
  price?: number | null;
  totalProgramFee?: string | null;
  totalDiscountFee?: string | null;
  totalDiscountPercent?: string | null;
  oneTimeFee?: string | null;
  oneTimeDiscountFee?: string | null;
  oneTimeDiscountPercent?: string | null;
  startRange?: string | null;
  endRange?: string | null;
  paymentLink?: string | null;
  nextBatchDate?: string | null;
  headings?: DynamicHeading[];
  cheadings?: DynamicHeading[];
  position: number;
  category?: string | null;
  status: "Active" | "Inactive" | string;
  isActive: boolean;
  addedOn?: string | null;
  overviewCount: number;
  learnCount: number;
  credentialCount: number;
  curriculumCount: number;
  overviewData?: SubModuleItem[];
  learnData?: SubModuleItem[];
  credentialData?: SubModuleItem[];
  curriculumData?: SubModuleItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseStats {
  total: number;
  active: number;
  inactive: number;
  categoriesCount: number;
  categories: { name: string; count: number }[];
}
