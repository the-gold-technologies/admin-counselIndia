import type { Metadata } from "next";
import "./globals.css";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata: Metadata = {
  title: "Counsel India Admin Portal",
  description: "Central Administration and Operations Panel for Counsel India",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#f8f9fa] text-slate-800">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
