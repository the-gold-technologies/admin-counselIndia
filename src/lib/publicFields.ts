/**
 * Field allowlists for data served to the public website (unauthenticated callers).
 * Anything not listed here (contact details, bank details, ID documents, passwords...)
 * is only ever returned to logged-in admins.
 */

export const PUBLIC_COUNSELOR_SELECT = {
  id: true,
  sNo: true,
  liveId: true,
  name: true,
  city: true,
  country: true,
  designation: true,
  language: true,
  education: true,
  experience: true,
  specialty: true,
  specialty2: true,
  expertise: true,
  image: true,
  userType: true,
  isApproved: true,
  isOnline: true,
  isFeatured: true,
  videoStatus: true,
  videoPrice: true,
  audioStatus: true,
  audioPrice: true,
  chatStatus: true,
  chatPrice: true,
  expectedCharges: true,
  councellFees: true,
  position: true,
  about: true,
  achievements: true,
  whatBringsYou: true,
  status: true,
  forCourse: true,
  personalCounselling: true,
} as const;

export const PUBLIC_ALUMNI_SELECT = {
  id: true,
  sNo: true,
  name: true,
  image: true,
  programName: true,
  certificateNumber: true,
  profession: true,
  skills: true,
  isOnline: true,
  status: true,
  isApproved: true,
} as const;
