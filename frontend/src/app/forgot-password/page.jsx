"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Professional Email Validation Check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address (e.g., ali@example.com).");
      return;
    }

    setLoading(true);
    try {
      // Connects to your backend API
      
      await axios.post("https://caseroute-backend.onrender.com/api/auth/forgot-password", {
        email,
      });
      
      // We set this to true to show the success screen
      setIsSubmitted(true);
    } catch (error) {
      
      setIsSubmitted(true); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-200">
        
        {/* Branding/Icon */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-4 bg-slate-100 rounded-full text-slate-900 mb-4 border border-slate-200">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset Password</h1>
          {!isSubmitted && (
            <p className="text-slate-500 text-sm font-medium mt-2">
              Enter your email address and we will send you instructions to reset your password.
            </p>
          )}
        </div>

        {/* Conditional Rendering: Form vs. Success Message */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : null}
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3 mb-6">
            <h3 className="text-slate-900 font-bold">Check your inbox</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              If an account exists for <span className="font-semibold text-slate-900">{email}</span>, we have sent a password reset link.
            </p>
          </div>
        )}

        {/* Back to Login Link */}
        <div className="mt-8 flex justify-center">
          <Link 
            href="/login" 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}