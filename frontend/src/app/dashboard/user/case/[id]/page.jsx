"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import axios from "axios";
import { 
  File, Upload, Trash2, ArrowLeft, 
  Shield, Loader2, CheckCircle, Clock, Lock 
} from "lucide-react";

// Updated Timeline Component with Refined Logic
function CaseTimeline({ status }) {
  const isResolved = status === "RESOLVED";
  
  // 1. Refined steps to match the full legal case lifecycle
  const steps = [
    { label: "SUBMITTED", status: "PENDING" },
    { label: "PROCESSING", status: "PENDING" },
    { label: "LAWYER ASSIGNED", status: "ASSIGNED" },
    { label: "ACTIVE CHAT", status: "ASSIGNED" },
    { label: "RESOLVED", status: "RESOLVED" },
  ];

  // 2. Calculation for progress bar and active markers
  const activeIndex = isResolved ? 5 : (status === "ASSIGNED" ? 3 : 1);
  const progressWidth = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <div className="relative flex justify-between items-center">
        
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
        
        {/* Progress Line (Blue) */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-10 transition-all duration-1000"
          style={{ width: `${Math.min(progressWidth, 100)}%` }}
        ></div>

        {/* Timeline Steps */}
        {steps.map((step, index) => {
          // A step is completed if it's behind the active index or if the case is resolved
          const isCompleted = isResolved || index < activeIndex;

          return (
            <div key={index} className="relative z-20 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors ${
                isCompleted 
                  ? "bg-blue-600 border-blue-200 text-white" 
                  : "bg-white border-slate-100 text-slate-300"
              }`}>
                {isCompleted ? <CheckCircle size={18} /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <p className={`text-[10px] font-black tracking-tighter uppercase ${
                isCompleted ? "text-blue-600" : "text-slate-300"
              }`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CaseDetailsPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [caseDetails, setCaseDetails] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const isResolved = caseDetails?.status === "RESOLVED";

  useEffect(() => {
    if (!user) return router.push("/login");

    const fetchCaseAndDocs = async () => {
      try {
        const [caseRes, docsRes] = await Promise.all([
          axios.get(`https://caseroute-backend.onrender.com/api/cases/single/${id}`),
          axios.get(`https://caseroute-backend.onrender.com/api/cases/${id}/documents`)
        ]);
        setCaseDetails(caseRes.data);
        setDocuments(docsRes.data);
      } catch (error) {
        console.error("Error fetching case data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaseAndDocs();
  }, [id, user, router]);

  const handleFileUpload = async (e) => {
    if (isResolved) return;
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await axios.post(`https://caseroute-backend.onrender.com/api/cases/${id}/documents`, {
          fileName: file.name,
          fileType: file.type,
          fileData: reader.result,
          userId: user.id
        });
        const res = await axios.get(`https://caseroute-backend.onrender.com/api/cases/${id}/documents`);
        setDocuments(res.data);
      } catch (err) {
        alert("Upload failed.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (docId) => {
    if (isResolved) return;
    if (!window.confirm("Remove this document?")) return;
    try {
      await axios.delete(`https://caseroute-backend.onrender.com/api/cases/documents/${docId}`);
      setDocuments(documents.filter(doc => doc.id !== docId));
    } catch (err) {
      alert("Delete failed.");
    }
  };

  if (isLoading) return <div className="p-10 text-center text-gray-400 font-bold uppercase animate-pulse">Synchronizing Vault...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <button onClick={() => router.push("/dashboard/user")} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition uppercase text-xs tracking-widest">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* PROGRESS TIMELINE */}
        <CaseTimeline status={caseDetails?.status} />

        {/* Case Header */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{caseDetails?.title}</h1>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              <Clock size={12} className="text-blue-50" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Ref: {id}</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{caseDetails?.description}</p>
        </div>

        {/* SECURE DOCUMENT VAULT */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-slate-900 p-6 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600/20 p-3 rounded-xl">
                <Shield size={24} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Secure Document Vault</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                  {isResolved ? "Archived - Read Only Access" : "End-to-End Encrypted Storage"}
                </p>
              </div>
            </div>

            <label className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
              isResolved 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700" 
                : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-900/20"
            }`}>
              {isResolved ? (
                <>
                  <Lock size={16} />
                  File Locked
                </>
              ) : (
                <>
                  {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {isUploading ? "Uploading..." : "Add Evidence"}
                  <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading || isResolved} />
                </>
              )}
            </label>
          </div>

          <div className="p-6">
            {documents.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-50 rounded-2xl">
                <File className="mx-auto text-gray-100 mb-4" size={64} />
                <p className="text-gray-300 text-xs font-bold uppercase tracking-widest">No documents in vault</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <File className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800">{doc.fileName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                          {new Date(doc.createdAt).toLocaleDateString()} • {doc.fileType.split('/')[1] || 'binary'}
                        </p>
                      </div>
                    </div>
                    {!isResolved && (
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}