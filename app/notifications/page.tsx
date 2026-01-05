"use client";

import { useEffect, useState } from "react";
import { BellOff, ChevronDown, Clock, MessageSquare, Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Step 1: Data Fetching Logic ---
  const fetchNotifications = async () => {
    try {
      // Wahi tasks fetch honge jinka alert_sent Flow dwara 1 kar diya gaya hai
      const response = await fetch(
        "https://store.screenox.in/items/Tasks?filter[alert_sent][_eq]=1&sort=-deadline&fields=*,assigned_to.phone"
      );
      const json = await response.json();
      setAlerts(json.data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Har 60 seconds mein check karega ki naya alert gaya ya nahi
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* --- Header Section --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">WhatsApp Notifications</h1>
        <p className="text-slate-500 mt-1">Track all WhatsApp notifications sent to team members</p>
      </div>

      {/* --- Filter Section --- */}
      <div className="flex items-center gap-4 mb-8">
        <label className="text-sm font-bold text-slate-700">Filter by Status:</label>
        <div className="relative">
          <select className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 min-w-[160px]">
            <option>Sent (1 Hour Alert)</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* --- Notification List / Empty State --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500 mb-2" />
          <p className="text-slate-500 text-sm">Checking logs...</p>
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((task) => (
            <div key={task.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{task.title}</h3>
                  <p className="text-slate-500 text-sm">
                    WhatsApp sent to: <span className="font-semibold text-slate-700">{task.assigned_to?.phone || "N/A"}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-indigo-50 text-indigo-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-indigo-100">
                  Delivered
                </span>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  <Clock size={12} /> Deadline: {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm py-32 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <BellOff size={32} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No notifications yet</h3>
          <p className="text-slate-500 max-w-sm">
            Notifications will appear here when tasks reach their 1-hour deadline threshold
          </p>
        </div>
      )}
    </div>
  );
}