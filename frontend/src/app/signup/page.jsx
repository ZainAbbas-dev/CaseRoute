"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/utils/api'; // Ensure this points to your Render URL via env vars

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
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration Successful!");
        
        // Logical Redirection based on your requirements
        const userRole = formData.role.toUpperCase();
        
        if (userRole === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (userRole === 'LAWYER') {
          router.push('/lawyer/dashboard');
        } else {
          router.push('/client/dashboard');
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded-lg flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>
        
        <input name="name" placeholder="Full Name" onChange={handleChange} required className="border p-2 rounded" />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="border p-2 rounded" />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="border p-2 rounded" />
        
        <label className="font-semibold">Select Role:</label>
        <select name="role" onChange={handleChange} className="border p-2 rounded">
          <option value="USER">Client / User</option>
          <option value="LAWYER">Lawyer</option>
          <option value="ADMIN">Admin</option>
        </select>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}