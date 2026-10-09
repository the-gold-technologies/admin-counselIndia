import type { Metadata } from "next";
import "./globals.css";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

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
        <div className="flex h-screen overflow-hidden font-sans p-[5px]">
          <AdminSidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="px-10 py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
