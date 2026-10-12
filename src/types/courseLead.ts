export interface CourseLeadItem {
  id: string;
  sNo: number;
  liveId?: string;
  userId?: string | null;
  name: string;
  email: string;
  mobile: string;
  courseName: string;
  relationshipManager?: string;
  customerSuccessManager?: string;
  status: string; // 'New' | 'Contacted' | 'Enrolled' | 'Completed' | 'Inactive'
  notes?: string;
  source?: string;
  addedOn: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseLeadsResponse {
  success: boolean;
  data: CourseLeadItem[];
  counts: {
    all: number;
    new: number;
    contacted: number;
    enrolled: number;
    completed: number;
  };
  courses: string[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
