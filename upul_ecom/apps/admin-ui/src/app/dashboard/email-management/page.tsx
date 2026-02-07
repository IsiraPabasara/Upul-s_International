"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axiosInstance from "@/app/utils/axiosInstance";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  RefreshCw,
  Activity,
  Trash2,
  Eye,
  Copy,
  Search,
  Play,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  PieChart,
  Code,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// --- TYPES ---
interface EmailLog {
  id: string;
  recipientEmail: string;
  subject: string;
  emailType: string;
  orderNumber: string | null;
  status: "processing" | "sent" | "failed" | "permanently_failed";
  attemptNumber: number;
  errorMessage: string | null;
  failureReason: string | null;
  html?: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EmailStats {
  totalSent: number;
  totalFailed: number;
  sentToday: number;
  sentThisMonth: number;
  byType: Array<{
    emailType: string;
    _count: { id: number };
  }>;
}

interface QueueStats {
  active: number;
  waiting: number;
  completed: number;
  failed: number;
  delayed: number;
  failedJobs: number;
}

export default function EmailLogsPage() {
  const queryClient = useQueryClient();
  
  // UI State
  const [viewingEmail, setViewingEmail] = useState<EmailLog | null>(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  
  // Filters
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "failed" | "sent">("failed");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- 🔥 1. OPTIMIZED DATA FETCHING (React Query) ---

  // Query: Stats (Global)
  const { data: statsData } = useQuery<{ data: EmailStats }>({
    queryKey: ["email-stats"],
    queryFn: () => axiosInstance.get("/api/admin/email/statistics").then(res => res.data),
    refetchInterval: isAutoRefresh ? 30000 : false, // Poll every 30s
  });

  // Query: Queue (Global)
  const { data: queueData } = useQuery<{ data: QueueStats }>({
    queryKey: ["email-queue"],
    queryFn: () => axiosInstance.get("/api/admin/email/queue/stats").then(res => res.data),
    refetchInterval: isAutoRefresh ? 5000 : false, // Poll queue faster (5s) for live feel
  });

  // Query: Logs (Dependent on filters)
  const { data: logsData, isFetching: isLogsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["email-logs", page, activeTab, debouncedSearch],
    queryFn: () => axiosInstance.get(
      `/api/admin/email/logs?page=${page}&limit=10&status=${activeTab}&search=${debouncedSearch}`
    ).then(res => res.data),
    placeholderData: keepPreviousData, // ⚡ KEY: Keeps old data visible while fetching new!
    refetchInterval: isAutoRefresh ? 15000 : false,
  });

  const stats = statsData?.data;
  const queueStats = queueData?.data;
  const emails = logsData?.data?.emails || [];
  const totalPages = logsData?.data?.pagination?.pages || 1;

  // --- ACTIONS (Mutations) ---

  const retryMutation = useMutation({
    mutationFn: (emailLogId: string) => axiosInstance.post(`/api/admin/email/retry/${emailLogId}`),
    onSuccess: () => {
        toast.success("Retry queued!");
        queryClient.invalidateQueries({ queryKey: ["email-logs"] });
        queryClient.invalidateQueries({ queryKey: ["email-queue"] });
    },
    onError: () => toast.error("Failed to retry"),
  });

  const cleanupMutation = useMutation({
    mutationFn: () => axiosInstance.delete("/api/admin/email/cleanup"),
    onSuccess: () => {
        toast.success("Cleanup successful");
        queryClient.invalidateQueries({ queryKey: ["email-logs"] });
    },
    onError: () => toast.error("Cleanup failed"),
  });

  const handleCleanup = () => {
    if (confirm("Delete old logs to free space?")) cleanupMutation.mutate();
  };

  const copyErrorToClipboard = (text: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Error copied");
  };

  // --- HELPERS ---

  const getStatusBadge = (status: string) => {
    const styles = {
      sent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      failed: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      permanently_failed: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[status as keyof typeof styles] || "bg-gray-100"}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const getQueuePercentage = (val: number, total: number) => {
    if (total === 0) return 0;
    return Math.min(100, Math.round((val / total) * 100));
  };

  // 🎨 Custom Colors for Active Tabs
  const getTabClass = (tabName: string) => {
    const baseClass = "flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap capitalize";
    
    if (activeTab !== tabName) {
        return `${baseClass} text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50`;
    }

    switch(tabName) {
        case 'failed':
            return `${baseClass} bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 shadow-sm ring-1 ring-rose-200 dark:ring-rose-800`;
        case 'sent':
            return `${baseClass} bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-800`;
        case 'all':
            return `${baseClass} bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm ring-1 ring-amber-200 dark:ring-amber-800`;
        default:
            return baseClass;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-slate-950 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      <Toaster position="top-center" reverseOrder={false} />

      {/* --- PREVIEW MODAL --- */}
      {viewingEmail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[85vh] h-full rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-slate-800 animate-in zoom-in-95 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail size={18} className="text-blue-500"/> Email Preview
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 max-w-md truncate">Subject: {viewingEmail.subject}</p>
              </div>
              <button onClick={() => setViewingEmail(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} className="text-gray-500 dark:text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0 bg-gray-100 dark:bg-slate-950 relative flex flex-col">
               {viewingEmail.html ? (
                 <iframe 
                    title="email-preview"
                    srcDoc={viewingEmail.html} 
                    className="w-full flex-1 border-none bg-white" 
                    sandbox="allow-same-origin" 
                 />
               ) : (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Code size={32} className="opacity-40" />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">No HTML content</p>
                    <p className="text-sm mt-1 text-gray-500 dark:text-slate-500 max-w-xs">
                        This is a text-only email or body content wasn't saved.
                    </p>
                 </div>
               )}
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-2">
               <button onClick={() => setViewingEmail(null)} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-white rounded-lg text-sm font-medium transition-colors">
                  Close Preview
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER & CONTROLS --- */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Email Operations
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
              Live monitoring of outbound email traffic.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
             <div className="relative group flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                />
             </div>

             <div className="flex gap-2">
                <button
                  onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                  className={`p-2 rounded-xl border transition-all ${isAutoRefresh ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" : "bg-white border-gray-200 text-gray-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"}`}
                  title={isAutoRefresh ? "Pause Auto-Refresh" : "Enable Auto-Refresh"}
                >
                    {isAutoRefresh ? <Pause size={18} /> : <Play size={18} />}
                </button>

                <button
                  onClick={handleCleanup}
                  disabled={cleanupMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 transition-all shadow-sm font-medium text-sm disabled:opacity-50"
                >
                  <Trash2 size={16} className={cleanupMutation.isPending ? "animate-pulse" : ""} />
                  <span className="hidden sm:inline">Cleanup</span>
                </button>
                
                {!isAutoRefresh && (
                    <button
                        onClick={() => refetchLogs()}
                        disabled={isLogsLoading}
                        className="p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-white rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 animate-in fade-in"
                    >
                        <RefreshCw size={18} className={isLogsLoading ? "animate-spin" : ""} />
                    </button>
                )}
             </div>
          </div>
        </div>

        {/* --- STATS OVERVIEW --- */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
               <div>
                  <span className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Total Sent</span>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalSent.toLocaleString()}</div>
               </div>
               <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400">
                  <CheckCircle size={20} />
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
               <div>
                  <span className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Failures</span>
                  <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.totalFailed.toLocaleString()}</div>
               </div>
               <div className="p-2 sm:p-3 bg-rose-50 dark:bg-rose-900/20 rounded-full text-rose-600 dark:text-rose-400">
                  <AlertCircle size={20} />
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
               <div>
                  <span className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Sent Today</span>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.sentToday.toLocaleString()}</div>
               </div>
               <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                  <Clock size={20} />
               </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
               <div>
                  <span className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Monthly</span>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.sentThisMonth.toLocaleString()}</div>
               </div>
               <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400">
                  <Activity size={20} />
               </div>
            </div>
          </div>
        )}

        {/* --- QUEUE & BREAKDOWN --- */}
        {queueStats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"> 
                {/* 1. Queue Health (Left) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Activity className="text-blue-500" size={20}/> Queue Health
                        </h2>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">Live</span>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-medium mb-2">
                                <span className="text-gray-600 dark:text-slate-300">Processing (Active)</span>
                                <span className="text-gray-900 dark:text-white">{queueStats.active} jobs</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${getQueuePercentage(queueStats.active, 50)}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-medium mb-2">
                                <span className="text-gray-600 dark:text-slate-300">Waiting in Line</span>
                                <span className="text-gray-900 dark:text-white">{queueStats.waiting} jobs</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${getQueuePercentage(queueStats.waiting, 100)}%` }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-medium mb-2">
                                <span className="text-gray-600 dark:text-slate-300">Failed (Retry Queue)</span>
                                <span className="text-gray-900 dark:text-white">{queueStats.failed} jobs</span>
                            </div>
                            <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${getQueuePercentage(queueStats.failed, 20)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Breakdown */}
                 <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm flex flex-col h-full">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <PieChart size={16} /> Breakdown
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                        {stats?.byType && stats.byType.length > 0 ? (
                            stats.byType.map((type) => (
                                <div key={type.emailType} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all">
                                    <span className="text-sm font-medium text-gray-600 dark:text-slate-300 capitalize">
                                        {type.emailType}
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-md shadow-sm border border-gray-100 dark:border-slate-700">
                                        {type._count.id}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                                <p>No data yet.</p>
                            </div>
                        )}
                    </div>
                 </div>
            </div>
        )}

        {/* --- MAIN TABLE --- */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
            
            {/* Tabs (With Custom Colors) */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
                    {(['failed', 'sent', 'all'] as const).map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => { setActiveTab(tab); setPage(1); }}
                            className={getTabClass(tab)} // Use the new helper function
                        >
                            {tab === 'all' ? 'All Logs' : tab}
                        </button>
                    ))}
                </div>
                
                {(searchQuery || activeTab !== 'failed') && (
                     <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                         <Filter size={12} />
                         <span>Filter active</span>
                     </div>
                )}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-slate-800 min-h-[400px]">
                <table className={`w-full text-left text-sm transition-opacity duration-200 ${isLogsLoading ? 'opacity-50' : 'opacity-100'}`}>
                    <thead className="bg-gray-50/80 dark:bg-slate-950/80 text-gray-500 dark:text-slate-400 font-semibold border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
                        <tr>
                            <th className="p-5 pl-6">Recipient</th>
                            <th className="p-5">Subject</th>
                            <th className="p-5">Status</th>
                            {activeTab !== 'sent' && <th className="p-5">Error Message</th>}
                            <th className="p-5">Time</th>
                            <th className="p-5 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {emails.length === 0 ? (
                            <tr>
                                <td colSpan={activeTab !== 'sent' ? 6 : 5} className="p-20 text-center text-gray-400 dark:text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <Mail size={32} className="opacity-50" />
                                        </div>
                                        <p className="font-medium">No {activeTab} emails found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            emails.map((email:any) => (
                                <tr key={email.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-5 pl-6">
                                        <div className="font-bold text-gray-900 dark:text-white">{email.recipientEmail}</div>
                                        <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 uppercase tracking-wide font-medium">{email.emailType}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-gray-700 dark:text-slate-300 max-w-[200px] truncate font-medium" title={email.subject}>
                                            {email.subject}
                                        </div>
                                        {email.orderNumber && (
                                            <span className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-500 px-1.5 py-0.5 rounded mt-1 inline-block border border-gray-200 dark:border-slate-700">
                                                #{email.orderNumber}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        {getStatusBadge(email.status)}
                                    </td>
                                    
                                    {activeTab !== 'sent' && (
                                        <td className="p-5">
                                            {email.status === 'failed' || email.status === 'permanently_failed' ? (
                                                <div className="text-rose-600 dark:text-rose-400 text-xs font-mono bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg max-w-[250px] truncate border border-rose-100 dark:border-rose-900/20" title={email.failureReason || email.errorMessage || ''}>
                                                    {email.failureReason || email.errorMessage || 'Unknown Error'}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                    )}

                                    <td className="p-5 text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">
                                        {email.sentAt ? new Date(email.sentAt).toLocaleDateString() : new Date(email.createdAt).toLocaleDateString()}
                                        <br/>
                                        <span className="text-gray-400">{email.sentAt ? new Date(email.sentAt).toLocaleTimeString() : new Date(email.createdAt).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="p-5 text-right pr-6">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setViewingEmail(email)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                                                title="View Email Content"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            
                                            {(activeTab !== 'sent') && (email.status === 'failed' || email.status === 'permanently_failed') && (
                                                <button 
                                                    onClick={() => copyErrorToClipboard(email.failureReason || email.errorMessage)}
                                                    className="p-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors" 
                                                    title="Copy Error"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            )}

                                            {(email.status === 'permanently_failed' || email.status === 'failed') && (
                                                <button
                                                    onClick={() => retryMutation.mutate(email.id)}
                                                    disabled={retryMutation.isPending}
                                                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                                    title="Retry"
                                                >
                                                    <RefreshCw size={16} className={retryMutation.isPending ? "animate-spin" : ""} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                        Page <span className="text-gray-900 dark:text-white font-bold">{page}</span> of <span className="text-gray-900 dark:text-white font-bold">{totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage((p) => Math.max(1, p - 1))} 
                            disabled={page === 1} 
                            className="p-2.5 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-gray-600 dark:text-slate-300"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button 
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                            disabled={page === totalPages} 
                            className="p-2.5 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent transition-colors text-gray-600 dark:text-slate-300"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}