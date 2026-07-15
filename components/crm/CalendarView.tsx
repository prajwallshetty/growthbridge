"use client";

import React, { useState } from "react";
import { useCRM } from "./CRMProvider";
import { ChevronLeft, ChevronRight, Video, AlertCircle, CalendarRange } from "lucide-react";

export default function CalendarView() {
  const { clients } = useCRM();
  const [currentDate, setCurrentDate] = useState(new Date("2026-07-12")); // July 2026

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const startDayOffset = (y: number, m: number) => new Date(y, m, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const totalDays = daysInMonth(year, month);
  const firstDayIndex = startDayOffset(year, month);

  const prevMonthDays = month === 0 ? daysInMonth(year - 1, 11) : daysInMonth(year, month - 1);

  const calendarItems: { dateStr: string; title: string; type: "meeting" | "deadline"; company: string }[] = [];

  clients.forEach((c) => {
    calendarItems.push({
      dateStr: c.expectedDelivery,
      title: "Delivery Milestone",
      type: "deadline",
      company: c.company,
    });

    c.meetings.forEach((m) => {
      calendarItems.push({
        dateStr: m.date,
        title: m.title,
        type: "meeting",
        company: c.company,
      });
    });
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const gridCells = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    gridCells.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      dateStr: `${year}-${String(month === 0 ? 12 : month).padStart(2, "0")}-${String(prevMonthDays - i).padStart(2, "0")}`,
    });
  }

  for (let i = 1; i <= totalDays; i++) {
    const formattedDay = String(i).padStart(2, "0");
    const formattedMonth = String(month + 1).padStart(2, "0");
    gridCells.push({
      day: i,
      isCurrentMonth: true,
      dateStr: `${year}-${formattedMonth}-${formattedDay}`,
    });
  }

  const remaining = 42 - gridCells.length;
  for (let i = 1; i <= remaining; i++) {
    gridCells.push({
      day: i,
      isCurrentMonth: false,
      dateStr: `${year}-${String(month === 11 ? 1 : month + 2).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
    });
  }

  return (
    <div className="flex flex-col gap-6 pb-10 select-none">
      {/* Calendar Header controls */}
      <div className="flex items-center justify-between flex-wrap gap-4 shrink-0">
        <div>
          <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight leading-none flex items-center gap-2">
            <CalendarRange size={20} className="text-[#111111]" />
            <span>Operational Calendar</span>
          </h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Studio schedule displaying scheduled sync meetings and delivery dates.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-[#6A6A6A] hover:text-[#111111] hover:bg-white transition-all cursor-pointer border border-transparent hover:border-[#E9E3DA]"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[13px] font-bold text-[#111111] px-2 min-w-[110px] text-center font-mono">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-[#6A6A6A] hover:text-[#111111] hover:bg-white transition-all cursor-pointer border border-transparent hover:border-[#E9E3DA]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid Sheet */}
      <div className="bg-white rounded-2xl border border-[#E9E3DA] overflow-hidden flex flex-col shadow-sm">
        {/* Days labels */}
        <div className="grid grid-cols-7 border-b border-[#E9E3DA] bg-[#FCFBF8] text-center font-mono text-[10.5px] font-bold text-[#6A6A6A] py-3">
          <div>SUN</div>
          <div>MON</div>
          <div>TUE</div>
          <div>WED</div>
          <div>THU</div>
          <div>FRI</div>
          <div>SAT</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 grid-rows-6 h-[480px]">
          {gridCells.map((cell, idx) => {
            const dayItems = calendarItems.filter((item) => item.dateStr === cell.dateStr);

            return (
              <div
                key={idx}
                className={`border-r border-b border-[#E9E3DA] p-2 flex flex-col justify-between overflow-hidden last:border-r-0 transition-colors ${
                  cell.isCurrentMonth ? "bg-transparent" : "bg-[#FCFBF8]/20 opacity-35"
                } ${cell.dateStr === "2026-07-12" ? "bg-[#FCFBF8]" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[12px] font-bold ${
                    cell.dateStr === "2026-07-12" ? "text-red-500 font-extrabold" : "text-[#6A6A6A]"
                  }`}>
                    {cell.day}
                  </span>
                  {cell.dateStr === "2026-07-12" && (
                    <span className="text-[9px] bg-[#111111] text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider font-mono">
                      Today
                    </span>
                  )}
                </div>

                {/* Items box */}
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[55px] scrollbar-none mt-2">
                  {dayItems.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={`text-[9.5px] p-1 rounded font-bold truncate leading-tight flex items-center gap-1 border ${
                        item.type === "meeting"
                          ? "bg-blue-50 text-blue-600 border-blue-100" // Green/Blue statuses
                          : "bg-amber-50 text-amber-600 border-amber-100" // Yellow warning statuses
                      }`}
                      title={`${item.company}: ${item.title}`}
                    >
                      {item.type === "meeting" ? <Video size={9} /> : <AlertCircle size={9} />}
                      <span className="font-extrabold shrink-0">{item.company.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
