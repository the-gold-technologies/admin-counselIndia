"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // User state
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string | null;
    status: string;
    lastLoginAt?: string | null;
    createdAt?: string | null;
  } | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback message
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/profile");
      const data = await res.json();
      if (data?.authenticated && data?.user) {
        setUser(data.user);
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setPhone(data.user.phone || "");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword) {
      if (!currentPassword) {
        setStatusMsg({
          type: "error",
          text: "Please enter your current password to set a new password.",
        });
        return;
      }
      if (newPassword.length < 6) {
        setStatusMsg({
          type: "error",
          text: "New password must be at least 6 characters long.",
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMsg({
          type: "error",
          text: "New password and confirmation do not match.",
        });
        return;
      }
    }

    setSaving(true);
    setSaved(false);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSaved(true);
      setStatusMsg({
        type: "success",
        text: data.message || "Profile details updated successfully!",
      });

      if (data.user) {
        setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text: err.message || "An error occurred while updating profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#09A64A]" />
          <p className="text-sm font-medium text-gray-400">
            Loading profile details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-24 w-full animate-in fade-in duration-300">
      {/* Header matching Jai Deva CMS PageHeader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight flex items-center gap-3">
            Admin Profile & Account Settings
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#09A64A] border border-emerald-100">
              {user?.role || "SUPERADMIN"}
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-medium">
            Update your administrator credentials, email address, and dashboard
            security password.
          </p>
        </div>

        {user?.lastLoginAt && (
          <div className="text-xs text-gray-500 font-medium self-start sm:self-auto px-4 py-2 rounded-full bg-white border border-gray-200/80 shadow-2xs">
            Last Login:{" "}
            <span className="font-semibold text-gray-700">
              {new Date(user.lastLoginAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Main Single Unified Card matching Jai Deva CMS Form Card */}
      <form
        onSubmit={handleSave}
        className="w-full bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-8"
      >
        {/* Status Alert Banner */}
        {statusMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              statusMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            {statusMsg.text}
          </div>
        )}

        {/* 1. Administrator Information Section */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2.5 bg-emerald-50 text-[#09A64A] rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B0F29]">
                1. Administrator Information
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Primary contact details for this administrator account.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                FULL NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Superadmin"
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition shadow-2xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="superadmin@counselindia.com"
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition shadow-2xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                PHONE NUMBER
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-9518241200"
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition shadow-2xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. Change Password Section */}
        <div className="flex flex-col gap-5 pt-2">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2.5 bg-orange-50 text-[#C86218] rounded-2xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0B0F29]">
                2. Change Password
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Update your login password. Leave blank if you do not want to
                change it.
              </p>
            </div>
          </div>

          {/* Current Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              CURRENT PASSWORD
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Leave blank to keep unchanged"
                className="w-full px-4 py-3.5 pr-12 bg-white border border-gray-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                title={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3.5 pr-12 bg-white border border-gray-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  title={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                CONFIRM NEW PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3.5 pr-12 bg-white border border-gray-200 rounded-2xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#09A64A]/20 focus:border-[#09A64A] transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  title={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button matching Jai Deva CMS SaveButton */}
        <div className="flex items-center justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className={`bg-[#09A64A] hover:bg-[#078a3c] cursor-pointer text-white px-8 py-3 rounded-full font-semibold tracking-wide transition-all duration-300 shadow-sm flex items-center justify-center gap-2.5 ${
              saving ? "opacity-75 cursor-not-allowed" : ""
            } ${saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {saving ? "Updating..." : saved ? "Updated!" : "Update Profile"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
