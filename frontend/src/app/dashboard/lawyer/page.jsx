"use client";

import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { MessageSquare, Briefcase, Gavel } from "lucide-react";

export default function LawyerDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [pendingCases, setPendingCases] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "LAWYER") {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Open Marketplace Cases
        const pendingRes = await axios.get(
          "http://localhost:5000/api/cases/pending",
        );
        setPendingCases(pendingRes.data);

        // 2. Fetch Cases already assigned to this lawyer
        // Note: We'll reuse the user endpoint but filter by lawyerId on the backend
        // or just fetch all cases and filter here for now.
        const allRes = await axios.get(
          `http://localhost:5000/api/cases/pending`,
        );
        // Better: Fetch specifically for this lawyer.
        // For now, let's assume we fetch assigned cases from a new endpoint:
        const activeRes = await axios.get(
          `http://localhost:5000/api/cases/single/lawyer/${user.id}`,
        );
        setActiveCases(activeRes.data);
      } catch (error) {
        console.error("Error fetching lawyer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleAcceptCase = async (caseId) => {
    try {
      await axios.put(`http://localhost:5000/api/cases/${caseId}/assign`, {
        lawyerId: user.id,
      });
      alert("Case accepted! It is now in your Active Cases.");
      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error("Error accepting case", error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-xl shadow-md mb-8">
          <div>
            <h1 className="text-2xl font-bold">Lawyer Portal</h1>
            <p className="text-sm text-slate-400">Advocate {user.name}</p>
          </div>
          
          <button
            onClick={() => router.push("/dashboard/lawyer/profile")}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>

          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="px-4 py-2 text-sm font-semibold bg-slate-800 text-red-400 rounded-lg hover:bg-slate-700 transition"
          >
            Logout
          </button>

        </header>

        {/* SECTION 1: ACTIVE CASES (CHAT ENABLED) */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Your Active Cases
            </h2>
          </div>

          {activeCases.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
              No active cases. Accept a case from the marketplace to start.
            </div>
          ) : (
            <div className="grid gap-4">
              {activeCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-blue-100 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold text-slate-800">{c.title}</h3>
                    <p className="text-xs text-slate-500">
                      Client: {c.user?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/chat/${c.id}`)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                  >
                    <MessageSquare size={16} />
                    Chat with Client
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION 2: MARKETPLACE (PENDING CASES) */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Gavel className="text-yellow-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Open Case Marketplace
            </h2>
          </div>

          {isLoading ? (
            <p>Loading marketplace...</p>
          ) : pendingCases.length === 0 ? (
            <p className="text-slate-500">No new cases available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-800">
                      {c.title}
                    </h3>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold rounded-full uppercase">
                      {c.urgency || "Normal"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {c.description}
                  </p>
                  <button
                    onClick={() => handleAcceptCase(c.id)}
                    className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-800 transition"
                  >
                    Accept Case
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
