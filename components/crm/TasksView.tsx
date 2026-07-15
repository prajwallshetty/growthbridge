"use client";

import React, { useState } from "react";
import { useCRM, CRMClient, CRMTask } from "./CRMProvider";
import { CheckSquare, List, KanbanSquare, CheckCircle, Clock, AlertCircle, Plus, Filter, Tag } from "lucide-react";

export default function TasksView() {
  const { clients, addTask, toggleTask } = useCRM();
  const [layout, setLayout] = useState<"list" | "board">("list");
  const [filterClient, setFilterClient] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");

  // Local state for task creation form
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetClientId, setTargetClientId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");

  // Gather all tasks along with client context
  interface ExtendedTask extends CRMTask {
    clientName: string;
    clientCompany: string;
    clientId: string;
  }

  const allTasks: ExtendedTask[] = [];
  clients.forEach((client) => {
    if (client.tasks) {
      client.tasks.forEach((t) => {
        allTasks.push({
          ...t,
          clientId: client._id,
          clientName: client.name,
          clientCompany: client.company,
        });
      });
    }
  });

  const filteredTasks = allTasks.filter(task => {
    const matchesClient = filterClient === "All" || task.clientId === filterClient;
    const matchesPriority = filterPriority === "All" || task.priority === filterPriority;
    return matchesClient && matchesPriority;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientId || !taskTitle) return;
    await addTask(targetClientId, {
      title: taskTitle,
      priority: taskPriority,
      assignee: taskAssignee || "Unassigned",
      deadline: taskDeadline || new Date().toISOString().split("T")[0],
      status: "Pending",
      progress: 0,
    });
    setTaskTitle("");
    setTaskAssignee("");
    setTaskDeadline("");
    setShowAddModal(false);
  };

  const getPriorityStyle = (p: CRMTask["priority"]) => {
    if (p === "High") return "bg-red-50 text-red-600 border-red-100";
    if (p === "Medium") return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-emerald-50 text-emerald-600 border-emerald-100";
  };

  const renderListView = () => (
    <div className="bg-white rounded-2xl border border-[#E9E3DA] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[#E9E3DA] bg-[#FCFBF8] text-[#6A6A6A] font-bold font-mono text-[10px] uppercase tracking-wider">
              <th className="p-4 pl-6 w-12 text-center">Status</th>
              <th className="p-4">Task Description</th>
              <th className="p-4">Client / Company</th>
              <th className="p-4">Assignee</th>
              <th className="p-4 text-center">Priority</th>
              <th className="p-4 pr-6">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr 
                key={task._id}
                className="border-b border-[#E9E3DA] last:border-0 hover:bg-[#FCFBF8]/40 transition-colors"
              >
                <td className="p-4 pl-6 text-center">
                  <input 
                    type="checkbox" 
                    checked={task.status === "Completed"}
                    onChange={() => toggleTask(task.clientId, task._id)}
                    className="w-4 h-4 rounded border-[#E9E3DA] accent-[#111111] cursor-pointer"
                  />
                </td>
                <td className="p-4 font-semibold text-[#111111]">
                  <span className={task.status === "Completed" ? "line-through text-[#A8A296]" : ""}>
                    {task.title}
                  </span>
                </td>
                <td className="p-4 text-[#6A6A6A] font-medium">{task.clientCompany}</td>
                <td className="p-4 text-[#111111] font-semibold">{task.assignee}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPriorityStyle(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="p-4 pr-6 font-mono text-[#6A6A6A] text-[11.5px]">{task.deadline}</td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#A8A296] italic">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBoardView = () => {
    const statuses = ["Pending", "In Progress", "Completed"] as const;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map((status) => {
          const statusTasks = filteredTasks.filter((t) => t.status === status);
          return (
            <div key={status} className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#E9E3DA]">
                <h3 className="text-[13px] font-extrabold text-[#111111] uppercase tracking-wider">{status}</h3>
                <span className="bg-white border border-[#E9E3DA] text-[#6A6A6A] font-bold text-[10.5px] px-2 py-0.5 rounded-full">
                  {statusTasks.length}
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
                {statusTasks.map((task) => (
                  <div 
                    key={task._id} 
                    className="bg-white border border-[#E9E3DA] p-4 rounded-xl shadow-sm hover:border-[#111111] transition-all flex flex-col gap-3 cursor-pointer"
                    onClick={() => toggleTask(task.clientId, task._id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[12.5px] font-semibold text-[#111111] leading-snug ${task.status === "Completed" ? "line-through text-[#6A6A6A]" : ""}`}>
                        {task.title}
                      </p>
                      <input 
                        type="checkbox" 
                        checked={task.status === "Completed"}
                        readOnly
                        className="w-3.5 h-3.5 rounded border-[#E9E3DA] accent-[#111111] shrink-0"
                      />
                    </div>
                    <div className="flex justify-between items-center flex-wrap gap-2 text-[10.5px]">
                      <span className="text-[#6A6A6A] font-medium font-mono text-[10px]">{task.clientCompany}</span>
                      <span className={`px-2 py-0.5 rounded font-bold border ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="border-t border-[#FCFBF8] pt-2 mt-1 flex justify-between items-center text-[10.5px] text-[#6A6A6A] font-semibold">
                      <span>Owner: {task.assignee}</span>
                      <span className="font-mono text-[9.5px]">{task.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-10 select-none">
      {/* Title block */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">Tasks Checklist</h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Global action list spanning all active project timelines.
          </p>
        </div>

        {/* View Mode controls & Add Client Task */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-[#E9E3DA] rounded-lg p-1">
            <button 
              onClick={() => setLayout("list")}
              className={`p-1.5 rounded ${layout === "list" ? "bg-[#111111] text-white" : "text-[#6A6A6A] hover:bg-[#FCFBF8]"}`}
            >
              <List size={14} />
            </button>
            <button 
              onClick={() => setLayout("board")}
              className={`p-1.5 rounded ${layout === "board" ? "bg-[#111111] text-white" : "text-[#6A6A6A] hover:bg-[#FCFBF8]"}`}
            >
              <KanbanSquare size={14} />
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold transition-all shadow-sm hover:bg-[#222222] cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filters block */}
      <div className="flex items-center gap-4 flex-wrap bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-3 text-[12px] font-semibold text-[#6A6A6A]">
        <div className="flex items-center gap-2">
          <Filter size={13} />
          <span>Client:</span>
          <select 
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="bg-white border border-[#E9E3DA] rounded-md px-2.5 py-1 text-[#111111] focus:outline-none"
          >
            <option value="All">All Clients</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.company}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Tag size={13} />
          <span>Priority:</span>
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-white border border-[#E9E3DA] rounded-md px-2.5 py-1 text-[#111111] focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Main workspace */}
      {layout === "list" ? renderListView() : renderBoardView()}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-[16px] font-bold text-[#111111] mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              
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
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Task Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design platform typography tokens"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] placeholder-[#6A6A6A]/40 focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="px-3 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Deadline</label>
                  <input
                    type="date"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Team Assignee</label>
                <input
                  type="text"
                  placeholder="e.g. Prajwal Shetty"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
