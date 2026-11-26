"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Crown,
  ShieldCheck,
  Users,
  AlertCircle,
  Check,
  Search,
  RefreshCw,
  LayoutGrid,
  KeyRound,
  Lock,
  ArrowRight,
} from "lucide-react";
import { ADMIN_SECTIONS } from "@/lib/permissions";

interface Role {
  id: string;
  name: string;
  permissions: string[];
  staffCount: number;
}

interface FormState {
  id?: string;
  name: string;
  permissions: string[];
}

const sectionLabel = (key: string) => ADMIN_SECTIONS.find((s) => s.key === key)?.label || key;

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await fetch("/api/roles").then((r) => r.json());
      if (json.success) setRoles(json.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.permissions.some((p) => sectionLabel(p).toLowerCase().includes(q))
    );
  }, [roles, search]);

  const totalStaffAssigned = useMemo(
    () => roles.reduce((sum, r) => sum + (r.staffCount || 0), 0),
    [roles]
  );

  const toggle = (key: string) =>
    setForm((f) =>
      f
        ? {
            ...f,
            permissions: f.permissions.includes(key)
              ? f.permissions.filter((k) => k !== key)
              : [...f.permissions, key],
          }
        : f
    );

  const allSelected = form ? ADMIN_SECTIONS.every((s) => form.permissions.includes(s.key)) : false;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setError(null);
    if (!form.name.trim()) return setError("Please enter a role name.");
    setSaving(true);
    try {
      const res = await fetch(form.id ? `/api/roles/${form.id}` : "/api/roles", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, permissions: form.permissions }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Could not save");
      setForm(null);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const json = await fetch(`/api/roles/${deleteTarget.id}`, { method: "DELETE" }).then((x) =>
        x.json()
      );
      if (json.success) {
        setRoles((prev) => prev.filter((x) => x.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        setDeleteError(json.error || "Could not delete role.");
      }
    } catch {
      setDeleteError("Network error while deleting role.");
    } finally {
      setDeleting(false);
    }
  };

  const showSuperAdmin =
    !search.trim() ||
    "super admin".includes(search.trim().toLowerCase()) ||
    "staff".includes(search.trim().toLowerCase());

  return (
    <div className="space-y-7 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Roles &amp; Access</h1>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Control which admin sections each staff role can open.</span>
            <Link
              href="/staff"
              className="text-[#09A64A] font-bold hover:underline inline-flex items-center gap-1"
            >
              Manage staff <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            title="Refresh roles"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setForm({ name: "", permissions: [] });
            }}
            className="px-5 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-xs shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Role</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Roles",
            value: roles.length + 1,
            icon: ShieldCheck,
            cls: "bg-emerald-50 text-[#09A64A]",
          },
          {
            label: "Custom Roles",
            value: roles.length,
            icon: KeyRound,
            cls: "bg-blue-50 text-blue-600",
          },
          {
            label: "Assigned Staff",
            value: totalStaffAssigned,
            icon: Users,
            cls: "bg-amber-50 text-amber-600",
          },
          {
            label: "Admin Sections",
            value: ADMIN_SECTIONS.length,
            icon: LayoutGrid,
            cls: "bg-purple-50 text-purple-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {s.label}
              </span>
              <span className="text-2xl font-black text-gray-900 mt-1 block">{s.value}</span>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.cls}`}>
              <s.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles or sections..."
            className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <span className="text-xs font-semibold text-gray-500">
          Showing{" "}
          <span className="font-bold text-gray-900">
            {filteredRoles.length + (showSuperAdmin ? 1 : 0)}
          </span>{" "}
          {filteredRoles.length + (showSuperAdmin ? 1 : 0) === 1 ? "role" : "roles"}
        </span>
      </div>

      {/* Roles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-200/80 p-5 space-y-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full w-full" />
              <div className="flex gap-1.5 flex-wrap">
                <div className="h-5 bg-gray-100 rounded-md w-20" />
                <div className="h-5 bg-gray-100 rounded-md w-24" />
                <div className="h-5 bg-gray-100 rounded-md w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Built-in Super Admin */}
          {showSuperAdmin && (
            <div className="bg-linear-to-br from-purple-50/60 via-white to-white rounded-2xl border border-purple-200/90 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 text-sm">Super Admin</h3>
                      <p className="text-[11px] text-purple-600/80 font-semibold flex items-center gap-1 mt-0.5">
                        <Lock className="w-3 h-3" /> Built-in role
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                    System
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
                    <span>Section access</span>
                    <span className="text-purple-700 font-bold">Full access</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-purple-100 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-full" />
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-4 leading-relaxed">
                  Unrestricted access to all {ADMIN_SECTIONS.length} admin sections, including Staff
                  &amp; Roles management.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                <span>Protected role</span>
                <span>Cannot be edited or deleted</span>
              </div>
            </div>
          )}

          {filteredRoles.map((r) => {
            const pct = Math.round((r.permissions.length / ADMIN_SECTIONS.length) * 100);
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:border-gray-300/80 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#09A64A] border border-emerald-100 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-gray-900 text-sm truncate">{r.name}</h3>
                        <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span>
                            {r.staffCount} {r.staffCount === 1 ? "staff member" : "staff members"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setForm({ id: r.id, name: r.name, permissions: r.permissions });
                        }}
                        title="Edit role"
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(r);
                        }}
                        title={
                          r.staffCount ? "Move its staff to another role first" : "Delete role"
                        }
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Access progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1.5">
                      <span>Section access</span>
                      <span className="text-gray-800 font-bold">
                        {r.permissions.length} of {ADMIN_SECTIONS.length}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-[#09A64A] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Permission badges */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {r.permissions.length === 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-[11px] font-medium text-gray-400">
                        Dashboard &amp; Profile only
                      </span>
                    ) : (
                      r.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/70 text-[11px] font-semibold text-[#077d37]"
                        >
                          {sectionLabel(p)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredRoles.length === 0 && !showSuperAdmin && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-10 text-center">
          <p className="text-sm font-bold text-gray-700">No roles match &ldquo;{search}&rdquo;</p>
          <p className="text-xs text-gray-400 mt-1">
            Try searching by another role name or admin section.
          </p>
        </div>
      )}

      {!loading && roles.length === 0 && !search && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm font-bold text-gray-700">No custom roles yet</p>
          <p className="text-xs text-gray-500 mt-1">
            Click &ldquo;New Role&rdquo; to create your first staff role.
          </p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {form && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={save}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#09A64A] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">
                    {form.id ? "Edit Role" : "Create New Role"}
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Choose a name and select which sections this role can access.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Role name *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Support, Marketing, Content Editor"
                  autoFocus
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] focus:bg-white font-medium transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Section permissions
                    </label>
                    <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[11px] font-bold">
                      {form.permissions.length} / {ADMIN_SECTIONS.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        permissions: allSelected ? [] : ADMIN_SECTIONS.map((s) => s.key),
                      })
                    }
                    className="text-xs font-bold text-[#09A64A] hover:underline cursor-pointer"
                  >
                    {allSelected ? "Clear all" : "Select all"}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ADMIN_SECTIONS.map((s) => {
                    const on = form.permissions.includes(s.key);
                    return (
                      <button
                        type="button"
                        key={s.key}
                        onClick={() => toggle(s.key)}
                        className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          on
                            ? "border-[#09A64A] bg-emerald-50/60 shadow-2xs"
                            : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            on
                              ? "bg-[#09A64A] border-[#09A64A] text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {on && <Check className="w-3 h-3" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-bold text-gray-900">{s.label}</span>
                          <span className="block text-[11px] text-gray-500 mt-0.5">
                            {s.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-400 mt-2.5">
                  Everyone can always access the Dashboard and their own Profile.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#09A64A] hover:bg-[#089341] disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer"
              >
                {saving ? "Saving..." : form.id ? "Save Changes" : "Create Role"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-gray-900 text-center">Delete Role?</h3>
            <p className="text-xs text-gray-500 text-center mt-1.5">
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-800">&ldquo;{deleteTarget.name}&rdquo;</span>?
              This action cannot be undone.
            </p>
            {deleteTarget.staffCount > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>
                  This role is currently assigned to <strong>{deleteTarget.staffCount}</strong>{" "}
                  {deleteTarget.staffCount === 1 ? "staff member" : "staff members"}. Reassign them
                  before deleting.
                </span>
              </div>
            )}
            {deleteError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
