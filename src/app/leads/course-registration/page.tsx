import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LeadsTable, { ColDef } from '@/components/leads/LeadsTable';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How To Applies List | Counsel India Admin',
  description: 'Course applications and registration submissions',
};

const COLUMNS: ColDef[] = [
  { key: 'sNo', label: '#ID', align: 'center' as const },
  { key: 'name', label: 'User Details' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'courseName', label: 'Course' },
  { key: 'addedOn', label: 'Date', align: 'right' as const },
];

export default function HowToAppliesListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#eab308' }} />
        </div>
      }
    >
      <LeadsTable
        category="course-registration"
        title="How To Applies List"
        description="Course applications and registration submissions"
        columns={COLUMNS}
        accentColor="#eab308"
      />
    </Suspense>
  );
}
