"use client";

import Link from "next/link";
import {
  ArrowRight,
  Loader2,
  BadgeCheck,
  Eye,
  GraduationCap,
  Users,
  UserCheck,
  TrendingUp,
  BookOpen,
  MailQuestion,
  BrainCircuit,
  Settings,
} from "lucide-react";

interface ModuleListItem {
  id: string;
  title: string;
  slug: string;
  visibility: string;
  type: string;
  recordsCount: number;
}

interface ModuleStructureProps {
  stats?: {
    modulesList?: ModuleListItem[];
  };
  loading?: boolean;
}

const MODULE_ICONS: Record<string, any> = {
  admissions: GraduationCap,
  alumni: Users,
  counsellors: UserCheck,
  "course-leads": TrendingUp,
  courses: BookOpen,
  leads: MailQuestion,
  "personality-test": BrainCircuit,
  settings: Settings,
};

export function ModuleStructure({ stats, loading }: ModuleStructureProps) {
  const modulesList = stats?.modulesList || [];
  const displayedModules = modulesList.slice(0, 6);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg text-[#0B0F29]">Counsel India Modules</h3>
          <p className="text-xs font-medium text-gray-400 mt-0.5">
            Overview of live portals, registries, and student admissions pipelines.
          </p>
        </div>
        <Link
          href="/admissions"
          className="text-xs font-bold text-[#09A64A] hover:text-[#068f40] flex items-center gap-1 bg-emerald-50/70 px-3 py-1.5 rounded-xl transition-all"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#09A64A]" />
        </div>
      ) : displayedModules.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-xs italic">No modules available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 pb-2">
                <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                  Module Name
                </th>
                <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                  Route Path
                </th>
                <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                  Status
                </th>
                <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                  Live Records
                </th>
                <th className="pb-3 font-bold text-gray-400 uppercase tracking-widest text-[10px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedModules.map((mod) => {
                const Icon = MODULE_ICONS[mod.id] || GraduationCap;
                const routeUrl = `/${mod.slug}`;

                return (
                  <tr key={mod.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="py-3.5">
                      <Link href={routeUrl} className="flex items-center gap-2.5 group">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#09A64A]/10 group-hover:text-[#09A64A] transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 group-hover:text-[#09A64A] transition-colors">
                            {mod.title}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                            {mod.type} Module
                          </span>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3.5 font-mono text-xs text-gray-500">/{mod.slug}</td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600">
                        <BadgeCheck className="w-3 h-3" />
                        Live
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-gray-800">
                      {(mod.recordsCount ?? 0).toLocaleString()} record
                      {(mod.recordsCount ?? 0) === 1 ? "" : "s"}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={routeUrl}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-black font-semibold text-[11px] transition-all"
                      >
                        <Eye className="w-3 h-3" />
                        Open Module
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ModuleStructure;
