"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserPlus, Mail, Phone, Calendar, X, Loader2 } from "lucide-react";

interface Member {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  roles: string;
  date_created: string;
}

export default function MembersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = "https://store.screenox.in/items/Task_manger_member";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    roles: "1",
  });

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_URL);
      const json = await res.json();
      setTeamMembers(json.data || []);
    } catch {
      toast.error("Network error: Could not load members");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Fixed: Added React.FormEvent type to 'e'
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. FRONTEND VALIDATION
    if (!formData.name.trim()) {
      return toast.error("Full Name is required", {
        style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #ef4444", borderRadius: "16px", fontWeight: "600" }
      });
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      return toast.error("Valid Phone Number is required", {
        style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #ef4444", borderRadius: "16px", fontWeight: "600" }
      });
    }

    // 2. START API CALL
    setIsSubmitting(true);
    const toastId = toast.loading("Saving new member...");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("API Error");

      toast.success("Member added successfully!", {
        id: toastId,
        style: {
          background: "#ecfdf5",
          color: "#065f46",
          border: "1px solid #10b981",
          borderRadius: "16px",
          fontWeight: "600",
        },
      });

      setIsModalOpen(false);
      setFormData({ name: "", phone: "", email: "", roles: "1" });
      fetchMembers();
    } catch {
      toast.error("Failed to add member. Please try again.", {
        id: toastId,
        style: {
          background: "#fef2f2",
          color: "#991b1b",
          border: "1px solid #ef4444",
          borderRadius: "16px",
          fontWeight: "600",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to handle input changes without repetition
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="p-4 md:p-8">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Team Members
            </h1>
            <p className="text-slate-500 mt-1 hidden sm:block">
              Manage your team members and their WhatsApp contacts
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold shadow-md flex items-center gap-2 active:scale-95 transition-all"
          >
            <UserPlus size={18} /> <span className="hidden sm:inline">Add Member</span><span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* MEMBERS GRID */}
        {isLoading ? (
          <div className="flex flex-col items-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            Loading team members...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center font-bold text-indigo-600 text-xl shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg truncate">{member.name}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${member.roles === "2" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                      {member.roles === "2" ? "Lead" : "Member"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" /> {member.phone}
                  </div>
                  {member.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={14} className="text-slate-400" /> {member.email}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-50">
                    <Calendar size={12} />
                    Joined {new Date(member.date_created).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADD MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            >
              <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Add Team Member</h2>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    name="name"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp Number</label>
                  <input
                    name="phone"
                    placeholder="e.g. 919876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email (Optional)</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="email@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assign Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, roles: "1" })}
                      className={`py-3 rounded-xl font-bold border transition-all ${
                        formData.roles === "1"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, roles: "2" })}
                      className={`py-3 rounded-xl font-bold border transition-all ${
                        formData.roles === "2"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      Lead
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold active:scale-95 disabled:opacity-70 disabled:active:scale-100 transition-all shadow-lg shadow-indigo-100"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "Confirm Add"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-slate-200 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}