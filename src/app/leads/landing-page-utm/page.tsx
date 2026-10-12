import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LeadsTable, { ColDef } from '@/components/leads/LeadsTable';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Landing Page Utm | Counsel India Admin',
  description: 'Landing page UTM parameters and lead data',
};

const COLUMNS: ColDef[] = [
  { key: 'sNo', label: 'S.No', align: 'center' as const },
  { key: 'name', label: 'User Name' },
  { key: 'source', label: 'Source' },
  { key: 'medium', label: 'Medium' },
  { key: 'content', label: 'Content' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'addedOn', label: 'Updated At', align: 'right' as const },
];

export default function LandingPageUtmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#a855f7' }} />
        </div>
      }
    >
      <LeadsTable
        category="landing-page-utm"
        title="Landing Page Utm"
        description="Landing page UTM parameters and lead data"
        columns={COLUMNS}
        accentColor="#a855f7"
      />
    </Suspense>
  );
}
