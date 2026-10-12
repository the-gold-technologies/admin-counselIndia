import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LeadsTable, { ColDef } from '@/components/leads/LeadsTable';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Appdata List | Counsel India Admin',
  description: 'Counsel India mobile app download and user leads',
};

const COLUMNS: ColDef[] = [
  { key: 'sNo', label: 'S.No', align: 'center' as const },
  { key: 'name', label: 'Name' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'addedOn', label: 'Created at', align: 'right' as const },
];

export default function AppdataListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#10b981' }} />
        </div>
      }
    >
      <LeadsTable
        category="app-data"
        title="Appdata List"
        description="Counsel India mobile app download and user leads"
        columns={COLUMNS}
        accentColor="#10b981"
      />
    </Suspense>
  );
}
