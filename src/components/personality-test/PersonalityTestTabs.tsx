"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, Users, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalityTestTabsProps {
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export const TABS = [
  {
    name: "Tab Result",
    href: "/personality-test/tab-result",
    icon: Award,
    description: "Assessment outcome archetypes, scores and result profiles",
  },
  {
    name: "Personality Entry",
    href: "/personality-test/personality-entry",
    icon: Users,
    description: "Student submissions, test responses and respondent background",
  },
  {
    name: "Question",
    href: "/personality-test/question",
    icon: HelpCircle,
    description: "Assessment questions, answer choices and trait mappings",
  },
  {
    name: "Personality Test Info",
    href: "/personality-test/personality-test-info",
    icon: Info,
    description: "Test configuration, instructions and status settings",
  },
];

export default function PersonalityTestTabs({
  title,
  subtitle,
  headerActions,
  children,
}: PersonalityTestTabsProps) {
  const pathname = usePathname();

  const currentTab = TABS.find((t) => pathname.startsWith(t.href)) || TABS[0];
  const activeTitle = title || currentTab.name;
  const activeSubtitle = subtitle || currentTab.description;

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pt-1">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-[#09A64A] border border-emerald-200">
              Content Management
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-semibold text-gray-500">Personality Test</span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#0B0F29] tracking-tight">
            {activeTitle}
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {activeSubtitle}
          </p>
        </div>

        {headerActions && <div className="flex items-center gap-3">{headerActions}</div>}
      </div>

      {/* Nav Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href === "/personality-test/tab-result" && pathname === "/personality-test");
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                isActive
                  ? "bg-[#1f2937] text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-gray-400")} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
