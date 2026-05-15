"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";
import io from "socket.io-client";
import axios from "axios";
import moment from "moment";
import { Send, ArrowLeft } from "lucide-react";

let socket;

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [caseTitle, setCaseTitle] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // 1. Initialize Socket Connection
    socket = io("https://caseroute-backend.onrender.com");

    // 2. Fetch History & Case Info
    const fetchData = async () => {
      try {
        const caseRes = await axios.get(`https://caseroute-backend.onrender.com/api/cases/single/${id}`);
        setCaseTitle(caseRes.data.title);

        const msgRes = await axios.get(`https://caseroute-backend.onrender.com/api/messages/${id}`);
        setMessages(msgRes.data);
      } catch (err) {
        console.error("Chat loading error:", err);
      }
    };

    fetchData();

    // 3. Join the specific case room
    socket.emit("join_case_room", id);

    // 4. Listen for real-time incoming messages
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.disconnect();
  }, [id, user, router]);

  // Auto-scroll to bottom when new messages arrive
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
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white p-4 border-b flex items-center gap-4 shadow-sm">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-gray-800">{caseTitle || "Case Chat"}</h1>
          <p className="text-xs text-blue-600 font-semibold uppercase">{user.role} VIEW</p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
              msg.senderId === user.id 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
            }`}>
              <p className="text-xs font-bold mb-1 opacity-75">
                {msg.senderId === user.id ? "You" : msg.sender?.name}
              </p>
              <p className="text-sm">{msg.text}</p>
              <p className="text-[10px] mt-1 text-right opacity-50">
                {moment(msg.createdAt).format("h:mm a")}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border rounded-full focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}