import React from "react";
import type { Metadata } from "next";
import { FileQuestion } from "lucide-react";
import { ErrorState } from "@/components/layout/ErrorState";

export const metadata: Metadata = { title: "Page not found | Counsel India Admin" };

export default function NotFound() {
  return (
    <ErrorState
      code="404"
      title="Page not found"
      icon={<FileQuestion className="w-10 h-10 text-amber-500" />}
      message="The page you're looking for doesn't exist or may have been moved. Check the address, or use the menu to find what you need."
    />
  );
}
