"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Briefcase,
  FileText,
  CreditCard,
  Video,
  Mic,
  MessageSquare,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { CounselorItem } from "@/types/counsellor";

interface AddCounsellorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: CounselorItem | null;
}

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

export default function AddCounsellorModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AddCounsellorModalProps) {
  const isEditing = Boolean(initialData);

  const [activeTab, setActiveTab] = useState<
    "personal" | "professional" | "documents" | "pricing" | "banking" | "bio"
  >("personal");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    address: "",
    city: "",
    country: "INDIA",
    language: "Hindi and English",
    designation: "COUNSELLING PSYCHOLOGIST",
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        mobile: initialData.mobile || "",
        password: "",
        address: initialData.address || "",
        city: initialData.city || "",
        country: initialData.country || "INDIA",
        language: initialData.language || "Hindi and English",
        designation: initialData.designation || "COUNSELLING PSYCHOLOGIST",
        education: initialData.education || "",
        experience: initialData.experience || "",
        specialty: initialData.specialty || "",
        specialty2: initialData.specialty2 || "",
        expertise: initialData.expertise || "",
        rciNumber: initialData.rciNumber || "",

        image: initialData.image || "",
        identityImage: initialData.identityImage || "",
        qualificationProof: initialData.qualificationProof || "",
        cvUrl: initialData.cvUrl || "",

        bankName: initialData.bankName || "",
        accountNumber: initialData.accountNumber || "",
        ifscCode: initialData.ifscCode || "",
        accountType: initialData.accountType || "Savings",
        accountHolderName: initialData.accountHolderName || "",

        userType: initialData.userType || "Counselor",
        isApproved: initialData.isApproved !== false,
        isOnline: Boolean(initialData.isOnline),
        videoStatus: Boolean(initialData.videoStatus),
        videoPrice: initialData.videoPrice || 0,
        audioStatus: Boolean(initialData.audioStatus),
        audioPrice: initialData.audioPrice || 0,
        chatStatus: Boolean(initialData.chatStatus),
        chatPrice: initialData.chatPrice || 0,
        expectedCharges: initialData.expectedCharges || 0,
        councellFees: initialData.councellFees || 0,
        commission: initialData.commission || 0,
        position: initialData.position || 0,

        about: initialData.about || "",
        achievements: initialData.achievements || "",
        whatBringsYou: initialData.whatBringsYou || "",

        status: initialData.status || "Active",
        forCourse: initialData.forCourse || "No",
        personalCounselling: initialData.personalCounselling || "No",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        mobile: "",
        password: "",
        address: "",
        city: "",
        country: "INDIA",
        language: "Hindi and English",
        designation: "COUNSELLING PSYCHOLOGIST",
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
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    field: string,
    value: string | number | boolean | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (
    field: "image" | "identityImage" | "qualificationProof" | "cvUrl",
    file: File,
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData((prev) => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.mobile.trim()
    ) {
      setError("Name, Email, and Mobile are required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url =
        isEditing && initialData?.id
          ? `/api/counsellors/${initialData.id}`
          : "/api/counsellors";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to save counsellor");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-[#0c1424] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-black text-white tracking-tight">
            {isEditing
              ? `Edit Counsellor: ${initialData?.name}`
              : "Add New Counsellor"}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Fill in the counsellor profile details, documents, and platform
            configurations.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-white/10 overflow-x-auto pb-0">
            {[
              { id: "personal", label: "Personal Info" },
              { id: "professional", label: "Professional" },
              { id: "documents", label: "Documents & Files" },
              { id: "pricing", label: "Pricing & Sessions" },
              { id: "banking", label: "Banking" },
              { id: "bio", label: "Bio & Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#09A64A] text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-gray-50/50">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: Personal Info */}
            {activeTab === "personal" && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Personal &amp; Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="e.g. Suhani Saleem"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="e.g. counselor@counselindia.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Mobile <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Password{" "}
                      {isEditing && (
                        <span className="text-gray-400 font-normal">
                          (leave blank to keep current)
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="e.g. Sector N Aliganj, Lucknow"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="e.g. Lucknow"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Country <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      placeholder="INDIA"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Language
                    </label>
                    <input
                      type="text"
                      value={formData.language}
                      onChange={(e) => handleChange("language", e.target.value)}
                      placeholder="e.g. Hindi and English"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Professional Profile */}
            {activeTab === "professional" && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Professional &amp; Academic Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) =>
                        handleChange("designation", e.target.value)
                      }
                      placeholder="e.g. COUNSELLING PSYCHOLOGIST"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Education <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.education}
                      onChange={(e) =>
                        handleChange("education", e.target.value)
                      }
                      placeholder="e.g. Post Graduate / M.Sc Psychology"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Experience (Years){" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.experience}
                      onChange={(e) =>
                        handleChange("experience", e.target.value)
                      }
                      placeholder="e.g. 2"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Specialty <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.specialty}
                      onChange={(e) =>
                        handleChange("specialty", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A] bg-white cursor-pointer"
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
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Not in list specialty
                    </label>
                    <input
                      type="text"
                      value={formData.specialty2}
                      onChange={(e) =>
                        handleChange("specialty2", e.target.value)
                      }
                      placeholder="Custom specialty..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      RCI Number
                    </label>
                    <input
                      type="text"
                      value={formData.rciNumber}
                      onChange={(e) =>
                        handleChange("rciNumber", e.target.value)
                      }
                      placeholder="e.g. A12345"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Expertise
                    </label>
                    <input
                      type="text"
                      value={formData.expertise}
                      onChange={(e) =>
                        handleChange("expertise", e.target.value)
                      }
                      placeholder="e.g. Cognitive behavioral therapy, Anxiety, Child Counseling"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] focus:ring-1 focus:ring-[#09A64A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Documents & Uploads */}
            {activeTab === "documents" && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Document Uploads &amp; Media Attachments
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Profile Image */}
                  <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-gray-800 block mb-2">
                        Profile Image
                      </span>
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-xl border border-gray-300 mb-3"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 mb-3 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <label className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#09A64A] cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload("image", file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Identity Image */}
                  <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-gray-800 block mb-2">
                        Identity Image (Aadhaar / ID)
                      </span>
                      {formData.identityImage ? (
                        <img
                          src={formData.identityImage}
                          alt="ID Preview"
                          className="w-24 h-24 object-cover rounded-xl border border-gray-300 mb-3"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 mb-3 text-xs">
                          No ID Proof
                        </div>
                      )}
                    </div>
                    <label className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#09A64A] cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      Choose ID Proof
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload("identityImage", file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Proof of Qualification */}
                  <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-gray-800 block mb-2">
                        Proof of Qualification
                      </span>
                      {formData.qualificationProof ? (
                        <img
                          src={formData.qualificationProof}
                          alt="Qual Preview"
                          className="w-24 h-24 object-cover rounded-xl border border-gray-300 mb-3"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 mb-3 text-xs">
                          No Degree Proof
                        </div>
                      )}
                    </div>
                    <label className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#09A64A] cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      Choose Qualification Proof
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            handleFileUpload("qualificationProof", file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Proof of CV */}
                  <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-gray-800 block mb-2">
                        Proof of CV / Resume
                      </span>
                      {formData.cvUrl ? (
                        <div className="p-3 bg-white rounded-xl border border-gray-200 mb-3 truncate">
                          <span className="font-bold text-gray-900 block truncate">
                            {formData.cvUrl.substring(0, 30)}...
                          </span>
                        </div>
                      ) : (
                        <div className="py-6 px-3 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 mb-3 text-xs">
                          No CV uploaded
                        </div>
                      )}
                    </div>
                    <label className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:text-[#09A64A] cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      Choose CV Document
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload("cvUrl", file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Pricing & Sessions */}
            {activeTab === "pricing" && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Session Fees, Charges &amp; Commission
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Video */}
                  <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-200">
                    <label className="flex items-center justify-between font-bold text-gray-700">
                      <span>Video Session Enabled</span>
                      <input
                        type="checkbox"
                        checked={formData.videoStatus}
                        onChange={(e) =>
                          handleChange("videoStatus", e.target.checked)
                        }
                        className="w-4 h-4 accent-[#09A64A]"
                      />
                    </label>
                    <div>
                      <label className="text-gray-500 block mb-1">
                        Video Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.videoPrice}
                        onChange={(e) =>
                          handleChange("videoPrice", Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Audio */}
                  <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-200">
                    <label className="flex items-center justify-between font-bold text-gray-700">
                      <span>Audio Session Enabled</span>
                      <input
                        type="checkbox"
                        checked={formData.audioStatus}
                        onChange={(e) =>
                          handleChange("audioStatus", e.target.checked)
                        }
                        className="w-4 h-4 accent-[#09A64A]"
                      />
                    </label>
                    <div>
                      <label className="text-gray-500 block mb-1">
                        Audio Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.audioPrice}
                        onChange={(e) =>
                          handleChange("audioPrice", Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  </div>

                  {/* Chat */}
                  <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-200">
                    <label className="flex items-center justify-between font-bold text-gray-700">
                      <span>Chat Session Enabled</span>
                      <input
                        type="checkbox"
                        checked={formData.chatStatus}
                        onChange={(e) =>
                          handleChange("chatStatus", e.target.checked)
                        }
                        className="w-4 h-4 accent-[#09A64A]"
                      />
                    </label>
                    <div>
                      <label className="text-gray-500 block mb-1">
                        Chat Price (₹)
                      </label>
                      <input
                        type="number"
                        value={formData.chatPrice}
                        onChange={(e) =>
                          handleChange("chatPrice", Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl space-y-2 border border-gray-200">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Excepted Charges Fees (₹) *
                      </label>
                      <input
                        type="number"
                        value={formData.expectedCharges}
                        onChange={(e) =>
                          handleChange(
                            "expectedCharges",
                            Number(e.target.value),
                          )
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Councell Fees (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.councellFees}
                      onChange={(e) =>
                        handleChange("councellFees", Number(e.target.value))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Add Commission (Online Session) %
                    </label>
                    <input
                      type="number"
                      value={formData.commission}
                      onChange={(e) =>
                        handleChange("commission", Number(e.target.value))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Banking Details */}
            {activeTab === "banking" && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Counsellor Bank Account Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => handleChange("bankName", e.target.value)}
                      placeholder="e.g. State Bank of India"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) =>
                        handleChange("accountNumber", e.target.value)
                      }
                      placeholder="e.g. 39861095564"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => handleChange("ifscCode", e.target.value)}
                      placeholder="e.g. SBIN0001234"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Account Type
                    </label>
                    <select
                      value={formData.accountType}
                      onChange={(e) =>
                        handleChange("accountType", e.target.value)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A] bg-white cursor-pointer"
                    >
                      <option value="Savings">Savings</option>
                      <option value="Current">Current</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) =>
                        handleChange("accountHolderName", e.target.value)
                      }
                      placeholder="e.g. Suhani Saleem"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: Bio & Settings */}
            {activeTab === "bio" && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Bios &amp; Administrative Controls
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      About
                    </label>
                    <textarea
                      rows={3}
                      value={formData.about}
                      onChange={(e) => handleChange("about", e.target.value)}
                      placeholder="Bio and professional introduction..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      Achievements
                    </label>
                    <textarea
                      rows={3}
                      value={formData.achievements}
                      onChange={(e) =>
                        handleChange("achievements", e.target.value)
                      }
                      placeholder="Key achievements and milestones..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 block mb-1.5">
                      What Brings You
                    </label>
                    <textarea
                      rows={3}
                      value={formData.whatBringsYou}
                      onChange={(e) =>
                        handleChange("whatBringsYou", e.target.value)
                      }
                      placeholder="Mission and motivation..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#09A64A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1.5">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1.5">
                        Admin Approval
                      </label>
                      <select
                        value={formData.isApproved ? "1" : "0"}
                        onChange={(e) =>
                          handleChange("isApproved", e.target.value === "1")
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="1">Yes (Approved)</option>
                        <option value="0">No (Pending)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-gray-700 block mb-1.5">
                        User Type
                      </label>
                      <select
                        value={formData.userType}
                        onChange={(e) =>
                          handleChange("userType", e.target.value)
                        }
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white"
                      >
                        <option value="Counselor">Counselor</option>
                        <option value="Trainer">Trainer</option>
                        <option value="Both Trainer and Counselor">
                          Both Trainer and Counselor
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-[#09A64A] hover:bg-[#07883b] text-white font-bold text-xs shadow-md shadow-[#09A64A]/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Counsellor"
                  : "Save Counsellor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
