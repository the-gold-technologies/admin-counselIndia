import React from "react";
import {
  Users,
  UserCheck,
  Clock,
  CreditCard,
  ArrowUpRight,
} from "lucide-react";

interface AdmissionsStatsProps {
  total: number;
  enrolled: number;
  pending: number;
  totalFee: number;
}

export default function AdmissionsStats({
  total,
  enrolled,
  pending,
  totalFee,
}: AdmissionsStatsProps) {
  const cards = [
    {
      title: "Total Admissions",
      value: total.toLocaleString(),
      change: "+14% vs last month",
      icon: Users,
      color: "from-blue-600 to-indigo-600",
      bgColor: "bg-blue-50 text-blue-600 border-blue-200/50",
    },
    {
      title: "Active Enrolled",
      value: enrolled.toLocaleString(),
      change: "+92% conversion rate",
      icon: UserCheck,
      color: "from-emerald-600 to-teal-600",
      bgColor: "bg-emerald-50 text-emerald-600 border-emerald-200/50",
    },
    {
      title: "Pending Verification",
      value: pending.toLocaleString(),
      change: "Needs review today",
      icon: Clock,
      color: "from-amber-600 to-orange-600",
      bgColor: "bg-amber-50 text-amber-600 border-amber-200/50",
    },
    {
      title: "Total Fee Volume",
      value: "₹" + ((totalFee || 0) / 100000).toFixed(2) + " Lakh",
      change: "Paid & verified",
      icon: CreditCard,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50 text-purple-600 border-purple-200/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl border ${card.bgColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">
                  {card.change}
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
