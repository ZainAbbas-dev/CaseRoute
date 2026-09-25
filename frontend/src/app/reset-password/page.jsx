"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, KeyRound } from "lucide-react";
import axios from "axios";
import Link from "next/link";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // URL se token nikalne ke liye
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Invalid request. No token found in URL.");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);
    try {
        
      await axios.post("https://caseroute-backend.onrender.com/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      
      setSuccess(true);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to reset password. Token might be expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-green-100 rounded-full text-green-700 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Password Reset!</h2>
        <p className="text-slate-500 font-medium">Your password has been successfully updated.</p>
        <Link 
          href="/login"
          className="mt-6 w-full inline-block bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
        >
          Proceed to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <div className="p-4 bg-slate-100 rounded-full text-slate-900 mx-auto w-16 h-16 flex items-center justify-center mb-4 border border-slate-200">
          <KeyRound size={28} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create New Password</h1>
        <p className="text-slate-500 text-sm font-medium mt-2">Enter your new password below.</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">New Password</label>
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
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="password"
            required
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 placeholder:text-slate-400"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
        {loading ? "Updating..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-200">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-slate-900" size={32} /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}