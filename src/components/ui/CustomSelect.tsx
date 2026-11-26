"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  count?: number | string;
  badge?: string;
  icon?: React.ReactNode;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  ariaLabel?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className = "",
  buttonClassName = "",
  dropdownClassName = "",
  disabled = false,
  size = "md",
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  // Size variations
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg min-h-[34px]",
    md: "px-3.5 py-2 text-sm rounded-xl min-h-[40px]",
    lg: "px-4 py-2.5 text-base rounded-xl min-h-[46px]",
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left select-none ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel || placeholder}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`w-full flex items-center justify-between gap-2.5 bg-white border border-gray-200/90 text-gray-800 font-semibold shadow-2xs hover:border-gray-300 hover:bg-gray-50/50 focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/25 focus:border-[#09A64A] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${buttonClassName} ${
          isOpen ? "border-[#09A64A] ring-2 ring-[#09A64A]/20 bg-emerald-50/20" : ""
        }`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0 text-gray-500">{selectedOption.icon}</span>
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          {selectedOption?.count !== undefined && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
              {selectedOption.count}
            </span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#09A64A]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 w-full min-w-[200px] bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-900/10 py-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 origin-top ${dropdownClassName}`}
        >
          <div className="max-h-64 overflow-y-auto px-1 space-y-0.5">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#09A64A]/10 text-[#09A64A] font-bold"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {opt.icon && (
                      <span
                        className={`shrink-0 ${isSelected ? "text-[#09A64A]" : "text-gray-400"}`}
                      >
                        {opt.icon}
                      </span>
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {opt.count !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isSelected ? "bg-[#09A64A] text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {opt.count}
                      </span>
                    )}
                    {opt.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-gray-100 text-gray-600">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-[#09A64A] stroke-[2.5]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
