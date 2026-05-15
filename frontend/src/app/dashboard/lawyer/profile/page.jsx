"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import axios from "axios";
import { UserCheck, Save, ArrowLeft, Camera, Loader2 } from "lucide-react";

export default function LawyerProfileEditor() {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    specialization: "Civil Dispute",
    experience: 1,
    location: "Islamabad",
    profileImage: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // 1. Fetch existing profile data on load
  useEffect(() => {
    if (!user || user.role !== "LAWYER") {
      router.push("/login");
      return;
    }

    const fetchExistingProfile = async () => {
      try {
        // We reuse the single lawyer fetch endpoint we created earlier
        const res = await axios.get(`https://caseroute-backend.onrender.com/api/cases/single/lawyer/${user.id}`);
        if (res.data && res.data.length > 0) {
          // Assuming the first returned case has the profile info we need
          // Or better, fetch from a dedicated profile endpoint if you have one
          const profile = res.data[0].lawyer?.lawyerProfile; 
          if (profile) {
            setFormData({
              specialization: profile.specialization || "Civil Dispute",
              experience: profile.experience || 1,
              location: profile.location || "Islamabad",
              profileImage: profile.profileImage || ""
            });
          }
        }
      } catch (err) {
        console.error("No existing profile found or error fetching.");
      } finally {
        setFetching(false);
      }
    };

    fetchExistingProfile();
  }, [user, router]);

  // 2. Handle Image to Base64 conversion
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { // 1MB limit for Base64 storage efficiency
        alert("File is too large. Please upload an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Save Updated Profile
  const handleSave = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await axios.put(`https://caseroute-backend.onrender.com/api/lawyer/profile/${user.id}`, formData);
    alert("Profile Updated!");
    router.push("/dashboard/lawyer");
  } catch (err) {
    alert("Save failed. Check console.");
  } finally {
    setLoading(false);
  }
};

  if (fetching) return <div className="min-h-screen flex items-center justify-center">Loading Profile Data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <button onClick={() => router.back()} className="flex items-center text-slate-400 hover:text-slate-600 mb-6 transition">
          <ArrowLeft size={18} className="mr-2"/> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-blue-600 rounded-lg text-white">
            <UserCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Professional Profile</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-28 h-28 mb-2">
              <img 
                src={formData.profileImage || "https://ui-avatars.com/api/?name=" + user.name} 
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-inner"
                alt="Profile Preview"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white cursor-pointer shadow-lg hover:bg-blue-700 transition border-2 border-white">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Photo</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Legal Specialization</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={formData.specialization}
              onChange={(e) => setFormData({...formData, specialization: e.target.value})}
            >
              <option>Civil Dispute</option>
              <option>Criminal Defense</option>
              <option>Family Law</option>
              <option>Corporate Law</option>
              <option>Property Law</option>
              <option>Labor Law</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
            <input 
              type="number" 
              min="0"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">City / Location</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g. Islamabad"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition flex justify-center items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Saving Changes..." : "Save Professional Details"}
          </button>
        </form>
      </div>
    </div>
  );
}