"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import axios from "axios";
import { Users, FileText, ShieldAlert, CheckCircle, BarChart3, Clock, RotateCcw, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stalledCases, setStalledCases] = useState([]);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [verificationQueue, setVerificationQueue] = useState([]);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    const fetchAdminData = async () => {
      try {
        // 1. Fetch General Stats and Lawyer Registry
        const statsRes = await axios.get("https://caseroute-backend.onrender.com/api/admin/stats");
        setData(statsRes.data);

        // 2. Fetch Stalled Cases (Assigned but no messages)
        const stalledRes = await axios.get("https://caseroute-backend.onrender.com/api/admin/stalled-cases");
        setStalledCases(stalledRes.data);
      } catch (err) {
        console.error("Admin Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [user, router]);

  // useEffect for Verification Queue
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await axios.get("https://caseroute-backend.onrender.com/api/admin/verification-queue");
        setVerificationQueue(res.data);
      } catch (err) {
        console.log("Error loading queue");
      }
    };
    fetchQueue();
  }, []);

  const handleVerify = async (id) => {
    try {
      await axios.put(`https://caseroute-backend.onrender.com/api/admin/lawyer/${id}/verify`);
      setVerificationQueue(prev => prev.filter(l => l.id !== id));
      alert("Lawyer has been verified and added to the marketplace!");
    } catch (err) {
      alert("Verification failed.");
    }
  };

  const handleReopenCase = async (caseId) => {
    if (!confirm("Are you sure you want to remove this lawyer and return the case to the marketplace?")) return;
    
    setIsActionLoading(true);
    try {
      await axios.put(`https://caseroute-backend.onrender.com/api/admin/cases/${caseId}/reopen`);
      // Update local state to remove the case from the stalled list
      setStalledCases((prev) => prev.filter((c) => c.id !== caseId));
      alert("Case has been successfully re-opened to the marketplace.");
    } catch (err) {
      console.error("Reopen Error:", err);
      alert("Failed to re-open case.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="font-bold text-slate-500 tracking-widest uppercase text-xs">Loading Command Center...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Command Center</h1>
            <p className="text-gray-500 font-medium">System Overview & Marketplace Management</p>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }} className="bg-white text-red-600 px-6 py-2 rounded-xl font-bold shadow-sm border border-red-100 hover:bg-red-50 transition active:scale-95">
            Logout
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Users className="text-blue-600"/>} label="Total Users" value={data?.stats.totalUsers} />
          <StatCard icon={<FileText className="text-purple-600"/>} label="Total Cases" value={data?.stats.totalCases} />
          <StatCard icon={<ShieldAlert className="text-amber-600"/>} label="Pending" value={data?.stats.pendingCases} />
          <StatCard icon={<CheckCircle className="text-green-600"/>} label="Assigned" value={data?.stats.assignedCases} />
        </div>

        {/* SECTION: VERIFICATION QUEUE */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <CheckCircle size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Verification Queue</h2>
            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              {verificationQueue.length} NEW
            </span>
          </div>

          {verificationQueue.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-slate-400 font-medium italic">
              No lawyers currently waiting for verification.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {verificationQueue.map((lawyer) => (
                <div key={lawyer.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900">{lawyer.name}</h3>
                        <p className="text-xs text-slate-500 font-bold">{lawyer.email}</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-black uppercase">
                        {lawyer.lawyerProfile?.specialization || "General"}
                      </span>
                    </div>

                    {/* Document Preview Placeholder */}
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl h-32 flex flex-center justify-center items-center mb-4">
                      {lawyer.lawyerProfile?.barIdImageUrl ? (
                        <img src={lawyer.lawyerProfile.barIdImageUrl} className="h-full w-full object-contain p-2" alt="Bar ID" />
                      ) : (
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No Document Image Provided</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <button 
                      onClick={() => handleVerify(lawyer.id)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-black hover:bg-blue-700 transition uppercase tracking-wider"
                    >
                      Approve & Verify
                    </button>
                    <button className="px-4 py-2 border border-red-100 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION: STALLED CASES MONITOR */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-red-500" size={20} />
            <h2 className="text-xl font-bold text-gray-800">Stalled Cases Monitor</h2>
            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-black rounded-full uppercase">Action Required</span>
          </div>
          
          {stalledCases.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400 font-medium">
              No stalled cases detected. All lawyers are actively communicating.
            </div>
          ) : (
            <div className="grid gap-4">
              {stalledCases.map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-red-500 border border-gray-200 flex justify-between items-center hover:shadow-md transition">
                  <div>
                    <h3 className="font-bold text-gray-900">{c.title}</h3>
                    <div className="flex gap-4 mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Client: {c.user?.name}</span>
                      <span className="text-red-400">Lawyer: {c.lawyer?.name} (No Response)</span>
                    </div>
                  </div>
                  <button 
                    disabled={isActionLoading}
                    onClick={() => handleReopenCase(c.id)}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <RotateCcw size={14} />
                    Re-open to Marketplace
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lawyer Management Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <BarChart3 className="text-gray-400" />
            <h2 className="text-xl font-bold text-gray-800">Lawyer Registry</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {data?.lawyers.map((lawyer) => (
                  <tr key={lawyer.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="p-4 font-semibold text-slate-900">{lawyer.name}</td>
                    <td className="p-4 text-slate-500">{lawyer.lawyerProfile?.specialization || "Unset"}</td>
                    <td className="p-4 text-slate-500">{lawyer.lawyerProfile?.experience || 0} Years</td>
                    <td className="p-4 font-bold text-slate-700">⭐ {lawyer.lawyerProfile?.rating || "5.0"}</td>
                    <td className="p-4 text-right">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-black uppercase tracking-tighter">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-slate-300 transition group">
      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-slate-100 transition">{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value ?? 0}</p>
      </div>
    </div>
  );
}