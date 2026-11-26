"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import BlogForm, { BlogFormValues, EMPTY_BLOG } from "@/components/blogs/BlogForm";

export default function CreateBlogPage() {
  const router = useRouter();

  const handleCreate = async (values: BlogFormValues) => {
    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to create blog");
    router.push("/blogs");
    router.refresh();
  };

  return (
    <div className="space-y-6 pb-16 w-full">
      <div>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#09A64A] hover:text-[#089341] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>BACK TO BLOGS</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-[13px]">
          Write New Blog
        </h1>
      </div>

      <BlogForm
        initialValues={{ ...EMPTY_BLOG, publishedAt: new Date().toISOString().slice(0, 10) }}
        isNew
        submitLabel="Publish Blog"
        onSubmit={handleCreate}
      />
    </div>
  );
}
