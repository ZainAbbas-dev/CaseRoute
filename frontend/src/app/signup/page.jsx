"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Removed the missing API_BASE_URL import

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' // Default role
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Hardcoded to match your local backend exactly like your Login page
      const res = await fetch(`http://localhost:5000/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration Successful!");
        
        const userRole = formData.role.toUpperCase();
        
        if (userRole === 'ADMIN') {
          router.push('/dashboard/admin');
        } else if (userRole === 'LAWYER') {
          router.push('/dashboard/lawyer');
        } else {
          router.push('/dashboard/user');
        }
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-xl rounded-3xl flex flex-col gap-4 max-w-md w-full border border-slate-100">
        <h2 className="text-2xl font-black text-center text-slate-800 mb-4">Create Account</h2>
        
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500 uppercase ml-1">Full Name</label>
          <input name="name" placeholder="Ali Khan" onChange={handleChange} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500 uppercase ml-1">Email Address</label>
          <input name="email" type="email" placeholder="ali@example.com" onChange={handleChange} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500 uppercase ml-1">Password</label>
          <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-500 uppercase ml-1">Select Role</label>
          <select name="role" onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
            <option value="USER">Client / User</option>
            <option value="LAWYER">Lawyer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg mt-4 disabled:opacity-70"
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}