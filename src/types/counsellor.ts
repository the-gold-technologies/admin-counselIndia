export interface CounselorItem {
  id: string;
  sNo?: number;
  liveId?: string;
  name: string;
  email: string;
  mobile: string;
  password?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  designation?: string | null;
  language?: string | null;
  education?: string | null;
  experience?: string | null;
  specialty?: string | null;
  specialty2?: string | null;
  expertise?: string | null;
  rciNumber?: string | null;

  image?: string | null;
  identityImage?: string | null;
  qualificationProof?: string | null;
  cvUrl?: string | null;

  bankName?: string | null;
  accountNumber?: string | null;
  ifscCode?: string | null;
  accountType?: string | null;
  accountHolderName?: string | null;

  userType?: string | null;
  isApproved: boolean;
  isOnline: boolean;
  videoStatus?: boolean;
  videoPrice?: number;
  audioStatus?: boolean;
  audioPrice?: number;
  chatStatus?: boolean;
  chatPrice?: number;
  expectedCharges?: number;
  councellFees?: number;
  commission?: number;
  position?: number;

  about?: string | null;
  achievements?: string | null;
  whatBringsYou?: string | null;

  status: string; // "Active" | "Inactive"
  forCourse?: string | null;
  personalCounselling?: string | null;

  addedOn?: string | null;
  updatedOn?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
