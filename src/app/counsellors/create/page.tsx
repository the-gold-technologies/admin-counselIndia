"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  User,
  ShieldCheck,
  GraduationCap,
  FileText,
  CreditCard,
  Video,
} from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { CertificateUploadField } from "@/components/ui/CertificateUploadField";

const SPECIALTY_OPTIONS = [
  "Career Counsellor and Counsellor",
  "Career Counsellor and Life Skills Trainer",
  "Child Psychologist",
  "Clinical Psychologist",
  "Clinical Psychologist and Hypnotherapist",
  "Cognition Based Therapies",
  "Cognitive psychology",
  "Consultant Psychologist",
  "Counselling Psychologist",
  "Educational Psychologist",
  "Gestalt Therapist",
  "Guidance and Counselling",
  "Marriage and Family Therapist",
  "Mental Health Counsellor",
  "Neuropsychologist",
  "Psychotherapist",
  "Rehabilitation Psychologist",
  "Relationship & Marital Counsellor",
  "School Psychologist",
  "Trauma & Grief Specialist",
];

export default function CreateCounsellorPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    address: "",
    city: "",
    country: "INDIA",
    designation: "COUNSELLING PSYCHOLOGIST",
    language: "Hindi and English",
    education: "Post Graduate",
    experience: "1",
    specialty: "Counselling Psychologist",
    specialty2: "",
    expertise: "",
    rciNumber: "",

    image: "",
    identityImage: "",
    qualificationProof: "",
    cvUrl: "",

    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountType: "Savings",
    accountHolderName: "",

    userType: "Counselor",
    isApproved: true,
    isOnline: false,
    videoStatus: false,
    videoPrice: 0,
    audioStatus: false,
    audioPrice: 0,
    chatStatus: false,
    chatPrice: 0,
    expectedCharges: 1899,
    councellFees: 1699,
    commission: 0,
    position: 0,

    about: "",
    achievements: "",
    whatBringsYou: "",

    status: "Active",
    forCourse: "No",
    personalCounselling: "No",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim()) {
      setError("Name, Email, and Mobile are required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/counsellors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to create counsellor");
      }

      router.push("/counsellors?status=verified");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* Top Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <Link
            href="/counsellors"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#09A64A] hover:text-[#089341] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>BACK TO COUNSELLORS LIST</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-2">
            Add New Counsellor
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create practitioner profile with academic credentials, session prices, and verification uploads
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Personal & Contact */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              1. Personal &amp; Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="counselor@counselindia.com"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank for auto-generate"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Residential or clinic address"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Country <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="INDIA"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Language(s)
                </label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="Hindi and English"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Professional & Academic */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              2. Professional Profile &amp; Specialty
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="COUNSELLING PSYCHOLOGIST"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Education <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.education}
                  onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                  placeholder="e.g. Post Graduate, M.Sc Psychology"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Experience (Years) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="e.g. 2"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Specialty <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium cursor-pointer"
                >
                  <option value="">Select Specialty</option>
                  {SPECIALTY_OPTIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Not in list specialty
                </label>
                <input
                  type="text"
                  value={formData.specialty2}
                  onChange={(e) => setFormData({ ...formData, specialty2: e.target.value })}
                  placeholder="Other specialty"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  RCI Number
                </label>
                <input
                  type="text"
                  value={formData.rciNumber}
                  onChange={(e) => setFormData({ ...formData, rciNumber: e.target.value })}
                  placeholder="RCI Registration Number"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Expertise
                </label>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="Cognitive behavioral therapy, depression, stress management"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Document Uploads */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              3. Verification Dossiers &amp; Uploads
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField
                label="Profile Image"
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              />
              <ImageUploadField
                label="Identity Image (Aadhaar / Passport)"
                value={formData.identityImage}
                onChange={(url) => setFormData((prev) => ({ ...prev, identityImage: url }))}
              />
              <CertificateUploadField
                label="Proof of Qualification (Degree / Certificate)"
                value={formData.qualificationProof}
                onChange={(url) => setFormData((prev) => ({ ...prev, qualificationProof: url }))}
              />
              <CertificateUploadField
                label="Proof of CV / Resume"
                value={formData.cvUrl}
                onChange={(url) => setFormData((prev) => ({ ...prev, cvUrl: url }))}
              />
            </div>
          </div>

          {/* Section 4: Banking Details */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              4. Banking &amp; Payout Account
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="State Bank of India"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="39861095564"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  placeholder="SBIN0001234"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Account Type
                </label>
                <select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium cursor-pointer"
                >
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                  placeholder="Name as per Bank Record"
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl focus:outline-hidden focus:border-[#09A64A] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Pricing & Sessions */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              5. Session Formats, Pricing &amp; Commission
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="flex items-center justify-between font-bold text-gray-800">
                  <span>Video Session</span>
                  <input
                    type="checkbox"
                    checked={formData.videoStatus}
                    onChange={(e) => setFormData({ ...formData, videoStatus: e.target.checked })}
                    className="w-4 h-4 accent-[#09A64A]"
                  />
                </label>
                <label className="text-gray-500 block">Price (₹)</label>
                <input
                  type="number"
                  value={formData.videoPrice}
                  onChange={(e) => setFormData({ ...formData, videoPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="flex items-center justify-between font-bold text-gray-800">
                  <span>Audio Session</span>
                  <input
                    type="checkbox"
                    checked={formData.audioStatus}
                    onChange={(e) => setFormData({ ...formData, audioStatus: e.target.checked })}
                    className="w-4 h-4 accent-[#09A64A]"
                  />
                </label>
                <label className="text-gray-500 block">Price (₹)</label>
                <input
                  type="number"
                  value={formData.audioPrice}
                  onChange={(e) => setFormData({ ...formData, audioPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <label className="flex items-center justify-between font-bold text-gray-800">
                  <span>Chat Session</span>
                  <input
                    type="checkbox"
                    checked={formData.chatStatus}
                    onChange={(e) => setFormData({ ...formData, chatStatus: e.target.checked })}
                    className="w-4 h-4 accent-[#09A64A]"
                  />
                </label>
                <label className="text-gray-500 block">Price (₹)</label>
                <input
                  type="number"
                  value={formData.chatPrice}
                  onChange={(e) => setFormData({ ...formData, chatPrice: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Excepted Charges Fees (₹) *
                </label>
                <input
                  type="number"
                  value={formData.expectedCharges}
                  onChange={(e) => setFormData({ ...formData, expectedCharges: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Councell Fees (₹) *
                </label>
                <input
                  type="number"
                  value={formData.councellFees}
                  onChange={(e) => setFormData({ ...formData, councellFees: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Commission %
                </label>
                <input
                  type="number"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Bio & Settings */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-100">
              6. Bios &amp; Administration
            </h2>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  About
                </label>
                <textarea
                  rows={3}
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  placeholder="Professional summary..."
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Achievements
                </label>
                <textarea
                  rows={3}
                  value={formData.achievements}
                  onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                  placeholder="Degrees, certifications, notable client milestones..."
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  What Brings You
                </label>
                <textarea
                  rows={3}
                  value={formData.whatBringsYou}
                  onChange={(e) => setFormData({ ...formData, whatBringsYou: e.target.value })}
                  placeholder="Statement of purpose..."
                  className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl font-medium cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Approval
                  </label>
                  <select
                    value={formData.isApproved ? "1" : "0"}
                    onChange={(e) => setFormData({ ...formData, isApproved: e.target.value === "1" })}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl font-medium cursor-pointer"
                  >
                    <option value="1">Approved</option>
                    <option value="0">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    User Type
                  </label>
                  <select
                    value={formData.userType}
                    onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                    className="w-full px-4 py-3 bg-[#f8fafc] border border-gray-200 rounded-xl font-medium cursor-pointer"
                  >
                    <option value="Counselor">Counselor</option>
                    <option value="Trainer">Trainer</option>
                    <option value="Both Trainer and Counselor">Both Trainer and Counselor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-100 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-[#09A64A] hover:bg-[#089341] text-white font-bold text-sm shadow-md shadow-[#09A64A]/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Create Counsellor</span>
            </button>

            <Link
              href="/counsellors"
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-sm transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
