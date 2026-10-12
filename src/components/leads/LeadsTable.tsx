'use client';

import React, { useState, useEffect, useCallback } from 'react';
import UploadLeadCsvModal from './UploadLeadCsvModal';
import {
  Search,
  X,
  RefreshCw,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
  UploadCloud,
} from 'lucide-react';

export interface ColDef {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
}

export interface LeadsTableProps {
  category: string;
  title: string;
  description: string;
  columns: ColDef[];
  accentColor?: string;
}

const EXTRA_KEYS = [
  'gender',
  'age',
  'proBackground',
  'purpose',
  'ebookName',
  'newsletterName',
  'certificateType',
  'viewPath',
  'referByName',
  'referByEmail',
  'marks',
];

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function renderCell(
  lead: any,
  col: ColDef,
  index: number,
  currentPage: number,
  pageSize: number
) {
  const { key } = col;

  if (key === 'sNo') {
    const displayVal = lead.sNo ?? lead.liveId ?? index + 1 + (currentPage - 1) * pageSize;
    return (
      <span className="font-semibold text-gray-500 font-mono text-[11px]">
        {displayVal}
      </span>
    );
  }

  if (key === 'addedOn') {
    const val = lead.addedOn || formatDate(lead.createdAt);
    return <span className="text-gray-400 whitespace-nowrap">{val}</span>;
  }

  let value: any = lead[key];
  if (value === undefined || value === null || value === '') {
    if (EXTRA_KEYS.includes(key)) {
      value = lead.extraData?.[key];
    }
  }

  if (value === undefined || value === null || value === '') {
    return <span className="text-gray-300 italic">—</span>;
  }

  if (key === 'email') {
    return (
      <a
        href={`mailto:${value}`}
        className="text-gray-900 hover:text-emerald-600 font-medium transition-colors hover:underline truncate max-w-[200px] block"
      >
        {String(value)}
      </a>
    );
  }

  if (key === 'mobile') {
    const full = lead.countryCode ? `+${lead.countryCode} ${value}` : value;
    return (
      <a
        href={`tel:${value}`}
        className="text-gray-800 hover:text-emerald-600 font-mono transition-colors"
      >
        {String(full)}
      </a>
    );
  }

  if (key === 'name') {
    return <span className="font-semibold text-gray-900">{String(value)}</span>;
  }

  return <span className="text-gray-600">{String(value)}</span>;
}

export default function LeadsTable({
  category,
  title,
  description,
  columns,
  accentColor = '#10b981',
}: LeadsTableProps) {
  const [leads, setLeads] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // Default 50 per page as requested
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        category,
        page: String(currentPage),
        limit: String(pageSize),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/leads?${params}`);
      const json = await res.json();
      if (json.success) {
        setLeads(json.data);
        setTotalCount(json.pagination.total);
      }
    } catch (e) {
      console.error('Failed to fetch leads', e);
    } finally {
      setIsLoading(false);
    }
  }, [category, currentPage, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, pageSize]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({ category, all: 'true' });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/leads?${params}`);
      const json = await res.json();
      if (!json.success) return;

      const rows = json.data;
      const exportCols = columns.filter((c) => c.key !== 'sNo');

      // Matching Counsel India format: Id, Name, Email, Phone Number / Mobile ...
      const headers = ['Id', ...exportCols.map((c) => (c.key === 'mobile' ? 'Phone Number' : c.label))];
      const csvRows = [headers.join(',')];

      rows.forEach((row: any) => {
        const idVal = row.sNo ?? row.liveId ?? '';
        const cells = [
          `"${String(idVal).replace(/"/g, '""')}"`,
          ...exportCols.map((col) => {
            const k = col.key;
            let v: any;
            if (k === 'addedOn') v = row.addedOn || formatDate(row.createdAt);
            else if (EXTRA_KEYS.includes(k)) v = row.extraData?.[k] ?? '';
            else v = row[k] ?? '';
            return `"${String(v).replace(/"/g, '""')}"`;
          }),
        ];
        csvRows.push(cells.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `counselindia_${category}_leads_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="px-3.5 py-1.5 text-xs font-bold rounded-full"
            style={{ background: accentColor + '18', color: accentColor }}
          >
            {totalCount.toLocaleString()} records
          </span>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4" style={{ color: accentColor }} />
            Import CSV
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting || totalCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer transition-all shadow-sm"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
            ) : (
              <FileSpreadsheet className="w-4 h-4" style={{ color: accentColor }} />
            )}
            Export CSV
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${title}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-gray-500 font-medium">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
          </select>
          <span className="text-gray-400">per page</span>

          <button
            onClick={fetchLeads}
            title="Refresh"
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer ml-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="text-gray-500 font-semibold uppercase tracking-wider text-[11px]"
                style={{ borderBottom: `2px solid ${accentColor}25` }}
              >
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={`py-3.5 px-4 bg-gray-50/70 ${
                      col.align === 'center'
                        ? 'text-center w-20'
                        : col.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, ci) => (
                      <td key={ci} className="py-4 px-4">
                        <div className="h-3.5 bg-gray-100 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center text-gray-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-gray-700 text-sm">No leads found</p>
                      <p className="text-xs text-gray-400">
                        {debouncedSearch
                          ? `No records match "${debouncedSearch}"`
                          : `No ${title} leads recorded yet. Click "Import CSV" above to upload.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead, i) => (
                  <tr
                    key={lead.id || i}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    {columns.map((col, ci) => (
                      <td
                        key={ci}
                        className={`py-3.5 px-4 ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {renderCell(lead, col, i, currentPage, pageSize)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 text-xs text-gray-500 font-medium bg-gray-50/40">
          <div>
            Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
            <span className="font-bold text-gray-800">{endItem}</span> of{' '}
            <span className="font-bold text-gray-800">{totalCount.toLocaleString()}</span> results
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="p-1.5 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="p-1.5 rounded-xl border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CSV Upload Modal */}
      <UploadLeadCsvModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        defaultCategory={category}
        accentColor={accentColor}
        onSuccess={() => {
          fetchLeads();
        }}
      />
    </div>
  );
}
