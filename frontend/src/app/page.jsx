"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../store/useAuthStore";
import axios from "axios";
import { Lock, Mail, Loader2, Scale } from "lucide-react";
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Professional Email Validation Check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address (e.g., ali@example.com).");
      return;
    }

    setLoading(true);
    try {
      // Backend URL (Make sure this matches your environment - local vs production)
      const response = await axios.post("https://caseroute-backend.onrender.com/api/auth/login", {
        email,
        password,
      });
      
      login(response.data.user, response.data.token);
      
      const userRole = response.data.user.role;

      if (userRole === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (userRole === "LAWYER") {
        router.push("/dashboard/lawyer");
      } else {
        router.push("/dashboard/user");
      }

    } catch (error) {
      alert(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-200">
        
        {/* Branding/Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="p-4 bg-slate-900 rounded-2xl text-white mb-4 shadow-lg">
            <Scale size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">CaseRoute</h1>
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mt-1">Legal Marketplace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="ali@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 placeholder:text-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {/* NEW FORGOT PASSWORD LINK */}
            <div className="flex justify-end mt-2">
              <Link 
                href="/forgot-password" 
                className="text-sm font-semibold text-slate-500 hover:text-slate-900 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-slate-500">
          Don&apos;t have an account?{" "}
          <Link 
            href="/signup" 
            className="text-slate-900 font-bold hover:underline transition-all"
          >
            Sign Up here
          </Link>
        </div>

      </div>
    </div>
  );
}