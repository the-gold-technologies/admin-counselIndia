"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { ModuleStructure } from "@/components/dashboard/ModuleStructure";
import { RecentSubmissions } from "@/components/dashboard/RecentSubmissions";
import { AdminRightSidebar } from "@/components/dashboard/AdminRightSidebar";

export default function DashboardHomePage() {
  const [stats, setStats] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, userRes] = await Promise.all([
        fetch("/api/dashboard/stats", { cache: "no-store" }),
        fetch("/api/auth/profile", { cache: "no-store" }).catch(() => null),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      if (userRes && userRes.ok) {
        const userData = await userRes.json();
        if (userData.authenticated && userData.user) {
          setUser(userData.user);
        }
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Combine admissions, leads, and course leads for recent submissions list
  const recentItems = [
    ...(stats?.recentAdmissions || []),
    ...(stats?.recentLeads || []),
    ...(stats?.recentCourseLeads || []),
  ].sort((a, b) => {
    const timeA = new Date(a.admissionDate || a.createdAt || 0).getTime();
    const timeB = new Date(b.admissionDate || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const todayCount = (stats?.todayAdmissions || 0) + (stats?.todayInquiries || 0);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      {/* Top Header with Interactive Pill Search & Profile */}
      <AdminHeader
        userName={user?.name || "Admin"}
        notificationsCount={todayCount}
        onRefresh={fetchDashboardData}
      />

      {/* Main Grid matching Jaideva CMS layout: 8 Cols Left, 4 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <OverviewStats stats={stats} loading={loading} />
          <ModuleStructure stats={stats} loading={loading} />
          <RecentSubmissions items={recentItems} loading={loading} />
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <AdminRightSidebar stats={stats} loading={loading} />
        </div>
      </div>
    </div>
  );
}
