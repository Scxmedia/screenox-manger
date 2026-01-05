"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, ListTodo, Users, Menu, X, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { Toaster } from "react-hot-toast";
import Cookies from "js-cookie"; // Cookie handle karne ke liye
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- UPDATED LOGOUT: Middleware ko trigger karne ke liye ---
  const handleLogout = () => {
    // 1. Cookie delete karna sabse zaroori hai (Middleware isi ko dekhta hai)
    Cookies.remove("auth_token");
    
    // 2. Local storage clear karein
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_name");
    
    // 3. Hard Redirect taaki middleware turant action le
    window.location.href = "/login";
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: ListTodo, label: "Tasks", href: "/tasks" },
    { icon: Users, label: "Members", href: "/members" },
  ];

  if (!mounted) {
    return (
      <html lang="en">
        <body className="antialiased bg-[#f8fafc]"></body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <Toaster position="top-center" reverseOrder={false} />

        {isLoginPage ? (
          <div className="min-h-screen bg-[#f8fafc]">
            {children}
          </div>
        ) : (
          <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row">
            
            {/* MOBILE HEADER */}
            <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50">
              <img 
                src="https://screenox.in/wp-content/uploads/2024/11/cropped-Screenox-Logo-White-Red-157x36.png" 
                className="h-6" alt="Logo"
              />
              <button onClick={() => setIsMenuOpen(true)} className="p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                <Menu size={24} />
              </button>
            </header>

            {/* SIDEBAR */}
            <aside className={`
              fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300
              ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
              lg:relative lg:translate-x-0 lg:flex lg:w-64
            `}>
              <div className="p-8 flex justify-between items-center">
                <img 
                  src="https://screenox.in/wp-content/uploads/2024/11/cropped-Screenox-Logo-White-Red-157x36.png" 
                  className="h-7" alt="Logo"
                />
                <button onClick={() => setIsMenuOpen(false)} className="lg:hidden p-2 text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.label} href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                        isActive 
                          ? "bg-red-600 text-white shadow-lg shadow-red-100" 
                          : "text-slate-400 hover:bg-slate-50 hover:text-red-600"
                      }`}
                    >
                      <item.icon size={20} />
                      <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 mt-auto border-t border-slate-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 bg-red-200 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest group shadow-sm active:scale-95"
                >
                  <LogOut size={16} className="group-hover:rotate-180 transition-transform duration-300" /> Logout System
                </button>
              </div>
            </aside>

            {/* OVERLAY FOR MOBILE */}
            {isMenuOpen && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsMenuOpen(false)} />
            )}

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 w-full overflow-y-auto">
              <div className="max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        )}
      </body>
    </html>
  );
}