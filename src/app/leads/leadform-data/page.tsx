import React, { Suspense } from 'react';
import { Metadata } from 'next';
import LeadsTable, { ColDef } from '@/components/leads/LeadsTable';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'leadform  Data List | Counsel India Admin',
  description: 'Comprehensive lead generation form data',
};

const COLUMNS: ColDef[] = [
  { key: 'sNo', label: 'id', align: 'center' as const },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'countryCode', label: 'Country Code', align: 'center' as const },
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'courseName', label: 'Program' },
  { key: 'referByName', label: 'Refer By Name' },
  { key: 'referByEmail', label: 'Refer By Email' },
  { key: 'referByPhone', label: 'Refer By Phone' },
  { key: 'leadName', label: 'Lead Name' },
  { key: 'addedOn', label: 'Created at', align: 'right' as const },
];

export default function leadformDataListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#f43f5e' }} />
        </div>
      }
    >
      <LeadsTable
        category="leadform-data"
        title="leadform  Data List"
        description="Comprehensive lead generation form data"
        columns={COLUMNS}
        accentColor="#f43f5e"
      />
    </Suspense>
  );
}
