"use client";

import React, { useState } from "react";
import { useCRM, CRMClient, CRMMessage } from "./CRMProvider";
import { MessageSquare, Send, User } from "lucide-react";

export default function MessagesView() {
  const { clients, addMessage } = useCRM();
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?._id || "");
  const [typedMessage, setTypedMessage] = useState("");

  const activeClient = clients.find((c) => c._id === selectedClientId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !typedMessage.trim()) return;

    await addMessage(selectedClientId, "studio", typedMessage);
    setTypedMessage("");

    // Simulate client reply after 1.5 seconds
    setTimeout(async () => {
      await addMessage(
        selectedClientId,
        "client",
        "Thank you! We received your update. The team will review it shortly."
      );
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 pb-10 select-none h-[calc(100vh-120px)] max-h-[700px]">
      <div>
        <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">Client Messages</h2>
        <p className="text-[13px] text-[#6A6A6A] mt-1">
          Chat directly with client contacts inside their dedicated workspace portals.
        </p>
      </div>

      <div className="flex-1 bg-white border border-[#E9E3DA] rounded-[24px] overflow-hidden shadow-sm flex">
        {/* Left Side: Clients list */}
        <div className="w-64 border-r border-[#E9E3DA] bg-[#FCFBF8] flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-[#E9E3DA] font-mono text-[10px] font-bold uppercase tracking-wider text-[#6A6A6A]">
            Conversations
          </div>
          <div className="flex-1 flex flex-col divide-y divide-[#E9E3DA]/40">
            {clients.map((c) => {
              const lastMsg = c.messages?.[c.messages.length - 1];
              return (
                <button
                  key={c._id}
                  onClick={() => setSelectedClientId(c._id)}
                  className={`w-full text-left p-4 hover:bg-white transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedClientId === c._id ? "bg-white border-l-4 border-emerald-500 font-bold" : ""
                  }`}
                >
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-[12.5px] font-bold text-[#111111] truncate">{c.company}</span>
                    <span className="text-[12px]">{c.countryFlag}</span>
                  </div>
                  <span className="text-[11px] text-[#6A6A6A] truncate">
                    {lastMsg ? `${lastMsg.sender === "studio" ? "You" : c.name.split(" ")[0]}: ${lastMsg.text}` : "No messages yet"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Chat Arena */}
        <div className="flex-1 flex flex-col bg-white">
          {activeClient ? (
            <>
              {/* Active Client Header */}
              <div className="p-4 border-b border-[#E9E3DA] flex items-center justify-between bg-[#FCFBF8]/45">
                <div>
                  <h3 className="text-[13.5px] font-extrabold text-[#111111] leading-tight">{activeClient.company}</h3>
                  <span className="text-[10.5px] text-[#6A6A6A]">Primary Contact: {activeClient.name}</span>
                </div>
                <span className="text-[11px] bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded font-bold uppercase">
                  Online
                </span>
              </div>

              {/* Message History Arena */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#FCFBF8]/15">
                {(activeClient.messages || []).map((msg) => {
                  const isStudio = msg.sender === "studio";
                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col max-w-[70%] gap-1 ${isStudio ? "self-end items-end" : "self-start items-start"}`}
                    >
                      <span className="text-[9.5px] text-[#A8A296] font-bold uppercase font-mono px-1">
                        {isStudio ? "Growth Bridge Studio" : activeClient.name.split(" ")[0]}
                      </span>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-[12.5px] leading-relaxed shadow-sm font-medium ${
                          isStudio
                            ? "bg-[#111111] text-white rounded-tr-none"
                            : "bg-[#FCFBF8] border border-[#E9E3DA] text-[#111111] rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] font-mono text-[#A8A296] mt-0.5 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })}
                {(activeClient.messages || []).length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-[#A8A296] gap-2">
                    <MessageSquare size={36} className="opacity-20" />
                    <span className="italic text-[12px]">Start conversation with {activeClient.company}.</span>
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E9E3DA] flex gap-3 bg-[#FCFBF8]/45">
                <input
                  type="text"
                  placeholder={`Type message to ${activeClient.name.split(" ")[0]}...`}
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-white border border-[#E9E3DA] text-[13px] text-[#111111] placeholder-[#6A6A6A]/60 focus:outline-none focus:border-[#111111] transition-all"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-white transition-all shadow-sm cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[#A8A296] gap-2">
              <MessageSquare size={48} className="opacity-20" />
              <span>Select a client from the left pane to begin chatting.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
