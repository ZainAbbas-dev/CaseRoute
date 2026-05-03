"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import axios from "axios";
import { Users, FileText, ShieldAlert, CheckCircle, BarChart3 } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    const fetchAdminData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/stats");
        setData(res.data);
      } catch (err) {
        console.error("Admin Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [user, router]);

  if (isLoading) return <div className="p-10 text-center">Loading Command Center...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Command Center</h1>
            <p className="text-gray-500">System Overview & Management</p>
          </div>
          <button onClick={() => { logout(); router.push("/login"); }} className="bg-white text-red-600 px-6 py-2 rounded-lg font-bold shadow-sm border border-red-100 hover:bg-red-50 transition">
            Logout
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<Users className="text-blue-600"/>} label="Total Users" value={data.stats.totalUsers} />
          <StatCard icon={<FileText className="text-purple-600"/>} label="Total Cases" value={data.stats.totalCases} />
          <StatCard icon={<ShieldAlert className="text-yellow-600"/>} label="Pending" value={data.stats.pendingCases} />
          <StatCard icon={<CheckCircle className="text-green-600"/>} label="Assigned" value={data.stats.assignedCases} />
        </div>

        {/* Lawyer Management Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <BarChart3 className="text-gray-400" />
            <h2 className="text-xl font-bold text-gray-800">Lawyer Registry</h2>
          </div>
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
              {data.lawyers.map((lawyer) => (
                <tr key={lawyer.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="p-4 font-semibold">{lawyer.name}</td>
                  <td className="p-4">{lawyer.lawyerProfile?.specialization || "Unset"}</td>
                  <td className="p-4">{lawyer.lawyerProfile?.experience || 0} Years</td>
                  <td className="p-4">⭐ {lawyer.lawyerProfile?.rating || "5.0"}</td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}