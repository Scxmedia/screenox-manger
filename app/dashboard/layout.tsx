"use client";

import { useState } from "react";
import { LayoutDashboard, ListTodo, Users, Bell, Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: ListTodo, label: "Tasks" },
    { icon: Users, label: "Members" },
    { icon: Bell, label: "Notifications" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* --- MOBILE HEADER (Only visible on Mobile) --- */}
      <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
        <h2 className="text-indigo-600 font-bold text-xl uppercase tracking-tighter">TaskFlow</h2>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* --- SIDEBAR / MOBILE NAV --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} 
        lg:relative lg:translate-x-0 lg:flex lg:w-64
      `}>
        {/* Sidebar Branding (Desktop Only Header inside Sidebar) */}
        <div className="p-6 hidden lg:block">
          <h2 className="text-indigo-600 font-bold text-xl">TaskFlow</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Smart Task Management</p>
        </div>

        {/* Mobile Sidebar Close Button Header */}
        <div className="p-6 flex lg:hidden justify-between items-center border-b border-slate-50 mb-4">
          <span className="text-indigo-600 font-bold">Menu</span>
          <button onClick={() => setIsMenuOpen(false)} className="text-slate-400"><X size={20}/></button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <div
              key={item.label}
              onClick={() => setIsMenuOpen(false)} // Close menu on click
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                item.active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Bottom Profile Section */}
        <div className="p-4 mt-auto border-t border-slate-100">
           <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">A</div>
              <span className="text-sm font-semibold text-slate-700">Admin Profile</span>
           </div>
        </div>
      </aside>

      {/* --- MOBILE OVERLAY --- */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}