"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from "../../store/useAuthStore";
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' 
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Full Name Validation
    if (!formData.name.trim()) {
      alert("Full Name is required.");
      return;
    }

    // 2. Professional Email Validation Check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address (e.g., ali@example.com).");
      return;
    }

    // 3. Password Strength Validation
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    // 4. Confirm Password Match Check
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      // Removing confirmPassword before sending to backend as it's only needed for frontend validation
      const { confirmPassword, ...submitData } = formData;

      const res = await fetch(`https://caseroute-backend.onrender.com/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok) {
        login(data.user, data.token);
        const userRole = data.user.role;
        if (userRole === 'LAWYER') {
          router.replace('/dashboard/lawyer');
        } else {
          router.replace('/dashboard/user');
        }
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      alert("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans p-6">
      <form onSubmit={handleSubmit} className="p-10 bg-white shadow-xl rounded-3xl flex flex-col gap-5 max-w-md w-full border border-slate-200">
        
        <div className="text-center mb-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Join CaseRoute today.</p>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Full Name</label>
          {/* Updated placeholder to "Ali" */}
          <input name="name" placeholder="Ali" onChange={handleChange} required 
            className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 placeholder:text-slate-400" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Email Address</label>
          <input name="email" type="email" placeholder="ali@example.com" onChange={handleChange} required 
            className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 placeholder:text-slate-400" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Password</label>
          <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required 
            className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 placeholder:text-slate-400" />
        </div>

        {/* NEW CONFIRM PASSWORD FIELD */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Confirm Password</label>
          <input name="confirmPassword" type="password" placeholder="••••••••" onChange={handleChange} required 
            className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 placeholder:text-slate-400" />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Select Role</label>
          <select name="role" onChange={handleChange} 
            className="w-full p-4 bg-white border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition-all text-slate-900 cursor-pointer appearance-none">
            <option value="USER">Client / User</option>
            <option value="LAWYER">Lawyer</option>
          </select>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg mt-2 disabled:opacity-70">
          {loading ? "Registering..." : "Sign Up"}
        </button>

        <div className="mt-4 text-center text-sm font-medium text-slate-500">
          Already have an account?{" "}
          <Link 
            href="/login" 
            className="text-slate-900 font-bold hover:underline transition-all"
          >
            Sign In here
          </Link>
        </div>
      </form>
    </div>
  );
}