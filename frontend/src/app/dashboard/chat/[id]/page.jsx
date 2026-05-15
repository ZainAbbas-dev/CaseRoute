"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import io from "socket.io-client";
import axios from "axios";
import moment from "moment";
import { Send, ArrowLeft, Loader2 } from "lucide-react";

// Maintain a single socket instance
let socket;

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // 1. Initialize Socket Connection to Live Backend
    socket = io("https://caseroute-backend.onrender.com", {
      transports: ["websocket"], // Forces WebSocket for better stability on Render
    });

    // 2. Fetch History & Case Info
    const fetchData = async () => {
      try {
        const caseRes = await axios.get(`https://caseroute-backend.onrender.com/api/cases/single/${id}`);
        setCaseTitle(caseRes.data.title);

        const msgRes = await axios.get(`https://caseroute-backend.onrender.com/api/messages/${id}`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error("Chat loading error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 3. Join the specific case room
    socket.emit("join_case_room", id);

    // 4. Listen for real-time incoming messages
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup on unmount
    return () => {
      if (socket) socket.disconnect();
    };
  }, [id, user, router]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      caseId: id,
      senderId: user.id,
      text: newMessage,
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white p-4 border-b border-slate-200 flex items-center gap-4 shadow-sm">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-slate-800 line-clamp-1">{caseTitle || "Case Chat"}</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live Secure Channel</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Loader2 className="animate-spin mb-2" />
            <p className="text-sm">Decrypting messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-40 grayscale">
             <MessageSquare size={48} />
             <p className="mt-2 font-medium">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                msg.senderId === user.id 
                  ? "bg-slate-900 text-white rounded-tr-none" 
                  : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
              }`}>
                <p className={`text-[10px] font-black mb-1 uppercase tracking-widest opacity-60`}>
                  {msg.senderId === user.id ? "You" : msg.sender?.name}
                </p>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className="text-[9px] mt-2 text-right opacity-50 font-bold">
                  {moment(msg.createdAt).format("h:mm A")}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center">
        <input
          type="text"
          placeholder="Write your message..."
          // text-slate-900 added below to ensure dark text visibility
          className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 transition text-slate-900 text-sm"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition shadow-lg active:scale-95">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}