"use client";

import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { MessageSquare, Briefcase, Gavel, Scale, Loader2, ShieldAlert } from "lucide-react";

export default function LawyerDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [pendingCases, setPendingCases] = useState([]);
  const [activeCases, setActiveCases] = useState([]);
  const [profile, setProfile] = useState(null);
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
          "https://caseroute-backend.onrender.com/api/cases/pending",
        );
        setPendingCases(pendingRes.data);

        // 2. Fetch Active Cases for this lawyer
        const activeRes = await axios.get(
          `https://caseroute-backend.onrender.com/api/cases/single/lawyer/${user.id}`,
        );
        setActiveCases(activeRes.data);

        // 3. Fetch Profile DIRECTLY for the Navbar
        const profileRes = await axios.get(
          `https://caseroute-backend.onrender.com/api/lawyer/profile/${user.id}`,
        );
        if (profileRes.data) {
          setProfile(profileRes.data);
        }
      } catch (error) {
        console.error("Error fetching lawyer data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleAcceptCase = async (caseId) => {
    if (!user.isVerified) return;
    try {
      await axios.put(
        `https://caseroute-backend.onrender.com/api/cases/${caseId}/assign`,
        {
          lawyerId: user.id,
        },
      );
      alert("Case accepted! It is now in your Active Cases.");
      window.location.reload();
    } catch (error) {
      console.error("Error accepting case", error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-lg text-white">
            <Scale size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Lawyer Portal
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition"
          >
            Logout
          </button>

          <Link href="/dashboard/lawyer/profile">
            <div className="relative group cursor-pointer">
              <img
                src={
                  profile?.profileImage ||
                  `https://ui-avatars.com/api/?name=${user?.name}&background=0f172a&color=fff`
                }
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-slate-200 group-hover:border-blue-500 transition-all object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
            </div>
          </Link>
        </div>
      </nav>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-900">
            Welcome, Advocate {user.name.split(" ")[0]}
          </h2>
          <p className="text-slate-500 font-medium">
            Manage your active cases and client communications from your unified
            dashboard.
          </p>
        </div>

        {/* 1. VERIFICATION ALERT BANNER */}
        {!user.isVerified && (
          <div className="mb-8 bg-blue-50 border border-blue-200 p-6 rounded-2xl flex items-start gap-4">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black uppercase text-xs tracking-widest">
                Account Under Review
              </h3>
              <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                Your professional credentials have been submitted. You will be able to accept cases from the 
                marketplace once the <strong>Admin</strong> verifies your ID. Usually takes 24-48 hours.
              </p>
            </div>
          </div>
        )}

        {/* 2. ACTIVE CASES SECTION */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Briefcase className="text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Your Active Cases
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-slate-300" size={40} />
            </div>
          ) : activeCases.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 font-medium">
              No active cases. Accept a case from the marketplace to get
              started.
            </div>
          ) : (
            <div className="grid gap-4">
              {activeCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition"
                >
                  <div>
                    <h3 className="font-bold text-slate-800">{c.title}</h3>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Client: {c.user?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/chat/${c.id}`)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                  >
                    <MessageSquare size={16} />
                    Open Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. RESTRICTED MARKETPLACE SECTION */}
        <section className={!user.isVerified ? "opacity-60 pointer-events-none grayscale" : ""}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Gavel className="text-amber-500" />
              <h2 className="text-xl font-bold text-slate-800">
                Case Marketplace
              </h2>
            </div>
            {!user.isVerified && (
              <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">
                Locked
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-slate-300" size={40} />
            </div>
          ) : pendingCases.length === 0 ? (
            <p className="text-slate-400 font-medium bg-white p-6 rounded-2xl border border-slate-100 text-center">
              No new cases available at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {c.title}
                      </h3>
                      <span
                        className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${
                          c.urgency === "HIGH"
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {c.urgency || "Normal"}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>
                  <button
                    disabled={!user.isVerified}
                    onClick={() => handleAcceptCase(c.id)}
                    className={`w-full py-3 rounded-xl font-bold transition shadow-lg ${
                      user.isVerified 
                      ? "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {user.isVerified ? "Accept Case" : "Verification Required"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}