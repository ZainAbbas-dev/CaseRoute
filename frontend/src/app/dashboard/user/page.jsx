"use client";

import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function UserDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. New state for handling the rating UI
  const [ratingCaseId, setRatingCaseId] = useState(null);

  // Route Protection & Fetch Cases
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchCases = async () => {
      try {
        const response = await axios.get(
          `https://caseroute-backend.onrender.com/api/cases/user/${user.id}`,
        );
        setCases(response.data);
      } catch (error) {
        console.error("Error fetching cases:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // 2. New handler to resolve the case and submit a rating
  const handleResolveAndRate = async (caseId, lawyerId, rating) => {
    try {
      await axios.post(`https://caseroute-backend.onrender.com/api/cases/${caseId}/resolve`, {
        rating,
        lawyerId
      });
      alert("Case resolved! Thank you for your feedback.");
      setRatingCaseId(null);
      window.location.reload(); // Refresh to update case status
    } catch (err) {
      alert("Error resolving case.");
    }
  };

  // Old rating handler (retained for backward compatibility if needed)
  const handleRateLawyer = async (caseId, rating, selectedLawyerId) => {
    try {
      await axios.post(`https://caseroute-backend.onrender.com/api/cases/${caseId}/rate`, { 
        rating, 
        lawyerId: selectedLawyerId 
      });
      alert("Thank you for your feedback!");
    } catch (err) {
      console.error("Rating failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Client Dashboard
            </h1>
            <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
          >
            Logout
          </button>
        </header>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Your Cases</h2>
          <button
            onClick={() => router.push("/dashboard/user/new-case")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + New Case
          </button>
        </div>

        {/* Dynamic Case List */}
        {isLoading ? (
          <p className="text-gray-500">Loading your cases...</p>
        ) : cases.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Active Cases
            </h2>
            <p className="text-gray-500">
              You haven't submitted any legal complaints yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {cases.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {c.title}
                    </h3>
                    <p className="text-sm text-slate-500 truncate max-w-xl">
                      {c.lawyer ? `Lawyer: ${c.lawyer.name}` : c.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                      {c.status}
                    </span>
                    
                    {/* Resolve and Rate UI Logic */}
                    {c.status === "ASSIGNED" && (
                      <div className="mt-2">
                        {ratingCaseId === c.id ? (
                          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button 
                                key={star} 
                                onClick={() => handleResolveAndRate(c.id, c.lawyerId, star)}
                                className="text-xl hover:scale-125 transition"
                              >
                                ⭐
                              </button>
                            ))}
                            <button 
                              onClick={() => setRatingCaseId(null)} 
                              className="text-[10px] font-bold text-slate-400 ml-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setRatingCaseId(c.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition"
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Case Footer Actions */}
                <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                  <span className="text-xs text-gray-400">
                    Created: {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => router.push(`/dashboard/user/case/${c.id}`)}
                      className="text-sm text-blue-600 font-bold hover:underline"
                    >
                      View Case Details &rarr;
                    </button>

                    {c.status === "ASSIGNED" && (
                      <button
                        onClick={() => router.push(`/dashboard/chat/${c.id}`)}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition"
                      >
                        Open Live Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}