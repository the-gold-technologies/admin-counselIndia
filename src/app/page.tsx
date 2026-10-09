"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  GraduationCap,
  TrendingUp,
  BookOpen,
  MailQuestion,
  BrainCircuit,
  Settings,
  ArrowRight,
  ShieldCheck,
  Clock,
  Eye,
} from "lucide-react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { AdminRightSidebar } from "@/components/layout/AdminRightSidebar";
import { INITIAL_ADMISSIONS } from "@/lib/initialData";

export default function DashboardHomePage() {
  const [admissions, setAdmissions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admissions");
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setAdmissions(json.data);
        } else {
          setAdmissions(INITIAL_ADMISSIONS);
        }
      } catch {
        setAdmissions(INITIAL_ADMISSIONS);
      }
    }
    loadData();
  }, []);

  // Stats matching the live Counsel India home dashboard
  const statCards = [
    {
      title: "Total Users",
      value: "2,676",
      subtitle: "Registered on portal",
      icon: Users,
      color: "bg-emerald-50 text-[#07a64b] border-emerald-200/60",
    },
    {
      title: "Today New Users",
      value: "0",
      subtitle: "Last 24 hours",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-200/60",
    },
    {
      title: "Total Counsellors",
      value: "94",
      subtitle: "Verified network",
      icon: UserCheck,
      color: "bg-purple-50 text-purple-600 border-purple-200/60",
    },
    {
      title: "Total Admissions",
      value: "2,046",
      subtitle: "Enrolled learners",
      icon: GraduationCap,
      color: "bg-amber-50 text-amber-600 border-amber-200/60",
    },
  ];

  const modules = [
    { title: "Admissions Management", desc: "Learner applications & verification", href: "/admissions", icon: GraduationCap, badge: "Module 1" },
    { title: "Alumni Management", desc: "Alumni registry & placements", href: "/alumni", icon: Users, badge: "Module 2" },
    { title: "Counsellor Management", desc: "Verified & pending psychologists", href: "/counsellors", icon: UserCheck, badge: "Module 3" },
    { title: "Course Leads Management", desc: "Brochure & enrollment inquiries", href: "/course-leads", icon: TrendingUp, badge: "Module 4" },
    { title: "Course Management", desc: "Programs, masterclasses & schedules", href: "/courses", icon: BookOpen, badge: "Module 5" },
    { title: "Leads / Enquiries", desc: "Contact us & counseling requests", href: "/leads", icon: MailQuestion, badge: "Module 6" },
    { title: "Personality Test", desc: "Psychology quizzes & score logs", href: "/personality-test", icon: BrainCircuit, badge: "Module 7" },
    { title: "Settings", desc: "Admin configuration & permissions", href: "/settings", icon: Settings, badge: "Module 8" },
  ];

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <AdminHeader />

      {/* Main Grid: 8 Cols Left, 4 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* 4 Stats Cards matching live counselindia dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-5 rounded-[1.75rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      {card.title}
                    </span>
                    <div className={`p-2 rounded-xl border ${card.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                      {card.value}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Core Modules Quick Access Grid */}
          <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  8 Core Administration Modules
                </h3>
                <p className="text-xs text-gray-500">Centralized control modules for Counsel India</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#07a64b] border border-emerald-200">
                Active Portal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {modules.map((m, i) => {
                const Icon = m.icon;
                return (
                  <Link
                    key={i}
                    href={m.href}
                    className="p-4 rounded-2xl bg-gray-50/70 hover:bg-emerald-50/60 border border-gray-100 hover:border-emerald-200 transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-white group-hover:bg-[#07a64b] group-hover:text-white text-gray-600 shadow-2xs transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-900 group-hover:text-emerald-800 transition-colors">
                          {m.title}
                        </h4>
                        <p className="text-[11px] text-gray-500">{m.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#07a64b] group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Admissions Section */}
          <div className="bg-white rounded-[2rem] p-7 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Recent Admissions
                </h3>
                <p className="text-xs text-gray-500">Live learner records enrolled via portal</p>
              </div>
              <Link
                href="/admissions"
                className="text-xs font-bold text-[#07a64b] hover:text-[#05823a] flex items-center gap-1 group"
              >
                <span>View All Admissions</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Learner</th>
                    <th className="py-3 px-3">Course</th>
                    <th className="py-3 px-3">Counselor</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {admissions.slice(0, 4).map((a, i) => (
                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-gray-900 block">{a.name}</span>
                        <span className="text-[11px] text-gray-500">{a.email}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-gray-700 block truncate max-w-[200px]">
                          {a.courseName?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-medium">
                        {a.academicCounselor || "Unassigned"}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {a.status || "Enrolled"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href="/admissions"
                          className="p-1.5 inline-flex rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#07a64b] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <AdminRightSidebar />
        </div>
      </div>
    </div>
  );
}
