"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import axios from "axios";
import { 
  File, Upload, Download, Trash2, ArrowLeft, 
  Shield, Loader2, CheckCircle2, Clock 
} from "lucide-react";

// NEW: Timeline Component for Visual Progress
function CaseTimeline({ status, hasDocs }) {
  const steps = [
    { label: "Submitted", active: true },
    { label: "Processing", active: true },
    { label: "Lawyer Assigned", active: status === "ASSIGNED" },
    { label: "Evidence Ready", active: hasDocs },
    { label: "Active Chat", active: status === "ASSIGNED" }
  ];

  const currentStepIndex = steps.reduce((acc, step, idx) => step.active ? idx : acc, 0);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 z-0"></div>
        {/* Progress Line */}
        <div 
          className="absolute top-4 left-0 h-0.5 bg-blue-600 z-0 transition-all duration-700"
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-500 ${
              index <= currentStepIndex ? "bg-blue-600 text-white" : "bg-white text-gray-300 border-2 border-gray-100"
            }`}>
              {index < currentStepIndex ? <CheckCircle2 size={18} /> : <span className="text-xs font-bold">{index + 1}</span>}
            </div>
            <span className={`text-[10px] mt-3 font-black uppercase tracking-tighter ${
              index <= currentStepIndex ? "text-blue-600" : "text-gray-300"
            }`}>
              {step.label}
            </span>
          </div>
        ))}
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
        alert("Upload failed. Ensure backend limit is 50mb.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (docId) => {
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
        <CaseTimeline status={caseDetails?.status} hasDocs={documents.length > 0} />

        {/* Case Header */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{caseDetails?.title}</h1>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
              <Clock size={12} className="text-blue-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase">Ref: {id}</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">{caseDetails?.description}</p>
        </div>

        {/* SECURE DOCUMENT VAULT */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-900 text-white">
            <div className="flex items-center gap-3">
              <Shield className="text-blue-400" size={24} />
              <div>
                <h2 className="text-lg font-black tracking-tight">Secure Document Vault</h2>
                <p className="text-[10px] text-slate-500 uppercase font-bold">End-to-End Encrypted Storage</p>
              </div>
            </div>
            <label className={`flex items-center gap-2 px-5 py-2.5 bg-blue-600 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-blue-500 transition shadow-lg shadow-blue-900/20 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
              {isUploading ? <Loader2 className="animate-spin" size={14} /> : <Upload size={14} />}
              {isUploading ? "Uploading..." : "Add Evidence"}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
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
                  <div key={doc.id} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300">
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
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
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