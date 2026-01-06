"use client";

import { useState, useEffect } from "react";
import { 
  X, Plus, Loader2, AlertCircle, CheckCircle2, 
  Clock, PlayCircle, CheckCircle, LayoutGrid, List, GripVertical 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// --- INTERFACES ---
interface Member { 
  id: number; 
  name: string; 
  phone: string; 
}

interface Task { 
  id: number; 
  title: string; 
  description: string; 
  priority: string; 
  deadline: string; 
  status: string; 
  assigned_to: { name?: string; phone?: string } | null; 
  alert_sent: number; 
}

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: number, newStatus: string) => Promise<void>;
  isKanban?: boolean;
  onDragStart?: (e: React.DragEvent, id: number) => void;
}

interface EmptyStateProps {
  filter: string;
}

export default function TasksPage() {
  const [view, setView] = useState<"list" | "kanban">("list"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const [datePart, setDatePart] = useState("");
  const [timePart, setTimePart] = useState("");

  const [formData, setFormData] = useState({
    title: "", description: "", priority: "medium", status: "Pending", assigned_to: "" 
  });

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tasksRes, membersRes] = await Promise.all([
        fetch("https://store.screenox.in/items/Tasks?sort=-date_created&fields=*,assigned_to.name,assigned_to.phone"),
        fetch("https://store.screenox.in/items/Task_manger_member")
      ]);
      const tasksJson = await tasksRes.json();
      const membersJson = await membersRes.json();
      setTasks(tasksJson.data || []);
      setMembers(membersJson.data || []);
    } catch (error) { 
      toast.error("Error loading data"); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- UPDATE STATUS LOGIC ---
  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    try {
      const res = await fetch(`https://store.screenox.in/items/Tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Task moved to ${newStatus.replace('_', ' ')}`);
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (error) { 
      toast.error("Failed to update status"); 
    }
  };

  // --- DRAG & DROP ---
  const onDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("taskId", id.toString());
  };

  const onDrop = (e: React.DragEvent, status: string) => {
    const id = parseInt(e.dataTransfer.getData("taskId"));
    handleUpdateStatus(id, status);
  };

  // --- SUBMIT & WHATSAPP LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.assigned_to || !datePart) {
      return toast.error("Please fill title, member and date");
    }
    
    setIsSubmitting(true);
    const loadId = toast.loading("Saving task & sending WhatsApp...");
    
    const combinedDeadline = `${datePart}T${timePart || "00:00"}:00`;

    try {
      // 1. Save to Database
      const res = await fetch("https://store.screenox.in/items/Tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, deadline: combinedDeadline, alert_sent: 0 }),
      });

      if (res.ok) {
        // 2. Send WhatsApp via UltraMsg
        const selectedMember = members.find(m => m.id.toString() === formData.assigned_to);
        if (selectedMember) {
          const message = `*NEW TASK ASSIGNED* 🚀\n\n*Task:* ${formData.title}\n*Desc:* ${formData.description || "N/A"}\n*Deadline:* ${datePart} ${timePart || "00:00"}`;
          
          await fetch(`https://api.ultramsg.com/instance157994/messages/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ 
              token: "souqwsdgkpimevlm", 
              to: selectedMember.phone, 
              body: message 
            }),
          });
        }

        toast.success("Task Created Successfully!", { id: loadId });
        setIsModalOpen(false);
        setFormData({ title: "", description: "", priority: "medium", status: "Pending", assigned_to: "" });
        setDatePart(""); setTimePart("");
        fetchData(); 
      }
    } catch (error) { 
      toast.error("Error creating task", { id: loadId }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "All") return true;
    const statusMap: Record<string, string> = { "Pending": "Pending", "In Progress": "in_progress", "Completed": "completed" };
    return task.status === statusMap[activeFilter];
  });

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase">Team Board</h1>
          <p className="hidden md:block text-slate-500 font-medium">Manage assignments and track real-time progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-50"}`}><List size={18}/></button>
            <button onClick={() => setView("kanban")} className={`p-2 rounded-lg transition-all ${view === "kanban" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:bg-slate-50"}`}><LayoutGrid size={18}/></button>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 text-sm md:text-base">
            <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline tracking-widest uppercase text-xs">Create Task</span><span className="sm:hidden font-black">NEW</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Data...</p>
        </div>
      ) : (
        <>
          {view === "list" ? (
            <div className="animate-in fade-in duration-500">
              <div className="overflow-x-auto no-scrollbar mb-8">
                <div className="flex gap-1 md:gap-2 bg-white p-1 rounded-xl md:rounded-2xl border border-slate-200 w-max md:w-fit shadow-sm">
                  {["All", "Pending", "In Progress", "Completed"].map((filter) => (
                    <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${activeFilter === filter ? "bg-indigo-600 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>{filter}</button>
                  ))}
                </div>
              </div>

              {filteredTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredTasks.map((task) => (
                    <TaskCard key={task.id} task={task} onUpdate={handleUpdateStatus} />
                  ))}
                </div>
              ) : <EmptyState filter={activeFilter}/>}
            </div>
          ) : (
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 snap-x animate-in slide-in-from-right-10 duration-500">
              {[
                { label: "Pending", value: "Pending", color: "bg-amber-500" },
                { label: "In Progress", value: "in_progress", color: "bg-blue-500" },
                { label: "Completed", value: "completed", color: "bg-emerald-500" }
              ].map((col) => (
                <div key={col.value} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, col.value)} className="min-w-[300px] md:min-w-[350px] flex-1 snap-center">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.color}`} /> {col.label}
                    </h3>
                    <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {tasks.filter(t => t.status === col.value).length}
                    </span>
                  </div>
                  <div className="bg-slate-100/50 p-3 rounded-[2rem] border border-slate-200/50 min-h-[600px] space-y-4 shadow-inner">
                    {tasks.filter(t => t.status === col.value).map(task => (
                      <TaskCard key={task.id} task={task} onUpdate={handleUpdateStatus} isKanban onDragStart={onDragStart} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-xl rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">New Assignment</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none font-medium" placeholder="Task Name" required />
              </div>
              
              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Description</label>
                <textarea rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-slate-50 outline-none resize-none font-medium" placeholder="Details..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Assign To</label>
                    <select value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-white font-medium" required>
                      <option value="">Select Member</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Priority</label>
                    <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-white font-medium">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Date</label>
                  <input type="date" value={datePart} onChange={(e) => setDatePart(e.target.value)} className="w-full px-4 py-3 rounded-xl border font-medium" required />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Time</label>
                  <input type="time" value={timePart} onChange={(e) => setTimePart(e.target.value)} className="w-full px-4 py-3 rounded-xl border font-medium" />
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 flex-shrink-0">
              <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex justify-center items-center">
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : "Confirm & Send WhatsApp"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, onUpdate, isKanban, onDragStart }: TaskCardProps) {
  return (
    <div 
      draggable={isKanban}
      onDragStart={(e) => isKanban && onDragStart && onDragStart(e, task.id)}
      className={`bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between ${isKanban ? 'cursor-grab active:cursor-grabbing border-b-4 border-b-indigo-500/20' : ''}`}
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border ${
            task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
            task.status === 'in_progress' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
          }`}>
            {task.status?.replace('_', ' ')}
          </span>
          {isKanban ? <GripVertical size={16} className="text-slate-300"/> : 
          <span className={`text-[10px] font-bold uppercase tracking-widest ${task.priority === 'high' ? 'text-red-500' : 'text-slate-400'}`}>
            {task.priority}
          </span>}
        </div>
        <h3 className="font-extrabold text-slate-900 text-sm md:text-base mb-1 truncate uppercase tracking-tight">{task.title}</h3>
        <p className="text-[10px] md:text-xs text-slate-500 mb-6 line-clamp-2 leading-relaxed font-medium">{task.description || "No description."}</p>
      </div>
      
      <div className="space-y-4 pt-4 border-t border-slate-50">
        <div className="flex items-center justify-between text-slate-400 font-black text-[9px] uppercase tracking-tighter">
          <div className="flex items-center gap-1.5"><Clock size={12} /> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Date'}</div>
          <div className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{task.assigned_to?.name || 'User'}</div>
        </div>

        <div className="flex gap-2">
          {task.status === 'Pending' && (
            <button onClick={() => onUpdate(task.id, 'in_progress')} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 uppercase hover:bg-blue-600 hover:text-white transition-all">
              <PlayCircle size={14} /> Start
            </button>
          )}
          {task.status === 'in_progress' && (
            <button onClick={() => onUpdate(task.id, 'completed')} className="flex-1 bg-emerald-50 text-emerald-600 py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 uppercase hover:bg-emerald-600 hover:text-white transition-all">
              <CheckCircle size={14} /> Done
            </button>
          )}
          {task.status === 'completed' && (
            <div className="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 uppercase">
              <CheckCircle2 size={14} /> Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ filter }: EmptyStateProps) {
  return (
    <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-24 flex flex-col items-center justify-center text-center">
      <AlertCircle size={48} className="text-slate-200 mb-4" />
      <h3 className="text-xl font-bold text-slate-900 mb-1 uppercase tracking-tight">No tasks in "{filter}"</h3>
      <p className="text-slate-400 text-sm uppercase font-bold tracking-widest">Chill for a bit!</p>
    </div>
  );
}