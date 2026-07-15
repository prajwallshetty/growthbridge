"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCRM } from "./CRMProvider";
import { X, Sparkles, Send, Copy, Check, FileText, FileCheck, CheckSquare, RefreshCw } from "lucide-react";
import { generateAIDocument } from "@/lib/actions/crm";

export default function AIAssistantWidget() {
  const { aiActive, setAiActive, clients, activeClientId } = useCRM();
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Hello! I am Growth Bridge CRM AI. Select a suggested automation chip below or type a query using this client's context." }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeClient = clients.find((c) => c._id === activeClientId || c.id === activeClientId) || clients[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  if (!aiActive) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const prompt = customPrompt || inputVal;
    if (!prompt.trim() || generating) return;

    if (!customPrompt) setInputVal("");
    setMessages((prev) => [...prev, { sender: "user", text: prompt }]);
    setGenerating(true);

    try {
      if (!activeClient) {
        setMessages((prev) => [...prev, { sender: "ai", text: "Please select or verify client context in CRM first." }]);
        setGenerating(false);
        return;
      }

      const lower = prompt.toLowerCase();
      let docType = "general";
      if (lower.includes("proposal")) docType = "proposal";
      else if (lower.includes("agreement")) docType = "agreement";
      else if (lower.includes("tasks") || lower.includes("checklist")) docType = "tasks";
      else if (lower.includes("summary") || lower.includes("meeting")) docType = "meeting summary";
      else if (lower.includes("invoice")) docType = "invoice";
      else if (lower.includes("email")) docType = "email reply";
      else if (lower.includes("whatsapp")) docType = "whatsapp reply";
      else if (lower.includes("seo")) docType = "seo suggestions";

      // Call Gemini server action
      const aiResponse = await generateAIDocument(activeClient._id, docType, prompt);

      setMessages((prev) => [...prev, { sender: "ai", text: aiResponse }]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [...prev, { sender: "ai", text: `AI Pipeline error: ${error?.message || "Verify your backend server connectivity"}` }]);
    } finally {
      setGenerating(false);
    }
  };

  const actionChips = [
    { label: "Generate Proposal", icon: <FileText size={12} />, prompt: "Generate a custom client project proposal" },
    { label: "Generate Agreement", icon: <FileCheck size={12} />, prompt: "Draft a Master Services Agreement contract template" },
    { label: "Generate Tasks", icon: <CheckSquare size={12} />, prompt: "Create a list of checklist tasks" },
    { label: "Meeting Summary", icon: <Sparkles size={12} />, prompt: "Generate a meeting summary notes template" },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-[#E9E3DA] flex flex-col h-screen select-none z-50 shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-[#E9E3DA] flex items-center justify-between bg-[#FCFBF8]">
        <div className="flex items-center gap-2 text-[#111111] font-bold">
          <Sparkles size={15} />
          <span className="text-[13.5px] font-extrabold text-[#111111]">CRM AI Assistant</span>
        </div>
        <button
          onClick={() => setAiActive(false)}
          className="p-1.5 rounded-lg text-[#6A6A6A] hover:text-[#111111] hover:bg-[#FCFBF8] transition-colors cursor-pointer border border-transparent hover:border-[#E9E3DA]"
        >
          <X size={14} />
        </button>
      </div>

      {/* Selected client status indicator info */}
      <div className="bg-[#FCFBF8] px-4 py-2.5 border-b border-[#E9E3DA] text-[11px] text-[#6A6A6A] flex items-center justify-between font-bold">
        <span>Active context: <strong className="text-[#111111]">{activeClient?.company || "Growth Bridge"}</strong></span>
        {activeClient && <span className="font-mono text-[10px]">₹{(activeClient.budget / 100000).toFixed(1)}L</span>}
      </div>

      {/* Chat scroll workspace */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-none bg-[#FCFBF8]/20">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <div className={`p-3 rounded-2xl text-[12px] leading-relaxed relative group/msg border ${
              msg.sender === "user"
                ? "bg-[#111111] text-white border-[#111111] font-semibold rounded-tr-none"
                : "bg-white text-[#111111] border-[#E9E3DA] rounded-tl-none font-medium shadow-sm"
            }`}>
              <div className="whitespace-pre-line">{msg.text}</div>

              {msg.sender === "ai" && (
                <button
                  onClick={() => handleCopy(msg.text)}
                  className="absolute right-2 bottom-2 p-1.5 rounded bg-[#FCFBF8] border border-[#E9E3DA] opacity-0 group-hover/msg:opacity-100 transition-opacity text-[#6A6A6A] hover:text-[#111111]"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                </button>
              )}
            </div>
          </div>
        ))}

        {generating && (
          <div className="flex items-center gap-2 text-[#6A6A6A] text-[11px] font-mono italic">
            <RefreshCw size={12} className="animate-spin" />
            <span>AI model thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Prompt suggestions action chips */}
      <div className="px-4 py-3 bg-[#FCFBF8] border-t border-[#E9E3DA] shrink-0">
        <span className="text-[9.5px] font-bold text-[#6A6A6A] block mb-2 uppercase tracking-wider font-mono">
          Suggested Automations
        </span>
        <div className="grid grid-cols-2 gap-2">
          {actionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.prompt)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#111111] bg-white text-[10.5px] text-[#6A6A6A] hover:text-[#111111] font-bold transition-all text-left cursor-pointer truncate"
            >
              {chip.icon}
              <span className="truncate">{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Message send form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-[#E9E3DA] bg-white flex gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask AI assistant..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 px-3.5 py-2 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[12.5px] text-[#111111] focus:outline-none placeholder-[#6A6A6A]"
        />
        <button
          type="submit"
          className="p-2.5 rounded-xl bg-[#111111] hover:bg-[#222222] text-white font-bold transition-all cursor-pointer"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
