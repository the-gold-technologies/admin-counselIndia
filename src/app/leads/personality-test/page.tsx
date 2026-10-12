import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LeadsTable, { ColDef } from '@/components/leads/LeadsTable';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Personality Test | Counsel India Admin',
  description: 'Personality assessment test entries',
};

const COLUMNS: ColDef[] = [
  { key: 'sNo', label: '#Id', align: 'center' as const },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'gender', label: 'Gender' },
  { key: 'age', label: 'Age', align: 'center' as const },
  { key: 'proBackground', label: 'Pro Background' },
  { key: 'purpose', label: 'Purpose Give Test' },
  { key: 'state', label: 'State' },
  { key: 'addedOn', label: 'Date' },
  { key: 'marks', label: 'Result' },
  { key: 'hearFrom', label: 'Here From', align: 'right' as const },
];

export default function PersonalityTestPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#ec4899' }} />
        </div>
      }
    >
      <LeadsTable
        category="personality-test"
        title="Personality Test"
        description="Personality assessment test entries"
        columns={COLUMNS}
        accentColor="#ec4899"
      />
    </Suspense>
  );
}
