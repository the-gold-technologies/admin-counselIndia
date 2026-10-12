import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LeadsTable, { ColDef } from '@/components/leads/LeadsTable';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'UTM Data List | Counsel India Admin',
  description: 'Campaign UTM parameter tracked leads',
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

export default function UTMDataListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#84cc16' }} />
        </div>
      }
    >
      <LeadsTable
        category="utm-data"
        title="UTM Data List"
        description="Campaign UTM parameter tracked leads"
        columns={COLUMNS}
        accentColor="#84cc16"
      />
    </Suspense>
  );
}
