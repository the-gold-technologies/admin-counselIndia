"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  ShieldCheck,
  Crown,
  AlertCircle,
  Download,
  Printer,
} from "lucide-react";
import { ADMIN_SECTIONS } from "@/lib/permissions";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

interface RoleOption {
  id: string;
  name: string;
  permissions: string[];
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string; // SUPERADMIN | STAFF
  status: string;
  lastLoginAt?: string | null;
  createdAt: string;
  staffRole?: RoleOption | null;
}

interface FormState {
  id?: string;
  name: string;
  email: string;
  phone: string;
  access: string; // "SUPERADMIN" or role id
  status: string;
  password: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  access: "",
  status: "Active",
  password: "",
};

const inputCls =
  "w-full px-4 py-2.5 bg-[#f8fafc] border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all font-medium text-gray-900";
const labelCls = "block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5";

const sectionLabel = (key: string) => ADMIN_SECTIONS.find((s) => s.key === key)?.label || key;

const formatDate = (d?: string | null) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

const accessLabel = (s: StaffMember) =>
  s.role === "SUPERADMIN" ? "Super Admin" : s.staffRole?.name || "No role";

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [meIsSuper, setMeIsSuper] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, r, me] = await Promise.all([
        fetch("/api/staff").then((x) => x.json()),
        fetch("/api/roles").then((x) => x.json()),
        fetch("/api/auth/profile").then((x) => x.json()),
      ]);
      if (s.success) setStaff(s.data);
      if (r.success) setRoles(r.data);
      if (me?.user) {
        setMeId(me.user.id);
        setMeIsSuper(me.user.role === "SUPERADMIN");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((s) =>
      [s.name, s.email, s.phone || "", accessLabel(s)].some((v) => v.toLowerCase().includes(q))
    );
  }, [staff, search]);

  const openNew = () => {
    setError(null);
    setForm({ ...EMPTY_FORM, access: roles[0]?.id || "" });
  };

  const openEdit = (s: StaffMember) => {
    setError(null);
    setForm({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone || "",
      access: s.role === "SUPERADMIN" ? "SUPERADMIN" : s.staffRole?.id || "",
      status: s.status,
      password: "",
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);
    if (!form.access) return setError("Please choose a role.");
    if (!form.id && !form.password) return setError("Please set a password.");

    setSaving(true);
    try {
      const { id, password, ...rest } = form;
      const res = await fetch(id ? `/api/staff/${id}` : "/api/staff", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(password ? { ...rest, password } : rest),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not save");
      setForm(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (s: StaffMember) => {
    const res = await fetch(`/api/staff/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: s.status === "Active" ? "Inactive" : "Active" }),
    });
    const json = await res.json();
    if (json.success) setStaff((prev) => prev.map((x) => (x.id === s.id ? json.data : x)));
    else alert(json.error);
  };

  const remove = async (s: StaffMember) => {
    if (!confirm(`Delete ${s.name}? They will no longer be able to log in.`)) return;
    const res = await fetch(`/api/staff/${s.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) setStaff((prev) => prev.filter((x) => x.id !== s.id));
    else alert(json.error);
  };

  const exportCsv = () => {
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [
      ["Name", "Email", "Phone", "Role", "Sections", "Status", "Last login"].map(q).join(","),
      ...filtered.map((s) =>
        [
          s.name,
          s.email,
          s.phone || "",
          accessLabel(s),
          s.role === "SUPERADMIN"
            ? "All"
            : (s.staffRole?.permissions || []).map(sectionLabel).join(", "),
          s.status,
          formatDate(s.lastLoginAt),
        ]
          .map(q)
          .join(",")
      ),
    ];
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `counselindia_staff_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const print = () => {
    const win = window.open("", "_blank", "width=1000,height=800");
    if (!win) return;
    const rows = filtered
      .map(
        (s, i) =>
          `<tr><td>${i + 1}</td><td><b>${escapeHtml(s.name)}</b><br>${escapeHtml(s.email)}</td><td>${escapeHtml(accessLabel(s))}</td><td>${escapeHtml(
            s.role === "SUPERADMIN"
              ? "All sections"
              : (s.staffRole?.permissions || []).map(sectionLabel).join(", ") || "-"
          )}</td><td>${escapeHtml(s.status)}</td></tr>`
      )
      .join("");
    win.document.write(`<!DOCTYPE html><html><head><title>Staff</title><style>
      body{font-family:Arial,sans-serif;padding:24px}h1{font-size:22px}table{width:100%;border-collapse:collapse}
      th,td{border:1px solid #e2e8f0;padding:8px;font-size:12.5px;text-align:left;vertical-align:top}th{background:#09A64A;color:#fff}
      @media print{th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    </style></head><body><h1>Staff &amp; Access</h1><table><thead><tr><th>#</th><th>Staff</th><th>Role</th><th>Sections</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table><script>window.onload=function(){window.print()}</script></body></html>`);
    win.document.close();
  };

  const selectedRole = roles.find((r) => r.id === form?.access);
  const btn =
    "px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold shadow-2xs inline-flex items-center gap-1.5 cursor-pointer";

  return (
    <div className="space-y-7 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Staff Members</h1>
          <p className="text-xs text-gray-500 mt-1">
            Who can log in to the admin panel, and which sections they can open.{" "}
            <Link href="/roles" className="text-[#09A64A] font-bold hover:underline">
              Manage roles →
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openNew}
            className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
          <button onClick={exportCsv} className={btn}>
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button onClick={print} className={btn}>
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, role..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#09A64A]"
          />
        </div>
        <button
          onClick={load}
          title="Refresh"
          className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#09A64A] text-white font-semibold text-[13.5px]">
                <th className="py-4 px-5 w-14 text-center">#</th>
                <th className="py-4 px-5">Staff member</th>
                <th className="py-4 px-5">Role</th>
                <th className="py-4 px-5">Can open</th>
                <th className="py-4 px-5 w-40">Last login</th>
                <th className="py-4 px-5 w-28 text-center">Status</th>
                <th className="py-4 px-5 w-28 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-sm text-gray-400">
                    {loading ? "Loading staff..." : "No staff members found."}
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => {
                  const isMe = s.id === meId;
                  const isSuper = s.role === "SUPERADMIN";
                  const locked = isSuper && !meIsSuper; // only Super Admins manage Super Admins
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/70 align-top">
                      <td className="py-4 px-5 text-center font-bold text-gray-500 text-sm">
                        {i + 1}
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-bold text-gray-900 text-[14px]">
                          {s.name}{" "}
                          {isMe && <span className="text-[11px] text-gray-400">(you)</span>}
                        </div>
                        <div className="text-xs text-gray-500">{s.email}</div>
                        {s.phone && <div className="text-xs text-gray-400">{s.phone}</div>}
                      </td>
                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${
                            isSuper
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : s.staffRole
                                ? "bg-emerald-50 text-[#09A64A] border-emerald-200"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                          }`}
                        >
                          {isSuper ? (
                            <Crown className="w-3 h-3" />
                          ) : (
                            <ShieldCheck className="w-3 h-3" />
                          )}
                          {accessLabel(s)}
                        </span>
                      </td>
                      <td className="py-4 px-5 max-w-[360px]">
                        {isSuper ? (
                          <span className="text-xs text-gray-600 font-semibold">Everything</span>
                        ) : (s.staffRole?.permissions || []).length === 0 ? (
                          <span className="text-xs text-gray-400">Dashboard & profile only</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {s.staffRole!.permissions.map((p) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700"
                              >
                                {sectionLabel(p)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-xs text-gray-500">
                        {formatDate(s.lastLoginAt)}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button
                          disabled={isMe || locked}
                          onClick={() => toggleStatus(s)}
                          title={isMe ? "You can't deactivate yourself" : "Click to change"}
                          className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer disabled:cursor-not-allowed ${
                            s.status === "Active"
                              ? "bg-emerald-50 text-[#09A64A] border-emerald-200"
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}
                        >
                          {s.status}
                        </button>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            disabled={locked}
                            onClick={() => openEdit(s)}
                            title="Edit"
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            disabled={isMe || locked}
                            onClick={() => remove(s)}
                            title="Delete"
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / edit modal */}
      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={save}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">
                {form.id ? "Edit Staff Member" : "Add Staff Member"}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className={labelCls}>Name *</label>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Email (login) *</label>
                  <input
                    type="email"
                    className={inputCls}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    className={inputCls}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Role *</label>
                <SearchableSelect
                  value={form.access}
                  disabled={form.id === meId}
                  onChange={(val) => setForm({ ...form, access: val })}
                  placeholder="Choose a role…"
                  searchPlaceholder="Search roles..."
                  options={[
                    ...(meIsSuper
                      ? [{ value: "SUPERADMIN", label: "Super Admin (full access)" }]
                      : []),
                    ...roles.map((r) => ({ value: r.id, label: r.name })),
                  ]}
                  buttonClassName="py-2.5 text-sm font-medium"
                />
                {form.id === meId && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    You can&apos;t change your own role.
                  </p>
                )}
                {form.access === "SUPERADMIN" ? (
                  <p className="text-[11px] text-purple-600 mt-1.5 font-semibold">
                    Can open every section.
                  </p>
                ) : selectedRole ? (
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Can open:{" "}
                    <b>
                      {selectedRole.permissions.map(sectionLabel).join(", ") ||
                        "Dashboard & profile only"}
                    </b>
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{form.id ? "New password" : "Password *"}</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={inputCls}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={
                      form.id ? "Leave empty to keep" : "Min 10 chars, letters + numbers"
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <SearchableSelect
                    value={form.status}
                    disabled={form.id === meId}
                    onChange={(val) => setForm({ ...form, status: val })}
                    searchable={false}
                    options={[
                      { value: "Active", label: "Active (can log in)" },
                      { value: "Inactive", label: "Inactive (blocked)" },
                    ]}
                    buttonClassName="py-2.5 text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] disabled:opacity-60 text-white text-sm font-bold cursor-pointer"
              >
                {saving ? "Saving..." : form.id ? "Save Changes" : "Add Staff"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
