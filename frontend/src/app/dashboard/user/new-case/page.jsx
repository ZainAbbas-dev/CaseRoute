"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import axios from "axios";

export default function NewCasePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await axios.post("http://localhost:5000/api/cases", {
        title,
        description,
        userId: user.id
      });
      // Once successful, send them back to the dashboard
      router.push("/dashboard/user");
    } catch (error) {
      console.error("Error submitting case", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Submit a New Legal Case</h1>
        <p className="text-gray-500 mb-8">Describe your situation. In the next phase, our AI will automatically structure this for the right lawyer.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Case Title (Brief summary)</label>
            <input
              type="text"
              required
              placeholder="e.g., Property Dispute with Landlord"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Description</label>
            <textarea
              required
              rows="6"
              placeholder="Explain what happened in detail..."
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/user")}
              className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}