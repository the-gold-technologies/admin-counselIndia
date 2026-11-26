"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  /** Small text on the right of the header, e.g. "Filled" / "Not set". */
  badge?: React.ReactNode;
  children: React.ReactNode;
}

/** A form section that can be opened and closed by clicking its header. */
export function CollapsibleSection({
  title,
  description,
  icon: Icon,
  defaultOpen = false,
  badge,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl border border-gray-200/80 bg-white overflow-hidden"
      // A required field inside a closed section: open it so the browser can show the message
      onInvalidCapture={() => setOpen(true)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-3 px-6 py-4 text-left cursor-pointer transition-colors ${
          open ? "bg-gray-50/80 border-b border-gray-100" : "hover:bg-gray-50/60"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#09A64A] border border-emerald-100 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-black text-gray-900">{title}</h3>
            {description && <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {badge}
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {/* Kept mounted while closed so typed values and browser validation are not lost */}
      <div className={open ? "p-6 space-y-8" : "hidden"}>{children}</div>
    </div>
  );
}
