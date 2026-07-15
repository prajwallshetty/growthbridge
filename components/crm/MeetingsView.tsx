"use client";

import React, { useState } from "react";
import { useCRM, CRMClient, CRMMeeting } from "./CRMProvider";
import { Video, Calendar, Plus, Clock, ExternalLink, FileText, CheckCircle2 } from "lucide-react";

export default function MeetingsView() {
  const { clients, addMeeting } = useCRM();
  
  // Scheduler States
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetClientId, setTargetClientId] = useState("");
  const [meetTitle, setMeetTitle] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [meetNotes, setMeetNotes] = useState("");

  interface ExtendedMeeting extends CRMMeeting {
    clientCompany: string;
    clientId: string;
  }

  const allMeetings: ExtendedMeeting[] = [];
  clients.forEach((c) => {
    if (c.meetings) {
      c.meetings.forEach((m) => {
        allMeetings.push({
          ...m,
          clientId: c._id,
          clientCompany: c.company,
        });
      });
    }
  });

  // Sort upcoming first
  const sortedMeetings = [...allMeetings].sort((a, b) => {
    if (a.status === "Upcoming" && b.status === "Completed") return -1;
    if (a.status === "Completed" && b.status === "Upcoming") return 1;
    return b.date.localeCompare(a.date);
  });

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientId || !meetTitle || !meetDate || !meetTime) return;

    await addMeeting(targetClientId, {
      title: meetTitle,
      date: meetDate,
      time: meetTime,
      link: meetLink || "https://meet.google.com/xyz-gb-meet",
      notes: meetNotes || "General sync meeting.",
      actionItems: ["Review deliverables checklist", "Assign team ownership"],
      status: "Upcoming"
    });

    setMeetTitle("");
    setMeetDate("");
    setMeetTime("");
    setMeetLink("");
    setMeetNotes("");
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-10 select-none">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">Meetings Sync</h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Schedule synchronization meetings and trace action points.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold transition-all shadow-sm hover:bg-[#222222] cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Meetings timeline list */}
      <div className="flex flex-col gap-6">
        {sortedMeetings.map((meet) => (
          <div 
            key={meet._id}
            className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 hover:border-[#111111] transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* Left: Timing and title */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl text-[#6A6A6A] shrink-0">
                <Video size={20} />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8A296] font-mono">
                    {meet.clientCompany}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold border ${
                    meet.status === "Upcoming" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-50 text-gray-500 border-gray-150"
                  }`}>
                    {meet.status}
                  </span>
                </div>
                <h3 className="text-[15px] font-extrabold text-[#111111] leading-tight truncate">
                  {meet.title}
                </h3>
                <div className="flex items-center gap-3 text-[11.5px] text-[#6A6A6A] font-semibold mt-1">
                  <span className="flex items-center gap-1"><Calendar size={12} /> {meet.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {meet.time}</span>
                </div>
              </div>
            </div>

            {/* Middle: Notes review */}
            <div className="flex-1 md:max-w-md bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-3.5 text-[12px] leading-relaxed">
              <strong className="block text-[11px] uppercase tracking-wider text-[#6A6A6A] mb-1">Session Notes:</strong>
              <p className="text-[#111111] font-medium line-clamp-2">{meet.notes}</p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <a 
                href={meet.link}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-lg bg-black text-white hover:bg-black/90 font-bold text-[12px] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>Join Google Meet</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}

        {sortedMeetings.length === 0 && (
          <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-[24px] p-12 text-center text-[#6A6A6A]">
            <Video className="mx-auto text-[#6A6A6A]/20 mb-3" size={40} />
            <p className="font-semibold">No syncs scheduled yet.</p>
            <p className="text-[12px] text-[#6A6A6A]/80 mt-1">Setup discovery/development review sessions above.</p>
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-[16px] font-bold text-[#111111] mb-4">Schedule Client Sync</h3>
            <form onSubmit={handleCreateMeeting} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Select Client Context</label>
                <select
                  required
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.company}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Meeting Agenda / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design review checklist sync"
                  value={meetTitle}
                  onChange={(e) => setMeetTitle(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={meetDate}
                    onChange={(e) => setMeetDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                    className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Google Meet Link (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://meet.google.com/xyz-abcd-efg"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Initial Agenda Notes</label>
                <textarea
                  placeholder="e.g. Align on design layout typography adjustments."
                  value={meetNotes}
                  onChange={(e) => setMeetNotes(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111] h-16 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[13px] font-bold text-[#6A6A6A] hover:text-[#111111] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#111111] text-white text-[13px] font-bold transition-all hover:bg-[#222222]"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
