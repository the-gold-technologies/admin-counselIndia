import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LeadsTable, { ColDef } from '@/components/leads/LeadsTable';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Landing pages leads | Counsel India Admin',
  description: 'Marketing landing page leads',
};

const COLUMNS: ColDef[] = [
  { key: 'sNo', label: 'S.No', align: 'center' as const },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Phone Number' },
  { key: 'medium', label: 'Medium' },
  { key: 'addedOn', label: 'created At', align: 'right' as const },
];

export default function LandingpagesleadsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6366f1' }} />
        </div>
      }
    >
      <LeadsTable
        category="landing-page"
        title="Landing pages leads"
        description="Marketing landing page leads"
        columns={COLUMNS}
        accentColor="#6366f1"
      />
    </Suspense>
  );
}
