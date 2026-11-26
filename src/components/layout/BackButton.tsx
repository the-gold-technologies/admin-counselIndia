"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <button
      type="button"
      onClick={() =>
        window.history.length > 1 ? window.history.back() : (window.location.href = "/")
      }
      className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" /> Go back
    </button>
  );
}
