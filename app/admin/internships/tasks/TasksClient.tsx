"use client";

import React, { useState, useEffect } from "react";
import { getTasksByDomain, createTask, updateTask, deleteTask, reorderTasks } from "@/lib/actions/internship";
import { Plus, Edit2, Trash2, ChevronUp, ChevronDown, CheckSquare, RefreshCw, AlertCircle } from "lucide-react";

interface DomainOption {
  _id: string;
  name: string;
}

interface TaskItem {
  _id: string;
  domainId: string;
  title: string;
  description: string;
  week: number;
  order: number;
}

interface TasksClientProps {
  domains: DomainOption[];
}

export default function TasksClient({ domains }: TasksClientProps) {
  const [selectedDomainId, setSelectedDomainId] = useState(domains[0]?._id || "");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [week, setWeek] = useState(1);
  const [order, setOrder] = useState(0);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  // Action status
  const [isSaving, setIsSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  const loadTasks = async (domainId: string) => {
    if (!domainId) return;
    setIsLoading(true);
    try {
      const list = await getTasksByDomain(domainId);
      setTasks(list);
    } catch (err) {
      console.error(err);
      alert("Failed to load tasks.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(selectedDomainId);
  }, [selectedDomainId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");

    if (!title || !selectedDomainId) {
      setErrorText("Task Title is required.");
      return;
    }

    setIsSaving(true);

    try {
      if (editingId) {
        // Update Action
        await updateTask(editingId, { title, description, week, order });
        setEditingId(null);
      } else {
        // Create Action - assign order as next sequential index
        const nextOrder = tasks.length;
        await createTask({ domainId: selectedDomainId, title, description, week, order: nextOrder });
      }

      // Reset Form
      setTitle("");
      setDescription("");
      setWeek(1);
      setOrder(0);
      
      // Reload tasks
      await loadTasks(selectedDomainId);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Failed to save task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditInit = (task: TaskItem) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description || "");
    setWeek(task.week);
    setOrder(task.order);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setWeek(1);
    setOrder(0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(id);
      await loadTasks(selectedDomainId);
    } catch (err) {
      console.error(err);
      alert("Failed to delete task.");
    }
  };

  const handleMoveTask = async (currentIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= tasks.length) return;

    const newTasks = [...tasks];
    // Swap elements
    const temp = newTasks[currentIndex];
    newTasks[currentIndex] = newTasks[targetIndex];
    newTasks[targetIndex] = temp;

    // Recalculate order indices
    const updatedTasks = newTasks.map((t, idx) => ({
      _id: t._id,
      order: idx,
    }));

    setIsLoading(true);
    try {
      await reorderTasks(updatedTasks);
      // Reload or set locally
      setTasks(newTasks.map((t, idx) => ({ ...t, order: idx })));
    } catch (err) {
      console.error(err);
      alert("Failed to update task order.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT: Task List */}
      <div className="lg:col-span-8 flex flex-col gap-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[22px] font-black tracking-tight text-[#111111]">Task Management</h1>
            <span className="text-[12.5px] text-[#6A6A6A] font-semibold">Organize and order curriculum tasks for each track.</span>
          </div>

          {/* Select Domain Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-bold text-[#6A6A6A] whitespace-nowrap">Domain:</label>
            <select
              value={selectedDomainId}
              onChange={(e) => setSelectedDomainId(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[#E9E3DA] bg-white text-[12.5px] font-bold text-[#111111] focus:outline-none focus:border-[#F4C542]"
            >
              {domains.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white border border-[#E9E3DA] py-20 rounded-2xl text-center text-[#6A6A6A] font-mono flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-[#111111]" />
            <span>Loading task structures...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white border border-[#E9E3DA] p-12 rounded-2xl text-center text-[#A8A296] font-mono">
            No tasks found for this domain. Create one on the right!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tasks.map((task, idx) => (
              <div
                key={task._id}
                className="bg-white border border-[#E9E3DA] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.015)] hover:border-[#D7D0C8] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-mono font-bold text-[#A8A296] uppercase">Wk</span>
                    <span className="text-[14px] font-extrabold text-[#111111] leading-none">{task.week}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-[14.5px] font-extrabold text-[#111111]">{task.title}</h3>
                    <p className="text-[12.5px] text-[#6A6A6A] leading-relaxed max-w-lg font-medium">
                      {task.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 justify-end">
                  {/* Order shift buttons */}
                  <div className="flex flex-col gap-0.5 border-r border-[#E9E3DA] pr-4">
                    <button
                      onClick={() => handleMoveTask(idx, "up")}
                      disabled={idx === 0}
                      className="p-1 rounded text-[#A8A296] hover:text-[#111111] hover:bg-[#FCFBF8] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMoveTask(idx, "down")}
                      disabled={idx === tasks.length - 1}
                      className="p-1 rounded text-[#A8A296] hover:text-[#111111] hover:bg-[#FCFBF8] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditInit(task)}
                      className="p-2 rounded-lg border border-[#E9E3DA] hover:bg-[#FCFBF8] text-[#6A6A6A] hover:text-[#111111] transition-all cursor-pointer"
                      title="Edit Task"
                    >
                      <Edit2 size={13} />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-2 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-all cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Add/Edit Form Panel */}
      <div className="lg:col-span-4 text-left">
        <div className="bg-white border border-[#E9E3DA] p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-6 sticky top-24">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[15px] font-bold text-[#111111]">
              {editingId ? "Modify Task" : "Add Domain Task"}
            </h3>
            <span className="text-[11.5px] text-[#6A6A6A] font-semibold">
              {editingId ? "Edit the task details." : "Create a task for the selected track."}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#111111]">Task Title *</label>
              <input
                type="text"
                required
                placeholder="E.g., Configure Database Schemas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[12.5px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#111111]">Target Week *</label>
              <select
                value={week}
                onChange={(e) => setWeek(parseInt(e.target.value, 10))}
                className="px-3.5 py-2.5 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[12.5px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542]"
              >
                <option value={1}>Week 1 (Setup)</option>
                <option value={2}>Week 2 (Core logic)</option>
                <option value={3}>Week 3 (Integrations)</option>
                <option value={4}>Week 4 (Capstone Submission)</option>
                <option value={5}>Week 5 (Extended Track)</option>
                <option value={6}>Week 6 (Extended Track)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#111111]">Description</label>
              <textarea
                rows={4}
                placeholder="Describe weekly assignment expectations, github push benchmarks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[12.5px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] resize-y"
              />
            </div>

            {errorText && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-500 flex items-center gap-2 text-[11px] font-bold">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E9E3DA]/60">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 rounded-xl border border-[#E9E3DA] hover:bg-[#F3F4F6] text-[12px] font-bold text-[#6A6A6A] text-center transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSaving}
                className="flex-grow py-2.5 rounded-xl bg-[#111111] hover:bg-[#F4C542] hover:text-[#111111] text-white disabled:opacity-50 text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : editingId ? (
                  <span>Update Task</span>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Create Task</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}
