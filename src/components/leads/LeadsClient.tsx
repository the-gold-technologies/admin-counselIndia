'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  Inbox,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';
import { InquiryLeadItem, LEAD_SUBTABS_CONFIG } from '@/types/leads';

interface LeadsClientProps {
  slug: string;
}

export function LeadsClient({ slug }: LeadsClientProps) {
  const router = useRouter();

  // Find metadata for current slug or default to 'subscribe'
  const tabConfig = useMemo(() => {
    return LEAD_SUBTABS_CONFIG[slug] || LEAD_SUBTABS_CONFIG['subscribe'];
  }, [slug]);

  const [leads, setLeads] = useState<InquiryLeadItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('category', tabConfig.id);
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLeads(data.data || []);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tabConfig.id, debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Export current active page data to CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams({
        category: tabConfig.id,
        all: 'true',
      });
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());

      const res = await fetch(`/api/leads?${params.toString()}`);
      const json = await res.json();
      const exportList: InquiryLeadItem[] = json.success ? json.data : leads;

      if (!exportList.length) {
        alert('No leads to export');
        return;
      }

      // Headers from columns
      const headers = tabConfig.columns.map((c) => c.label);
      const csvRows = [headers.join(',')];

      exportList.forEach((lead, idx) => {
        const row = tabConfig.columns.map((col) => {
          let val: any = '';
          if (col.key === 'sNo') {
            val = idx + 1;
          } else if (col.key === 'gender') {
            val = lead.extraData?.gender || '';
          } else if (col.key === 'age') {
            val = lead.extraData?.age || '';
          } else if (col.key === 'proBackground') {
            val = lead.extraData?.proBackground || '';
          } else if (col.key === 'purpose') {
            val = lead.extraData?.purpose || '';
          } else if (col.key === 'ebookName') {
            val = lead.extraData?.ebookName || '';
          } else if (col.key === 'newsletterName') {
            val = lead.extraData?.newsletterName || '';
          } else if (col.key === 'marks') {
            val = lead.extraData?.marks || '';
          } else if (col.key === 'certificateType') {
            val = lead.extraData?.certificateType || '';
          } else if (col.key === 'viewPath') {
            val = lead.extraData?.viewPath || lead.extraData?.certificateUrl || lead.extraData?.pdf_url || lead.extraData?.pdfUrl || lead.extraData?.pdfpath || '';
          } else if (col.key === 'hearFrom') {
            val = lead.hearFrom || lead.source || lead.extraData?.['Here From'] || lead.extraData?.['hereFrom'] || '';
          } else if (col.key === 'message') {
            val = lead.message || lead.extraData?.['Question'] || lead.extraData?.['question'] || '';
          } else if (col.key === 'referByName') {
            val = lead.extraData?.referByName || lead.extraData?.refer_by_name || '';
          } else if (col.key === 'referByEmail') {
            val = lead.extraData?.referByEmail || lead.extraData?.refer_by_email || '';
          } else {
            val = (lead as any)[col.key] || '';
          }
          return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(row.join(','));
      });

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `counselindia_${tabConfig.slug}_leads_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export CSV failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Helper to extract cell content
  const renderCell = (lead: InquiryLeadItem, colKey: string, index: number) => {
    if (colKey === 'sNo') {
      // ALWAYS 1-indexed sequential starting from 1 for the current page
      return (
        <span className="font-semibold text-gray-500 text-xs">
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      );
    }

    if (colKey === 'name') {
      return (
        <span className="font-bold text-gray-900 text-xs">
          {lead.name || '—'}
        </span>
      );
    }

    if (colKey === 'email') {
      if (!lead.email) return <span className="text-gray-400">—</span>;
      return (
        <a
          href={`mailto:${lead.email}`}
          className="text-gray-600 hover:text-[#09A64A] text-xs transition-colors"
        >
          {lead.email}
        </a>
      );
    }

    if (colKey === 'mobile') {
      if (!lead.mobile) return <span className="text-gray-400">—</span>;
      return (
        <span className="font-semibold text-gray-800 text-xs">
          {lead.mobile}
        </span>
      );
    }

    if (colKey === 'medium' || colKey === 'source') {
      const val = (lead as any)[colKey];
      if (!val) return <span className="text-gray-400">—</span>;
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-[#09A64A] border border-emerald-200/50">
          {val}
        </span>
      );
    }

    if (colKey === 'hearFrom') {
      const hf = lead.hearFrom || lead.source || lead.extraData?.['Here From'] || lead.extraData?.['hereFrom'];
      if (!hf) return <span className="text-gray-400">—</span>;
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
          {hf}
        </span>
      );
    }

    if (colKey === 'message') {
      let msg = lead.message || lead.extraData?.['Question'] || lead.extraData?.['question'] || lead.extraData?.query;
      if (!msg) {
        const parts: string[] = [];
        const rName = lead.extraData?.referByName || lead.extraData?.referredByName || lead.extraData?.referrerName || lead.extraData?.refer_by_name;
        const rEmail = lead.extraData?.referByEmail || lead.extraData?.referredByEmail || lead.extraData?.referrerEmail || lead.extraData?.refer_by_email;
        const rPhone = lead.extraData?.referByPhone || lead.extraData?.referredByPhone || lead.extraData?.referrerPhone || lead.extraData?.refer_by_phone;
        const rCourse = lead.extraData?.courseRefer || lead.extraData?.course_refer;
        if (rName) parts.push(`Name: ${rName}`);
        if (rEmail) parts.push(`Email: ${rEmail}`);
        if (rPhone) parts.push(`Phone: ${rPhone}`);
        if (rCourse) parts.push(`Course: ${rCourse}`);
        if (parts.length > 0) msg = parts.join(' | ');
      }
      if (!msg) return <span className="text-gray-400">—</span>;
      return (
        <p className="text-xs text-gray-600 line-clamp-2 max-w-sm" title={msg}>
          {msg}
        </p>
      );
    }

    if (colKey === 'addedOn') {
      return (
        <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
          {lead.addedOn || new Date(lead.createdAt).toLocaleDateString()}
        </span>
      );
    }

    // Extra dynamic keys
    if (colKey === 'gender') return <span className="text-xs">{lead.extraData?.gender || '—'}</span>;
    if (colKey === 'age') return <span className="text-xs">{lead.extraData?.age || '—'}</span>;
    if (colKey === 'proBackground') return <span className="text-xs">{lead.extraData?.proBackground || '—'}</span>;
    if (colKey === 'purpose') return <span className="text-xs">{lead.extraData?.purpose || '—'}</span>;
    if (colKey === 'ebookName') return <span className="text-xs font-semibold">{lead.extraData?.ebookName || '—'}</span>;
    if (colKey === 'newsletterName') return <span className="text-xs font-semibold">{lead.extraData?.newsletterName || '—'}</span>;
    if (colKey === 'marks') {
      return lead.extraData?.marks ? (
        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
          {lead.extraData.marks}
        </span>
      ) : <span className="text-gray-400">—</span>;
    }
    if (colKey === 'certificateType') return <span className="text-xs">{lead.extraData?.certificateType || '—'}</span>;
    if (colKey === 'viewPath') {
      const vPath = lead.extraData?.viewPath || lead.extraData?.certificateUrl || lead.extraData?.pdf_url || lead.extraData?.pdfUrl || lead.extraData?.pdfpath || lead.extraData?.url;
      if (!vPath) return <span className="text-gray-400">—</span>;
      if (typeof vPath === 'string' && (vPath.startsWith('http://') || vPath.startsWith('https://'))) {
        return (
          <a
            href={vPath}
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
      return <span className="text-xs text-gray-500">{vPath}</span>;
    }
    if (colKey === 'referByName') return <span className="text-xs">{lead.extraData?.referByName || '—'}</span>;
    if (colKey === 'referByEmail') return <span className="text-xs">{lead.extraData?.referByEmail || '—'}</span>;

    // Fallback direct key
    const directVal = (lead as any)[colKey];
    return <span className="text-xs text-gray-700">{directVal || '—'}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {tabConfig.title}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#09A64A]/10 text-[#09A64A] border border-[#09A64A]/20 shadow-2xs">
              {totalCount} Total Leads
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {tabConfig.description}
          </p>
        </div>

        {/* Global Export Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={isExporting || totalCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-800 text-xs font-bold hover:bg-gray-50 hover:border-gray-300 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#09A64A]" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-[#09A64A]" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${tabConfig.title} leads...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
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
          <span>Showing</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:border-[#09A64A] cursor-pointer"
          >
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <button
            onClick={fetchLeads}
            title="Refresh"
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Leads Table matching live columns */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                {tabConfig.columns.map((col, cIdx) => (
                  <th
                    key={cIdx}
                    className={`py-3.5 px-4 ${
                      col.align === 'center'
                        ? 'text-center w-16'
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
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    {tabConfig.columns.map((col, cIdx) => (
                      <td key={cIdx} className="py-4 px-4">
                        <div
                          className={`h-3.5 bg-gray-100 rounded ${
                            col.align === 'center'
                              ? 'w-6 mx-auto'
                              : col.align === 'right'
                              ? 'w-20 ml-auto'
                              : 'w-24'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={tabConfig.columns.length}
                    className="py-14 text-center text-gray-400"
                  >
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto text-gray-400">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-gray-700 text-sm">No leads found</p>
                      <p className="text-xs text-gray-400">
                        {debouncedSearch
                          ? `No inquiries match "${debouncedSearch}"`
                          : `No leads recorded in ${tabConfig.title} yet`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50/70 transition-colors group"
                  >
                    {tabConfig.columns.map((col, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3.5 px-4 ${
                          col.align === 'center'
                            ? 'text-center'
                            : col.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {renderCell(lead, col.key, index)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-gray-100 bg-white text-xs font-medium text-gray-500">
          <div>
            Showing <span className="font-bold text-gray-800">{startItem}</span> to{' '}
            <span className="font-bold text-gray-800">{endItem}</span> of{' '}
            <span className="font-bold text-gray-800">{totalCount}</span> leads
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isLoading}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-semibold transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-3 py-1 font-bold text-gray-800 text-xs">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isLoading}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-semibold transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeadsClient;
