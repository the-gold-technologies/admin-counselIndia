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
    const displayVal = (currentPage - 1) * pageSize + index + 1;
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

  // Specific smart fallbacks
  if (value === undefined || value === null || value === '') {
    if (key === 'source') {
      value = lead.hearFrom ?? lead.extraData?.['Here From'] ?? lead.extraData?.['hereFrom'];
    } else if (key === 'hearFrom') {
      value = lead.source ?? lead.extraData?.['Here From'] ?? lead.extraData?.['hereFrom'] ?? lead.extraData?.['here_from'];
    } else if (key === 'message') {
      value = lead.message ?? lead.extraData?.['Question'] ?? lead.extraData?.['question'] ?? lead.extraData?.query;
      if (!value) {
        const parts: string[] = [];
        const rName = lead.extraData?.referByName ?? lead.extraData?.referredByName ?? lead.extraData?.referrerName ?? lead.extraData?.refer_by_name;
        const rEmail = lead.extraData?.referByEmail ?? lead.extraData?.referredByEmail ?? lead.extraData?.referrerEmail ?? lead.extraData?.refer_by_email;
        const rPhone = lead.extraData?.referByPhone ?? lead.extraData?.referredByPhone ?? lead.extraData?.referrerPhone ?? lead.extraData?.refer_by_phone;
        const rCourse = lead.extraData?.courseRefer ?? lead.extraData?.course_refer;
        if (rName) parts.push(`Name: ${rName}`);
        if (rEmail) parts.push(`Email: ${rEmail}`);
        if (rPhone) parts.push(`Phone: ${rPhone}`);
        if (rCourse) parts.push(`Course: ${rCourse}`);
        if (parts.length > 0) value = parts.join(' | ');
      }
    } else if (key === 'ebookName') {
      value = lead.extraData?.ebookName ?? lead.courseName ?? lead.content;
    } else if (key === 'newsletterName') {
      value = lead.extraData?.newsletterName ?? lead.courseName ?? lead.content;
    } else if (key === 'courseType') {
      value = lead.courseType ?? lead.extraData?.courseType ?? lead.extraData?.programType;
    } else if (key === 'courseName') {
      value = lead.courseName ?? lead.extraData?.courseName ?? lead.extraData?.program ?? lead.content;
    } else if (key === 'referByName') {
      value = lead.extraData?.referByName ?? lead.extraData?.referrerName ?? lead.extraData?.referredByName ?? lead.extraData?.refer_by_name;
    } else if (key === 'referByEmail') {
      value = lead.extraData?.referByEmail ?? lead.extraData?.referrerEmail ?? lead.extraData?.referredByEmail ?? lead.extraData?.refer_by_email;
    } else if (key === 'referByPhone') {
      value = lead.extraData?.referByPhone ?? lead.extraData?.referrerPhone ?? lead.extraData?.referredByPhone ?? lead.extraData?.refer_by_phone;
    } else if (key === 'leadName') {
      value = lead.extraData?.leadName ?? lead.extraData?.referredName ?? lead.name;
    } else if (key === 'state') {
      value = lead.state ?? lead.extraData?.state ?? lead.extraData?.stateName;
    } else if (key === 'city') {
      value = lead.city ?? lead.extraData?.city ?? lead.extraData?.cityName;
    } else if (key === 'marks') {
      value = lead.extraData?.marks ?? lead.extraData?.score;
    } else if (key === 'certificateType') {
      value = lead.extraData?.certificateType;
    } else if (key === 'viewPath') {
      value = lead.extraData?.viewPath ?? lead.extraData?.certificateUrl ?? lead.extraData?.pdf_url ?? lead.extraData?.pdfUrl ?? lead.extraData?.pdfpath ?? lead.extraData?.url;
    } else if (EXTRA_KEYS.includes(key)) {
      value = lead.extraData?.[key];
    }
  }

  // Universal extraData fallback
  if (value === undefined || value === null || value === '') {
    value = lead.extraData?.[key];
  }

  // Case/symbol insensitive match in extraData
  if ((value === undefined || value === null || value === '') && lead.extraData && typeof lead.extraData === 'object') {
    const normTarget = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [k, v] of Object.entries(lead.extraData)) {
      if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === normTarget && v !== undefined && v !== null && v !== '') {
        value = v;
        break;
      }
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
    const rawVal = String(value);
    let full = rawVal;
    if (lead.countryCode && !rawVal.startsWith('+') && !rawVal.startsWith(String(lead.countryCode))) {
      const code = String(lead.countryCode).startsWith('+') ? lead.countryCode : `+${lead.countryCode}`;
      full = `${code} ${rawVal}`;
    }
    return (
      <a
        href={`tel:${rawVal}`}
        className="text-gray-800 hover:text-emerald-600 font-mono transition-colors"
      >
        {String(full)}
      </a>
    );
  }

  if (key === 'name') {
    return <span className="font-semibold text-gray-900">{String(value)}</span>;
  }

  if (key === 'viewPath' || (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) && key.toLowerCase().includes('path'))) {
    return (
      <a
        href={String(value)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors shadow-sm"
      >
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
        View PDF
      </a>
    );
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

  // Dedicated filter card state (matching Personality Test)
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterMobile, setFilterMobile] = useState('');
  const [activeFilters, setActiveFilters] = useState<{ name: string; email: string; mobile: string }>({
    name: '',
    email: '',
    mobile: '',
  });

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveFilters({
      name: filterName.trim(),
      email: filterEmail.trim(),
      mobile: filterMobile.trim(),
    });
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setFilterName('');
    setFilterEmail('');
    setFilterMobile('');
    setActiveFilters({ name: '', email: '', mobile: '' });
    setCurrentPage(1);
  };

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
      if (activeFilters.name) params.set('name', activeFilters.name);
      if (activeFilters.email) params.set('email', activeFilters.email);
      if (activeFilters.mobile) params.set('mobile', activeFilters.mobile);

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
  }, [category, currentPage, pageSize, debouncedSearch, activeFilters]);

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
      if (activeFilters.name) params.set('name', activeFilters.name);
      if (activeFilters.email) params.set('email', activeFilters.email);
      if (activeFilters.mobile) params.set('mobile', activeFilters.mobile);

      const res = await fetch(`/api/leads?${params}`);
      const json = await res.json();
      if (!json.success) return;

      const rows = json.data;
      const exportCols = columns.filter((c) => c.key !== 'sNo');

      // Matching Counsel India format: Id, Name, Email, Phone Number / Mobile ...
      const headers = ['Id', ...exportCols.map((c) => (c.key === 'mobile' ? 'Phone Number' : c.label))];
      const csvRows = [headers.join(',')];

      rows.forEach((row: any, idx: number) => {
        const idVal = idx + 1;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="px-3 py-1 text-xs font-bold rounded-full"
            style={{ background: accentColor + '18', color: accentColor }}
          >
            {totalCount.toLocaleString()} records
          </span>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4" style={{ color: accentColor }} />
            Import CSV
          </button>

          {/* Export Button: styled as dark button on Personality Test, standard on other tabs */}
          {category === 'personality-test' ? (
            <button
              onClick={handleExport}
              disabled={isExporting || totalCount === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#272f3d] hover:bg-[#1a202c] text-white text-xs font-semibold disabled:opacity-50 cursor-pointer transition-all shadow-sm"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-gray-300" />
              )}
              Export
            </button>
          ) : (
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
          )}
        </div>
      </div>

      {/* Filter Form Card - ONLY on Personality Test tab as requested */}
      {category === 'personality-test' && (
      <div className="bg-white p-6 rounded-xl border border-gray-200/90 shadow-sm">
        <form onSubmit={handleFilterSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter Name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md border border-gray-200 bg-white text-xs font-normal text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="text"
                placeholder="Enter email"
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md border border-gray-200 bg-white text-xs font-normal text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Mobile
              </label>
              <input
                type="text"
                placeholder="Enter mobile number"
                value={filterMobile}
                onChange={(e) => setFilterMobile(e.target.value)}
                className="w-full px-3.5 py-2 rounded-md border border-gray-200 bg-white text-xs font-normal text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="submit"
              className="px-6 py-2 rounded-md bg-[#07a64b] hover:bg-[#068f40] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={handleFilterReset}
              className="px-6 py-2 rounded-md bg-[#07a64b] hover:bg-[#068f40] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      )}

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
