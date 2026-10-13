"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  UserCheck,
  TrendingUp,
  BookOpen,
  Layers,
  MessageSquareText,
  User,
  BrainCircuit,
  Settings,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
  sublinks?: {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }[];
}

const sidebarLinks: SidebarItem[] = [
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
    title: "Manage Counsellors",
    href: "/counsellors",
    icon: UserCheck,
  },
  {
    title: "Course Leads",
    href: "/course-leads",
    icon: TrendingUp,
  },
  {
    title: "Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "Enquires/Leads",
    icon: Layers,
    sublinks: [
      { title: "Subscribe", href: "/leads/subscribe", icon: MessageSquareText },
      {
        title: "Landing Pages",
        href: "/leads/landing-page",
        icon: MessageSquareText,
      },
      {
        title: "Exit Intent",
        href: "/leads/exit-intent",
        icon: MessageSquareText,
      },
      { title: "Contact Us", href: "/leads/contact-us", icon: User },
      { title: "Book a Session", href: "/leads/book-session", icon: User },
      { title: "Ci For Business", href: "/leads/ci-business", icon: User },
      {
        title: "Personality Test",
        href: "/personality-test/personality-entry",
        icon: MessageSquareText,
      },
      { title: "Ebook", href: "/leads/ebook", icon: MessageSquareText },
      {
        title: "Newsletter",
        href: "/leads/newsletter",
        icon: MessageSquareText,
      },
      {
        title: "Courses Enquiry",
        href: "/leads/courses-enquiry",
        icon: MessageSquareText,
      },
      { title: "utm data", href: "/leads/utm-data", icon: MessageSquareText },
      {
        title: "Landing Page UTM",
        href: "/leads/landing-page-utm",
        icon: MessageSquareText,
      },
      {
        title: "course registeration",
        href: "/leads/course-registration",
        icon: MessageSquareText,
      },
      { title: "Ask Question", href: "/leads/ask-question", icon: User },
      { title: "App Data", href: "/leads/app-data", icon: User },
      {
        title: "certificate_data",
        href: "/leads/certificate-data",
        icon: User,
      },
      { title: "leadform data", href: "/leads/leadform-data", icon: User },
      {
        title: "Refer Enquiry",
        href: "/leads/refer-enquiry",
        icon: MessageSquareText,
      },
    ],
  },
  {
    title: "Personality Test",
    icon: BrainCircuit,
    sublinks: [
      {
        title: "Personality Test Info",
        href: "/personality-test/personality-test-info",
      },
      { title: "Questions", href: "/personality-test/questions" },
      {
        title: "Personality Entry",
        href: "/personality-test/personality-entry",
      },
      { title: "Tab Result", href: "/personality-test/tab-result" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    sublinks: [
      { title: "Admin Settings", href: "/settings/admin" },
      { title: "Config Settings", href: "/settings/config" },
      { title: "Contact Us Settings", href: "/settings/contact" },
      { title: "Content Settings", href: "/settings/content" },
      { title: "Footer Settings", href: "/settings/footer" },
    ],
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  const [openGroups, setOpenGroups] = useState<string[]>(() => {
    return sidebarLinks
      .filter((item) =>
        item.sublinks?.some(
          (sublink) =>
            pathname === sublink.href ||
            pathname.startsWith(sublink.href + "/"),
        ),
      )
      .map((item) => item.title);
  });

  useEffect(() => {
    const activeGroups = sidebarLinks
      .filter((item) =>
        item.sublinks?.some(
          (sublink) =>
            pathname === sublink.href ||
            pathname.startsWith(sublink.href + "/"),
        ),
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
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title],
    );
  };

  return (
    <div className="flex h-full w-[280px] flex-col bg-[#0c1424] text-white overflow-hidden rounded-l-[2.5rem] border-l border-white/5 shrink-0 shadow-2xl">
      {/* Logo Area */}
      <div className="flex h-24 items-center px-8 border-b border-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[#09A64A] font-black italic shadow-md text-lg">
            CI
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight block text-white leading-tight">
              Counsel India
            </span>
            <span className="text-[12px] font-bold text-[#09A64A] tracking-wider uppercase block mt-0.5">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1.5 px-4">
          {sidebarLinks.map((item, index) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : item.href
                  ? pathname.startsWith(item.href)
                  : false;
            const isOpen = openGroups.includes(item.title);

            if (item.sublinks) {
              const isGroupActive = item.sublinks.some(
                (sublink) =>
                  pathname === sublink.href ||
                  pathname.startsWith(sublink.href + "/"),
              );

              return (
                <div key={index} className="pt-2 first:pt-0">
                  <div
                    className={cn(
                      "flex items-center justify-between cursor-pointer group px-3.5 py-2.5 rounded-xl transition-all duration-150",
                      isGroupActive
                        ? "bg-[#09A64A]/10 text-[#09A64A]"
                        : "hover:bg-white/5 text-gray-300",
                    )}
                    onClick={() => toggleGroup(item.title)}
                  >
                    <div className="text-[14px] font-bold tracking-tight flex items-center gap-2.5 whitespace-nowrap">
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isGroupActive
                            ? "text-[#09A64A]"
                            : "text-gray-400 group-hover:text-white",
                        )}
                        strokeWidth={2.4}
                      />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform shrink-0",
                        isGroupActive
                          ? "text-[#09A64A]"
                          : "text-gray-400 group-hover:text-white",
                        isOpen ? "rotate-180" : "",
                      )}
                    />
                  </div>
                  {isOpen && (
                    <div className="space-y-0.5 pl-3 ml-2 border-l border-white/10 py-1.5 mt-1">
                      {item.sublinks.map((sublink, subIndex) => {
                        const isSubActive =
                          pathname === sublink.href ||
                          pathname.startsWith(sublink.href + "/");
                        const SubIcon = sublink.icon;
                        return (
                          <Link
                            key={subIndex}
                            href={sublink.href}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 whitespace-nowrap",
                              isSubActive
                                ? "text-[#09A64A] bg-[#09A64A]/15 font-bold shadow-sm"
                                : "text-gray-300 hover:text-white hover:bg-white/5",
                            )}
                          >
                            {SubIcon && (
                              <SubIcon
                                className={cn(
                                  "w-4 h-4 shrink-0",
                                  isSubActive
                                    ? "text-[#09A64A]"
                                    : "text-gray-400",
                                )}
                                strokeWidth={isSubActive ? 2.4 : 2}
                              />
                            )}
                            <span className="truncate">{sublink.title}</span>
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
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 whitespace-nowrap",
                  isActive
                    ? "bg-[#09A64A] text-white font-bold shadow-md shadow-[#09A64A]/30 transform scale-[1.01]"
                    : "text-gray-300 hover:bg-white/5 hover:text-white",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-white" : "text-gray-400",
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="whitespace-nowrap">{item.title}</span>
                </div>
                {item.badge && (
                  <div
                    className={cn(
                      "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0",
                      isActive
                        ? "bg-white text-[#09A64A]"
                        : "bg-[#09A64A] text-white",
                    )}
                  >
                    {item.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Sign Out Button Only */}
      <div className="px-4 pb-6 border-t border-white/5 pt-4">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl text-[13px] font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50 group shadow-sm"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-rose-400 transition-colors" />
          <span>{isLoggingOut ? "Signing Out..." : "Sign Out"}</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;
