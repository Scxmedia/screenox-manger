"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [data, setData] = useState({
    total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0, teamCount: 0, recentTasks: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, membersRes] = await Promise.all([
        fetch("https://store.screenox.in/items/Tasks?sort=-date_created&limit=8"),
        fetch("https://store.screenox.in/items/Task_manger_member")
      ]);
      const tasksJson = await tasksRes.json();
      const membersJson = await membersRes.json();
      const allTasks = tasksJson.data || [];
      const stats = {
        total: allTasks.length,
        pending: allTasks.filter((t: any) => t.status === "Pending").length,
        inProgress: allTasks.filter((t: any) => t.status === "in_progress").length,
        completed: allTasks.filter((t: any) => t.status === "completed").length,
        overdue: allTasks.filter((t: any) => t.status !== "completed" && t.deadline && new Date(t.deadline) < new Date()).length,
        teamCount: (membersJson.data || []).length,
        recentTasks: allTasks
      };
      setData(stats);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const statsConfig = [
    { label: "Total Tasks", value: data.total, color: "bg-blue-500", textColor: "text-blue-600" },
    { label: "Pending", value: data.pending, color: "bg-amber-500", textColor: "text-amber-600" },
    { label: "In Progress", value: data.inProgress, color: "bg-indigo-500", textColor: "text-indigo-600" },
    { label: "Completed", value: data.completed, color: "bg-emerald-500", textColor: "text-emerald-600" },
    { label: "Overdue", value: data.overdue, color: "bg-rose-500", textColor: "text-rose-600" },
    { label: "Team", value: data.teamCount, color: "bg-purple-500", textColor: "text-purple-600" },
  ];

  return (
    <div className="mx-auto p-6 md:p-10">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium mt-1 text-sm italic">Manage team performance & goals.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="w-fit bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 shadow-sm active:scale-95 transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="animate-spin text-indigo-600" size={56} />
          <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Updating Stats...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
            {statsConfig.map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                <div className="flex items-end justify-between">
                   <p className={`text-3xl font-black ${stat.textColor}`}>{stat.value}</p>
                   <div className={`w-8 h-8 rounded-xl ${stat.color} opacity-10`} />
                </div>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white">
              <h2 className="font-black text-slate-800 text-lg uppercase tracking-tight">Recent Activity</h2>
              <Link href="/tasks" className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                View All
              </Link>
            </div>
            
            <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-left">Task</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-left">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase text-right">Deadline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.recentTasks.map((task: any) => (
                    <tr key={task.id} className="hover:bg-slate-50/30">
                      <td className="px-8 py-5">
                        <p className="font-bold text-slate-800 text-sm">{task.title}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{task.description || "—"}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                          {String(task.status).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-xs font-bold text-slate-600">
                          {task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB') : "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}