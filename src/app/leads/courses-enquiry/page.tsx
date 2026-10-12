import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LeadsTable, { ColDef } from '@/components/leads/LeadsTable';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Course Enquiry List | Counsel India Admin',
  description: 'Student course inquiries and counseling requests',
};

const COLUMNS: ColDef[] = [
  { key: 'sNo', label: 'S.No', align: 'center' as const },
  { key: 'courseType', label: 'Course Type' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'addedOn', label: 'Date' },
  { key: 'hearFrom', label: 'Here From' },
  { key: 'courseName', label: 'Ebook Name', align: 'right' as const },
];

export default function CourseEnquiryListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#f97316' }} />
        </div>
      }
    >
      <LeadsTable
        category="courses-enquiry"
        title="Course Enquiry List"
        description="Student course inquiries and counseling requests"
        columns={COLUMNS}
        accentColor="#f97316"
      />
    </Suspense>
  );
}
