"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  GraduationCap,
  Users,
  UserCheck,
  TrendingUp,
  BookOpen,
  MailQuestion,
  BrainCircuit,
  Settings,
  X,
  Bell,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchItem {
  title: string;
  category: string;
  url: string;
  icon: any;
}

const STATIC_SEARCH_ITEMS: SearchItem[] = [
  {
    title: "Admissions Management",
    category: "Learners",
    url: "/admissions",
    icon: GraduationCap,
  },
  {
    title: "Alumni Management",
    category: "Registry",
    url: "/alumni",
    icon: Users,
  },
  {
    title: "Counsellor Management",
    category: "Network",
    url: "/counsellors",
    icon: UserCheck,
  },
  {
    title: "Course Leads Management",
    category: "Pipelines",
    url: "/course-leads",
    icon: TrendingUp,
  },
  {
    title: "Course Programs Catalog",
    category: "Academics",
    url: "/courses",
    icon: BookOpen,
  },
  {
    title: "Leads & Enquiries",
    category: "Submissions",
    url: "/leads",
    icon: MailQuestion,
  },
  {
    title: "Personality Test Assessment",
    category: "Psychology",
    url: "/personality-test/questions",
    icon: BrainCircuit,
  },
  {
    title: "Personality Test Info",
    category: "Psychology",
    url: "/personality-test/personality-test-info",
    icon: BrainCircuit,
  },
  {
    title: "Personality Test Entries",
    category: "Psychology",
    url: "/personality-test/personality-entry",
    icon: Users,
  },
  {
    title: "Personality Tab Results",
    category: "Psychology",
    url: "/personality-test/tab-result",
    icon: BrainCircuit,
  },
  {
    title: "Platform Settings & Brand",
    category: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

interface AdminHeaderProps {
  onRefresh?: () => void;
  userName?: string;
  notificationsCount?: number;
}

export function AdminHeader({
  onRefresh,
  userName = "Superadmin",
  notificationsCount = 0,
}: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const userInitials = (userName || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = STATIC_SEARCH_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
    setResults(filtered);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <section className="flex flex-col gap-6">
      <header className="flex justify-between items-center w-full">
        <h1 className="text-[28px] font-bold tracking-tight text-[#0B0F29] flex items-center gap-2">
          Welcome back <span className="text-[#09A64A]">{userName}</span>
          <span className="text-2xl animate-bounce origin-bottom-right delay-700">👋</span>
        </h1>

        <div className="flex items-center gap-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Data"
              className="p-2.5 rounded-full bg-white border border-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <div className="p-2.5 rounded-full bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm cursor-pointer">
              <Bell className="w-4 h-4" />
            </div>
            {notificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[9px] px-1.5 py-0.2 rounded-full border border-white">
                {notificationsCount > 99 ? "99+" : notificationsCount}
              </span>
            )}
          </div>

          <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 text-sm">
            {userInitials}
          </div>
        </div>
      </header>

      {/* Pill Search Bar matching Jaideva CMS */}
      <div className="flex justify-between items-center relative">
        <div className="relative group w-[360px]" ref={searchRef}>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#09A64A] transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search CMS modules & settings..."
            className="pl-10 pr-10 py-3.5 bg-white border-0 ring-1 ring-gray-100 w-full rounded-full text-sm font-medium focus:ring-2 focus:ring-[#09A64A] focus:outline-none shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Results Dropdown */}
          {isOpen && searchQuery && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden z-50 py-2 max-h-[320px] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-5 py-4 text-xs font-semibold text-gray-400 text-center italic">
                  No matching CMS modules found
                </div>
              ) : (
                <div className="flex flex-col">
                  {results.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        router.push(item.url);
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors w-full cursor-pointer"
                    >
                      <div className="p-2 rounded-xl bg-emerald-50 text-[#09A64A]">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-800">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {item.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminHeader;
