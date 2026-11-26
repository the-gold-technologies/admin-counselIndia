"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, AlertCircle } from "lucide-react";
import BlogForm, { BlogFormValues, BlogItem, blogToFormValues } from "@/components/blogs/BlogForm";

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/blogs/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBlog(json.data);
        else setLoadError(json.error || "Blog not found");
      })
      .catch(() => setLoadError("Could not load this blog."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async (values: BlogFormValues) => {
    const res = await fetch(`/api/blogs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Failed to update blog");
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
          Edit Blog
        </h1>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-16 text-center shadow-xs">
          <div className="w-8 h-8 border-3 border-[#09A64A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Loading blog...</p>
        </div>
      ) : loadError || !blog ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{loadError || "Blog not found"}</span>
        </div>
      ) : (
        <BlogForm
          initialValues={blogToFormValues(blog)}
          isNew={false}
          submitLabel="Save Changes"
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
