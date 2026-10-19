import type { Metadata } from "next";
import "./globals.css";
import { AdminShell } from "@/components/layout/AdminShell";
import { prisma } from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  let favicon =
    "https://res.cloudinary.com/dpa93copz/image/upload/v1791873100/counselindia/brand/favicon.png";
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
      select: { favicon: true, title: true },
    });
    if (settings?.favicon) {
      favicon = settings.favicon;
    }
  } catch (err) {
    console.warn("Failed to fetch site setting for admin metadata:", err);
  }

  return {
    title: "Counsel India Admin Portal",
    description: "Central Administration and Operations Panel for Counsel India",
    icons: {
      icon: [{ url: favicon }],
      shortcut: [{ url: favicon }],
      apple: [{ url: favicon }],
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let favicon =
    "https://res.cloudinary.com/dpa93copz/image/upload/v1791873100/counselindia/brand/favicon.png";
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "default" },
      select: { favicon: true },
    });
    if (settings?.favicon) {
      favicon = settings.favicon;
    }
  } catch (err) {
    // fallback
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={favicon} />
        <link rel="shortcut icon" href={favicon} />
        <link rel="apple-touch-icon" href={favicon} />
      </head>
      <body className="antialiased bg-[#f8f9fa] text-slate-800">
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
