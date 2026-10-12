"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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

  // Profile Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Alerts
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileMsg({ type: "success", text: "Profile details updated successfully!" });
      if (data.user) {
        setUser((prev) => (prev ? { ...prev, ...data.user } : data.user));
      }
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "An error occurred" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ type: "error", text: err.message || "An error occurred" });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#09A64A]" />
          <p className="text-sm font-medium text-gray-500">Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[#09A64A]/10 text-[#09A64A]">
              <User className="w-7 h-7" />
            </span>
            Admin Profile & Account
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Manage your personal credentials, contact info, and security credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-[#09A64A] animate-pulse" />
            {user?.role || "SUPERADMIN"}
          </span>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-gradient-to-br from-[#0c1424] to-[#162238] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-[#09A64A]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#09A64A] to-emerald-400 text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white/10 shrink-0">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "SA"}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h2 className="text-xl md:text-2xl font-bold">{user?.name || "Super Admin"}</h2>
              <span className="self-center sm:self-auto px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/10 text-emerald-300 border border-white/10 tracking-wider">
                {user?.status || "Active"}
              </span>
            </div>
            
            <p className="text-gray-300 text-sm flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              {user?.email}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Role: {user?.role || "SUPERADMIN"}
              </span>
              {user?.lastLoginAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Last Login: {new Date(user.lastLoginAt).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#09A64A]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
              <p className="text-xs text-gray-500 font-medium">Update your name, contact phone, and admin email address</p>
            </div>
          </div>

          {profileMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                profileMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {profileMsg.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Super Admin"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#09A64A] focus:ring-2 focus:ring-[#09A64A]/20 text-sm font-medium transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@counselindia.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#09A64A] focus:ring-2 focus:ring-[#09A64A]/20 text-sm font-medium transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 font-medium">
                Used to log in to the admin panel.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#09A64A] focus:ring-2 focus:ring-[#09A64A]/20 text-sm font-medium transition-all text-gray-900 placeholder:text-gray-400 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#09A64A] hover:bg-[#07883b] transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Personal Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2 rounded-xl bg-emerald-50 text-[#09A64A]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Security & Password</h3>
              <p className="text-xs text-gray-500 font-medium">Update your account login password</p>
            </div>
          </div>

          {passwordMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                passwordMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {passwordMsg.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#09A64A] focus:ring-2 focus:ring-[#09A64A]/20 text-sm font-medium transition-all text-gray-900 placeholder:text-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#09A64A] focus:ring-2 focus:ring-[#09A64A]/20 text-sm font-medium transition-all text-gray-900 placeholder:text-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#09A64A] focus:ring-2 focus:ring-[#09A64A]/20 text-sm font-medium transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gray-900 hover:bg-black transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {savingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
