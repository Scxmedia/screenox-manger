"use client";

import React, { useState } from 'react';
import { Loader2, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Register
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ first_name: "", email: "", password: "" });
  const router = useRouter();

  // --- Toast Styling ---
  const successStyle = {
    borderRadius: '999px',
    background: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #22c55e',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const errorStyle = {
    borderRadius: '999px',
    background: '#fef2f2', 
    color: '#991b1b',
    border: '1px solid #ef4444',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const baseUrl = "https://store.screenox.in/items/Login";

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const res = await fetch(`${baseUrl}?filter[email][_eq]=${formData.email.toLowerCase()}&filter[password][_eq]=${formData.password}`);
        const json = await res.json();

        if (json.data && json.data.length > 0) {
          Cookies.set("auth_token", "active", { expires: 7 }); // Middleware block hatane ke liye
          localStorage.setItem("user_name", json.data[0].first_name);
          toast.success("Login Successful!", { style: successStyle });
          setTimeout(() => { window.location.href = "/"; }, 1000);
        } else {
          toast.error("Invalid Credentials", { style: errorStyle });
        }
      } else {
        // --- REGISTER LOGIC (Member Add) ---
        const res = await fetch(baseUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "published",
            first_name: formData.first_name,
            email: formData.email.toLowerCase(),
            password: formData.password,
            role: "member"
          }),
        });

        if (res.ok) {
          toast.success("New Member Registered!", { style: successStyle });
          setIsLogin(true); // Register ke baad wapas Login par le jao
        } else {
          toast.error("Registration Failed", { style: errorStyle });
        }
      }
    } catch (error) {
      toast.error("Network Error", { style: errorStyle });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-sm bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 transition-all duration-500">
        <div className="text-center mb-8">
          <img src="https://screenox.in/wp-content/uploads/2024/11/cropped-Screenox-Logo-White-Red-157x36.png" className="h-8 mx-auto mb-6" alt="Logo" />
          
          <div className="inline-flex items-center gap-2 mb-2">
            {isLogin ? <ShieldCheck className="text-slate-900" size={20} /> : <UserPlus className="text-slate-900" size={20} />}
            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
              {isLogin ? "System Access" : "Create Account"}
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
            {isLogin ? "Enter credentials to authorize" : "Deploy new user to the matrix"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="group">
              <input 
                type="text" 
                placeholder="FULL NAME" 
                required 
                className="w-full bg-slate-50 px-6 py-4 rounded-2xl outline-none font-bold text-xs border-2 border-transparent focus:border-black focus:bg-white uppercase transition-all" 
                onChange={e => setFormData({...formData, first_name: e.target.value})} 
              />
            </div>
          )}
          
          <input 
            type="email" 
            placeholder="EMAIL ADDRESS" 
            required 
            className="w-full bg-slate-50 px-6 py-4 rounded-2xl outline-none font-bold text-xs border-2 border-transparent focus:border-black focus:bg-white lowercase transition-all" 
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          
          <input 
            type="password" 
            placeholder="SECURITY PASSWORD" 
            required 
            className="w-full bg-slate-50 px-6 py-4 rounded-2xl outline-none font-bold text-xs border-2 border-transparent focus:border-black focus:bg-white transition-all" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />
          
          <button 
            disabled={isLoading} 
            className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-slate-200 mt-6"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? "Authorize" : "Deploy User")} 
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-50">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="w-full text-[10px] font-black text-slate-400 hover:text-black uppercase tracking-[0.2em] transition-colors"
          >
            {isLogin ? "Need New Access? Request Here" : "Already Authorized? Return to Gate"}
          </button>
        </div>
      </div>
    </div>
  );
}