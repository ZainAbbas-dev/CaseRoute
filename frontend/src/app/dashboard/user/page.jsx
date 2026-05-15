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

  const handleRateLawyer = async (caseId, rating) => {
  try {
    await axios.post(`https://caseroute-backend.onrender.com/api/cases/${caseId}/rate`, { 
      rating, 
      lawyerId: selectedLawyerId 
    });
    alert("Thank you for your feedback!");
    // Refresh UI
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
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {c.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate max-w-xl">
                    {c.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                    {c.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>

                  {/* Primary Action: Access to Timeline, Document Vault, and Matches */}
                  <button 
                    onClick={() => router.push(`/dashboard/user/case/${c.id}`)}
                    className="text-sm text-blue-600 font-bold hover:underline"
                  >
                    View Case Details &rarr;
                  </button>

                  {/* Open Chat only if lawyer is assigned */}
                  {c.status === "ASSIGNED" && (
                    <button
                      onClick={() => router.push(`/dashboard/chat/${c.id}`)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition"
                    >
                      Open Live Chat
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}