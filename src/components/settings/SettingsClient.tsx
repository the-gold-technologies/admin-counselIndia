"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Sliders,
  Phone,
  FileText,
  PanelBottom,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  Mail,
  Globe,
  MapPin,
} from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { CmsEditor } from "@/components/ui/CmsEditor";

export type SettingsTab = "admin" | "config" | "contact" | "content" | "footer";

interface SettingsClientProps {
  initialTab?: SettingsTab;
}

export function SettingsClient({ initialTab = "admin" }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [savingTab, setSavingTab] = useState<SettingsTab | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Settings State
  const [settings, setSettings] = useState({
    // Admin Settings
    title: "",
    footer: "",
    referWallet: "100",
    logo: "",
    lightLogo: "",
    favicon: "",

    // Config Settings
    companyName: "",
    websiteLink: "",
    address: "",
    adminEmail: "",
    supportEmail: "",
    helplineNumber: "",
    whatsNumber: "",
    emergencyNumber: "",
    facebookLink: "",
    linkedinLink: "",
    twitterLink: "",
    youtubeLink: "",
    pinterestLink: "",
    instaLink: "",
    gstNumber: "",
    googlePlayAppLink: "",
    iosAppLink: "",

    // Contact Us Settings
    contactUsMobile: "",
    contactUsMail: "",
    contactUsHotline: "",
    contactUsHeadOffice: "",
    contactUsBranchOffice: "",
    contactUsHoursOperation: "",

    // Content Settings
    aboutUs: "",
    ourVision: "",
    privacy: "",
    termsCondition: "",
    howCanSignup: "",
    refundPolicy: "",
    academicPolicy: "",
    contactUsContent: "",

    // Footer Settings
    footerTitle: "",
    footerCompanyName: "",
    footerAddress: "",
    footerSupportEmail: "",
    footerWhatsappNumber: "",
    footerHelplineNumber: "",
    footerTwitterLink: "",
    footerFbLink: "",
    footerYoutubeLink: "",
    footerLinkedinLink: "",
  });

  // Fetch initial settings from DB
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch("/api/settings");
        const json = await res.json();
        if (json.success && json.data) {
          setSettings((prev) => ({
            ...prev,
            ...json.data,
            referWallet: json.data.referWallet
              ? String(json.data.referWallet)
              : "100",
          }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        setToast({
          type: "error",
          message: "Failed to load settings. Please refresh.",
        });
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Sync active tab with url parameter
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    router.push(`/settings/${tab}`);
  };

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSaveTab = async (tab: SettingsTab) => {
    try {
      setSavingTab(tab);
      let payload: Partial<typeof settings> = {};

      if (tab === "admin") {
        payload = {
          title: settings.title,
          footer: settings.footer,
          referWallet: settings.referWallet,
          logo: settings.logo,
          lightLogo: settings.lightLogo,
          favicon: settings.favicon,
        };
      } else if (tab === "config") {
        payload = {
          companyName: settings.companyName,
          websiteLink: settings.websiteLink,
          address: settings.address,
          adminEmail: settings.adminEmail,
          supportEmail: settings.supportEmail,
          helplineNumber: settings.helplineNumber,
          whatsNumber: settings.whatsNumber,
          emergencyNumber: settings.emergencyNumber,
          facebookLink: settings.facebookLink,
          linkedinLink: settings.linkedinLink,
          twitterLink: settings.twitterLink,
          youtubeLink: settings.youtubeLink,
          pinterestLink: settings.pinterestLink,
          instaLink: settings.instaLink,
          gstNumber: settings.gstNumber,
          googlePlayAppLink: settings.googlePlayAppLink,
          iosAppLink: settings.iosAppLink,
        };
      } else if (tab === "contact") {
        payload = {
          contactUsMobile: settings.contactUsMobile,
          contactUsMail: settings.contactUsMail,
          contactUsHotline: settings.contactUsHotline,
          contactUsHeadOffice: settings.contactUsHeadOffice,
          contactUsBranchOffice: settings.contactUsBranchOffice,
          contactUsHoursOperation: settings.contactUsHoursOperation,
        };
      } else if (tab === "content") {
        payload = {
          aboutUs: settings.aboutUs,
          ourVision: settings.ourVision,
          privacy: settings.privacy,
          termsCondition: settings.termsCondition,
          howCanSignup: settings.howCanSignup,
          refundPolicy: settings.refundPolicy,
          academicPolicy: settings.academicPolicy,
          contactUsContent: settings.contactUsContent,
        };
      } else if (tab === "footer") {
        payload = {
          footerTitle: settings.footerTitle,
          footerCompanyName: settings.footerCompanyName,
          footerAddress: settings.footerAddress,
          gstNumber: settings.gstNumber,
          footerSupportEmail: settings.footerSupportEmail,
          footerWhatsappNumber: settings.footerWhatsappNumber,
          footerHelplineNumber: settings.footerHelplineNumber,
          footerTwitterLink: settings.footerTwitterLink,
          footerFbLink: settings.footerFbLink,
          instaLink: settings.instaLink,
          footerYoutubeLink: settings.footerYoutubeLink,
          footerLinkedinLink: settings.footerLinkedinLink,
        };
      }

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast(
          `${tab.charAt(0).toUpperCase() + tab.slice(1)} Settings saved successfully!`,
        );
      } else {
        showToast(json.error || "Failed to save settings", "error");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("Network error. Please try again.", "error");
    } finally {
      setSavingTab(null);
    }
  };

  const tabsConfig: {
    id: SettingsTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: "admin", label: "Admin Settings", icon: Shield },
    { id: "config", label: "Config Settings", icon: Sliders },
    { id: "contact", label: "Contact Us Settings", icon: Phone },
    { id: "content", label: "Content Settings", icon: FileText },
    { id: "footer", label: "Footer Settings", icon: PanelBottom },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-[#09A64A] mx-auto mb-3" />
        <p className="text-sm font-semibold text-gray-600">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#09A64A] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header matching Courses & Counsellors page layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#09A64A]">
              System Configuration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Settings Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Configure system parameters, brand assets, contact channels, legal
            policies, and footer details
          </p>
        </div>
      </div>

      {/* Sleek Underline Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 overflow-x-auto pb-px">
        {tabsConfig.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-[#09A64A] text-[#09A64A]"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? "text-[#09A64A]" : "text-gray-400"}`}
              />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: ADMIN SETTINGS ================= */}
      {activeTab === "admin" && (
        <div className="space-y-8">
          {/* Section 1: General Portal Information */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                1. General Portal Information
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Portal title, footer text, and referral rewards
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Portal Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) =>
                    setSettings({ ...settings, title: e.target.value })
                  }
                  placeholder="e.g. Counselindia"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
                <p className="text-[11px] text-gray-400">
                  Main title for browser tabs & navigation
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Footer Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.footer}
                  onChange={(e) =>
                    setSettings({ ...settings, footer: e.target.value })
                  }
                  placeholder="e.g. Counselindia"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
                <p className="text-[11px] text-gray-400">
                  Copyright label displayed in footer
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Refer Wallet Bonus (₹)
                </label>
                <input
                  type="number"
                  value={settings.referWallet}
                  onChange={(e) =>
                    setSettings({ ...settings, referWallet: e.target.value })
                  }
                  placeholder="100"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
                <p className="text-[11px] text-gray-400">
                  Bonus points added for user referral
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Brand Identity Assets */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                2. Brand Identity Assets
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Official logos and browser tab favicon
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUploadField
                label="Primary Brand Logo"
                value={settings.logo}
                onChange={(url) => setSettings({ ...settings, logo: url })}
              />

              <ImageUploadField
                label="Light / Transparent Logo"
                value={settings.lightLogo}
                onChange={(url) => setSettings({ ...settings, lightLogo: url })}
              />

              <ImageUploadField
                label="Favicon (.ico or .png)"
                value={settings.favicon}
                onChange={(url) => setSettings({ ...settings, favicon: url })}
              />
            </div>
          </div>

          {/* Single, smooth rounded save button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={savingTab !== null}
              onClick={() => handleSaveTab("admin")}
              className="px-8 py-3.5 rounded-2xl bg-[#09A64A] hover:bg-[#078a3d] active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/15 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {savingTab === "admin" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Admin Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CONFIG SETTINGS ================= */}
      {activeTab === "config" && (
        <div className="space-y-8">
          {/* Section 1: Company Profile */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
              <Building className="w-4 h-4 text-[#09A64A]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  1. Corporate Information
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Official company details, registration, and URL
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Company Legal Name
                </label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) =>
                    setSettings({ ...settings, companyName: e.target.value })
                  }
                  placeholder="e.g. counselindiaAdmin"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Official Website Link
                </label>
                <input
                  type="text"
                  value={settings.websiteLink}
                  onChange={(e) =>
                    setSettings({ ...settings, websiteLink: e.target.value })
                  }
                  placeholder="counselindia"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  GST Identification Number
                </label>
                <input
                  type="text"
                  value={settings.gstNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, gstNumber: e.target.value })
                  }
                  placeholder="09AAICC6447N1Z0"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Corporate Registered Address
                </label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  placeholder="counselindia"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Communication & Helpdesks */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#09A64A]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  2. Communication & Helpdesks
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Official emails and telephone numbers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Admin Email
                </label>
                <input
                  type="text"
                  value={settings.adminEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, adminEmail: e.target.value })
                  }
                  placeholder="counselindia"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Support Email
                </label>
                <input
                  type="text"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, supportEmail: e.target.value })
                  }
                  placeholder="support@counselindia.co.in"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Helpline Number
                </label>
                <input
                  type="text"
                  value={settings.helplineNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, helplineNumber: e.target.value })
                  }
                  placeholder="8888888888"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={settings.whatsNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, whatsNumber: e.target.value })
                  }
                  placeholder="8888888888"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Emergency Helpline
                </label>
                <input
                  type="text"
                  value={settings.emergencyNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emergencyNumber: e.target.value,
                    })
                  }
                  placeholder="9999999999"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social & Mobile Apps */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-[#09A64A]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  3. Social Channels & Mobile Applications
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Social profiles and mobile store links
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Facebook Link
                </label>
                <input
                  type="text"
                  value={settings.facebookLink}
                  onChange={(e) =>
                    setSettings({ ...settings, facebookLink: e.target.value })
                  }
                  placeholder="https://www.facebook.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  LinkedIn Link
                </label>
                <input
                  type="text"
                  value={settings.linkedinLink}
                  onChange={(e) =>
                    setSettings({ ...settings, linkedinLink: e.target.value })
                  }
                  placeholder="https://www.linkedin.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Twitter / X Link
                </label>
                <input
                  type="text"
                  value={settings.twitterLink}
                  onChange={(e) =>
                    setSettings({ ...settings, twitterLink: e.target.value })
                  }
                  placeholder="https://twitter.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  YouTube Channel
                </label>
                <input
                  type="text"
                  value={settings.youtubeLink}
                  onChange={(e) =>
                    setSettings({ ...settings, youtubeLink: e.target.value })
                  }
                  placeholder="https://www.youtube.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Instagram Link
                </label>
                <input
                  type="text"
                  value={settings.instaLink}
                  onChange={(e) =>
                    setSettings({ ...settings, instaLink: e.target.value })
                  }
                  placeholder="https://www.instagram.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Pinterest Link
                </label>
                <input
                  type="text"
                  value={settings.pinterestLink}
                  onChange={(e) =>
                    setSettings({ ...settings, pinterestLink: e.target.value })
                  }
                  placeholder="https://in.pinterest.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Google Play Store App URL
                </label>
                <input
                  type="text"
                  value={settings.googlePlayAppLink}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      googlePlayAppLink: e.target.value,
                    })
                  }
                  placeholder="https://play.google.com/store/apps/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Apple iOS App Store URL
                </label>
                <input
                  type="text"
                  value={settings.iosAppLink}
                  onChange={(e) =>
                    setSettings({ ...settings, iosAppLink: e.target.value })
                  }
                  placeholder="https://apps.apple.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Single, smooth rounded save button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={savingTab !== null}
              onClick={() => handleSaveTab("config")}
              className="px-8 py-3.5 rounded-2xl bg-[#09A64A] hover:bg-[#078a3d] active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/15 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {savingTab === "config" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Config Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CONTACT US SETTINGS ================= */}
      {activeTab === "contact" && (
        <div className="space-y-8">
          {/* Section 1: Direct Support Channels */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#09A64A]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  1. Direct Contact Channels
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Mobile, admissions email, and hotline numbers
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.contactUsMobile}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contactUsMobile: e.target.value,
                    })
                  }
                  placeholder="+91-9518241200"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Admissions / Contact Email{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={settings.contactUsMail}
                  onChange={(e) =>
                    setSettings({ ...settings, contactUsMail: e.target.value })
                  }
                  placeholder="admissions@counselindiaservices.in"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Emergency Hotline
                </label>
                <input
                  type="text"
                  value={settings.contactUsHotline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contactUsHotline: e.target.value,
                    })
                  }
                  placeholder="+91-8930804054"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Locations & Working Hours */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#09A64A]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  2. Office Locations & Working Hours
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Headquarters, branch locations, and office schedule
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Head Office Address
                </label>
                <textarea
                  rows={2}
                  value={settings.contactUsHeadOffice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contactUsHeadOffice: e.target.value,
                    })
                  }
                  placeholder="12A20, 13th Floor, Sector-96, Noida, Uttar Pradesh, 201301"
                  className="w-full p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Branch Office Addresses
                </label>
                <textarea
                  rows={4}
                  value={settings.contactUsBranchOffice}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contactUsBranchOffice: e.target.value,
                    })
                  }
                  placeholder="Bangalore & Mumbai office details..."
                  className="w-full p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hours of Operation
                </label>
                <textarea
                  rows={3}
                  value={settings.contactUsHoursOperation}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      contactUsHoursOperation: e.target.value,
                    })
                  }
                  placeholder="Monday - Friday: 09:00 - 20:00&#10;Sunday & Saturday: 10:30 - 22:00"
                  className="w-full p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Single, smooth rounded save button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={savingTab !== null}
              onClick={() => handleSaveTab("contact")}
              className="px-8 py-3.5 rounded-2xl bg-[#09A64A] hover:bg-[#078a3d] active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/15 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {savingTab === "contact" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Contact Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CONTENT SETTINGS ================= */}
      {activeTab === "content" && (
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-8">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#09A64A]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Public Pages & Legal Policies (CMS Rich Text)
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Visual formatting editor with HTML mode support for public
                  website pages
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <CmsEditor
                label="About Us Page"
                value={settings.aboutUs}
                onChange={(val) => setSettings({ ...settings, aboutUs: val })}
                placeholder="Write About Us content..."
              />

              <CmsEditor
                label="Our Vision & Mission"
                value={settings.ourVision}
                onChange={(val) => setSettings({ ...settings, ourVision: val })}
                placeholder="Write Our Vision content..."
              />

              <CmsEditor
                label="Privacy Policy"
                value={settings.privacy}
                onChange={(val) => setSettings({ ...settings, privacy: val })}
                placeholder="Write Privacy Policy..."
              />

              <CmsEditor
                label="Terms and Conditions"
                value={settings.termsCondition}
                onChange={(val) =>
                  setSettings({ ...settings, termsCondition: val })
                }
                placeholder="Write Terms and Conditions..."
              />

              <CmsEditor
                label="How Can Sign Up (Guide)"
                value={settings.howCanSignup}
                onChange={(val) =>
                  setSettings({ ...settings, howCanSignup: val })
                }
                placeholder="Write sign up instructions..."
              />

              <CmsEditor
                label="Refund Policy"
                value={settings.refundPolicy}
                onChange={(val) =>
                  setSettings({ ...settings, refundPolicy: val })
                }
                placeholder="Write Refund Policy..."
              />

              <CmsEditor
                label="Academic Policy & Guidelines"
                value={settings.academicPolicy}
                onChange={(val) =>
                  setSettings({ ...settings, academicPolicy: val })
                }
                placeholder="Write Academic Guidelines..."
              />

              <CmsEditor
                label="Contact Us Page Content"
                value={settings.contactUsContent}
                onChange={(val) =>
                  setSettings({ ...settings, contactUsContent: val })
                }
                placeholder="Write Contact Us description..."
              />
            </div>
          </div>

          {/* Single, smooth rounded save button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={savingTab !== null}
              onClick={() => handleSaveTab("content")}
              className="px-8 py-3.5 rounded-2xl bg-[#09A64A] hover:bg-[#078a3d] active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/15 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {savingTab === "content" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Content Settings</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 5: FOOTER SETTINGS ================= */}
      {activeTab === "footer" && (
        <div className="space-y-8">
          {/* Section 1: Footer Brand Statement */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
              <PanelBottom className="w-4 h-4 text-[#09A64A]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  1. Footer Brand Statement & Entity
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Footer tagline, legal corporate registration, and address
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Footer Tagline / Bio Statement
                </label>
                <textarea
                  rows={2}
                  value={settings.footerTitle}
                  onChange={(e) =>
                    setSettings({ ...settings, footerTitle: e.target.value })
                  }
                  placeholder="Counsel India is the only practical e-learning platform for psychology..."
                  className="w-full p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Corporate Legal Entity
                  </label>
                  <input
                    type="text"
                    value={settings.footerCompanyName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footerCompanyName: e.target.value,
                      })
                    }
                    placeholder="COUNSELINDIA SERVICES PRIVATE LIMITED"
                    className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    GST Identification Number
                  </label>
                  <input
                    type="text"
                    value={settings.gstNumber}
                    onChange={(e) =>
                      setSettings({ ...settings, gstNumber: e.target.value })
                    }
                    placeholder="09AAICC6447N1Z0"
                    className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Registered Office Address
                </label>
                <input
                  type="text"
                  value={settings.footerAddress}
                  onChange={(e) =>
                    setSettings({ ...settings, footerAddress: e.target.value })
                  }
                  placeholder="12A20, 13th Floor, E-Square, Sector 96, Noida, Uttar Pradesh 201301"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Footer Support Contacts */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#09A64A]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  2. Footer Helpline & Support
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Direct helpline and WhatsApp for footer display
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.footerSupportEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footerSupportEmail: e.target.value,
                    })
                  }
                  placeholder="wecare@counselindiaservices.in"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Helpline Number
                </label>
                <input
                  type="text"
                  value={settings.footerHelplineNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footerHelplineNumber: e.target.value,
                    })
                  }
                  placeholder="+919518241200"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  WhatsApp Support
                </label>
                <input
                  type="text"
                  value={settings.footerWhatsappNumber}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footerWhatsappNumber: e.target.value,
                    })
                  }
                  placeholder="+918448519298"
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Footer Social Media */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4 flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-[#09A64A]" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  3. Footer Social Channels
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Social channels rendered in the website footer
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Facebook Link
                </label>
                <input
                  type="text"
                  value={settings.footerFbLink}
                  onChange={(e) =>
                    setSettings({ ...settings, footerFbLink: e.target.value })
                  }
                  placeholder="https://www.facebook.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Instagram Link
                </label>
                <input
                  type="text"
                  value={settings.instaLink}
                  onChange={(e) =>
                    setSettings({ ...settings, instaLink: e.target.value })
                  }
                  placeholder="https://www.instagram.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Twitter / X Link
                </label>
                <input
                  type="text"
                  value={settings.footerTwitterLink}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footerTwitterLink: e.target.value,
                    })
                  }
                  placeholder="https://twitter.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  YouTube Link
                </label>
                <input
                  type="text"
                  value={settings.footerYoutubeLink}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footerYoutubeLink: e.target.value,
                    })
                  }
                  placeholder="https://www.youtube.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  LinkedIn Link
                </label>
                <input
                  type="text"
                  value={settings.footerLinkedinLink}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footerLinkedinLink: e.target.value,
                    })
                  }
                  placeholder="https://www.linkedin.com/..."
                  className="w-full h-12 px-4 rounded-2xl border border-gray-200 text-xs sm:text-sm font-medium text-gray-800 bg-[#f8fafc]/80 hover:border-[#09A64A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09A64A]/10 focus:border-[#09A64A] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Single, smooth rounded save button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={savingTab !== null}
              onClick={() => handleSaveTab("footer")}
              className="px-8 py-3.5 rounded-2xl bg-[#09A64A] hover:bg-[#078a3d] active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/15 flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {savingTab === "footer" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Footer Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
