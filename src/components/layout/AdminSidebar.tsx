"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  TrendingUp,
  BookOpen,
  MailQuestion,
  BrainCircuit,
  Settings,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarLinkItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
  sublinks?: { title: string; href: string }[];
}

const sidebarLinks: SidebarLinkItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Admissions",
    href: "/admissions",
    icon: GraduationCap,
  },
  {
    title: "Alumni",
    href: "/alumni",
    icon: Users,
  },
  {
    title: "Counsellors",
    icon: UserCheck,
    sublinks: [
      { title: "Verified Counsellors", href: "/counsellors" },
      { title: "Pending Counsellors", href: "/counsellors/pending" },
      { title: "All Counsellors", href: "/counsellors/all" },
    ],
  },
  {
    title: "Course Leads",
    href: "/course-leads",
    icon: TrendingUp,
  },
  {
    title: "Courses",
    icon: BookOpen,
    sublinks: [
      { title: "All Courses", href: "/courses" },
      { title: "Short Courses", href: "/courses/short-courses" },
    ],
  },
  {
    title: "Leads / Enquiries",
    icon: MailQuestion,
    sublinks: [
      { title: "Contact Us Leads", href: "/leads/contact" },
      { title: "Book a Session", href: "/leads/sessions" },
      { title: "CI for Business", href: "/leads/ci-business" },
    ],
  },
  {
    title: "Personality Test",
    icon: BrainCircuit,
    sublinks: [
      { title: "Test Entries", href: "/personality-test" },
      { title: "Questions", href: "/personality-test/questions" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    sublinks: [
      { title: "Admin Settings", href: "/settings/admin" },
      { title: "Config Settings", href: "/settings/config" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    return sidebarLinks
      .filter((item) =>
        item.sublinks?.some((sublink) => pathname.startsWith(sublink.href))
      )
      .map((item) => item.title);
  });

  useEffect(() => {
    const activeGroups = sidebarLinks
      .filter((item) =>
        item.sublinks?.some((sublink) => pathname.startsWith(sublink.href))
      )
      .map((item) => item.title);

    setOpenGroups((prev) => {
      const newGroups = [...prev];
      activeGroups.forEach((group) => {
        if (!newGroups.includes(group)) {
          newGroups.push(group);
        }
      });
      return newGroups;
    });
  }, [pathname]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <div className="flex h-full w-[280px] flex-col bg-[#0a192f] text-white overflow-hidden rounded-l-[2.5rem] border-l border-white/5 shrink-0">
      {/* Logo Area */}
      <div className="flex h-24 items-center px-8 border-b border-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#0a192f] font-black italic shadow-sm text-lg">
            CI
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight block text-white leading-tight">
              Counsel India
            </span>
            <span className="text-[12px] font-bold text-[#07a64b] tracking-wider uppercase block mt-0.5">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1.5 px-5">
          {sidebarLinks.map((item, index) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href
                ? pathname.startsWith(item.href)
                : false;
            const isOpen = openGroups.includes(item.title);

            if (item.sublinks) {
              return (
                <div key={index} className="pt-3 first:pt-0">
                  <div
                    className="flex items-center justify-between cursor-pointer group mb-1.5 px-4 py-1"
                    onClick={() => toggleGroup(item.title)}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2.5 group-hover:text-gray-300 transition-colors whitespace-nowrap">
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-gray-500 transition-transform group-hover:text-gray-300 shrink-0",
                        isOpen ? "rotate-180" : ""
                      )}
                    />
                  </div>
                  {isOpen && (
                    <div className="space-y-1 pl-4 ml-2 border-l border-gray-800 py-1">
                      {item.sublinks.map((sublink, subIndex) => {
                        const isSubActive = pathname === sublink.href;
                        return (
                          <Link
                            key={subIndex}
                            href={sublink.href}
                            className={cn(
                              "block px-4 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 whitespace-nowrap",
                              isSubActive
                                ? "bg-[#07a64b] text-white shadow-sm shadow-[#07a64b]/20 transform scale-[1.02]"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                          >
                            {sublink.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                href={item.href!}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-200 mt-1 whitespace-nowrap",
                  isActive
                    ? "bg-[#07a64b] text-white shadow-sm shadow-[#07a64b]/20 transform scale-[1.02]"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-white" : "text-gray-400"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="whitespace-nowrap">{item.title}</span>
                </div>
                {item.badge && (
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#07a64b]/80 text-white text-[10px] font-bold shrink-0">
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Live Website & Logout Area */}
      <div className="px-5 pb-6 border-t border-gray-800 pt-5 space-y-2">
        <a
          href="https://counselindia.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-[13px] font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all group whitespace-nowrap"
        >
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#07a64b] animate-pulse" />
            <span>Live counselindia.com</span>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white shrink-0" />
        </a>

        <div className="flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-[13px] font-medium text-gray-400">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
            SA
          </div>
          <span className="truncate">superadmin@counselindia.com</span>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar;
