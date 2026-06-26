"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getUsers, saveUser, deleteUser } from "@/lib/actions/users";
import { getSessionUser } from "@/lib/actions/cms";
import { Loader2, Plus, Edit2, Trash2, Shield, User as UserIcon, X, Check } from "lucide-react";

export default function UsersCmsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Editor",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load active session user and user lists
  useEffect(() => {
    async function loadData() {
      try {
        const sess = await getSessionUser();
        setSessionUser(sess);

        if (sess && (sess.role === "Super Admin" || sess.role === "Admin")) {
          const list = await getUsers();
          setUsers(list);
        }
      } catch (err) {
        setError("Failed to load users list.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "Editor",
      password: "",
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "", // Optional password on edit
    });
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await deleteUser(id);
        const list = await getUsers();
        setUsers(list);
        setSuccess("User account deleted successfully.");
      } catch (err: any) {
        setError(err?.message || "Failed to delete user.");
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const payload: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        };

        if (editingUser) {
          payload._id = editingUser._id;
        }

        await saveUser(payload);
        const list = await getUsers();
        setUsers(list);
        
        setSuccess(editingUser ? "User details updated successfully." : "New user created successfully.");
        setIsModalOpen(false);
      } catch (err: any) {
        setError(err?.message || "Failed to save user details.");
      }
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-[#F4C542]/20 border-[#F4C542]/40 text-[#b5870b]";
      case "Admin":
        return "bg-[#111111]/10 border-[#111111]/25 text-[#111111]";
      case "Editor":
        return "bg-sky-50 border-sky-100 text-sky-700";
      case "User":
      default:
        return "bg-gray-100 border-gray-200 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Validating session...</span>
      </div>
    );
  }

  // Access control
  if (!sessionUser || (sessionUser.role !== "Super Admin" && sessionUser.role !== "Admin")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 max-w-[500px] mx-auto text-center">
        <div className="h-14 w-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
          <Shield size={24} />
        </div>
        <h2 className="text-[20px] font-bold text-[#111111]">Access Restricted</h2>
        <p className="text-[14px] text-[#6A6A6A] leading-[1.6]">
          You do not have administrative privileges to manage user accounts. Only Super Admins and Admins can view or edit this screen.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight">Users & Admins</h2>
          <p className="text-[14px] text-[#6A6A6A] mt-1">Manage platform administrators, editors, and client roles.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer select-none shrink-0"
        >
          <Plus size={16} />
          Create New Account
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] text-[13px] font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-[12px] text-[13px] font-semibold">
          {success}
        </div>
      )}

      {/* Users table */}
      <div className="bg-white border border-[#E9E3DA] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9E3DA] bg-[#FCFBF8]">
                <th className="p-5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">User Info</th>
                <th className="p-5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">Email Address</th>
                <th className="p-5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">Access Role</th>
                <th className="p-5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">Created Date</th>
                <th className="p-5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-[#A8A296] text-[13px] font-medium">
                    No users seeded in database.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user._id.toString()} className="border-b border-[#E9E3DA] hover:bg-[#FCFBF8]/30 transition-all">
                    <td className="p-5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center text-[#111111] font-bold text-[14px]">
                        {user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-[#111111]">{user.name}</span>
                        {sessionUser.userId === user._id.toString() && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 w-fit mt-0.5">
                            You (Active)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 text-[14px] font-medium text-[#6A6A6A]">
                      {user.email}
                    </td>
                    <td className="p-5">
                      <span className={`text-[11px] font-bold uppercase tracking-[0.06em] border rounded-full px-3 py-1 ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-5 text-[13px] font-semibold text-[#A8A296]">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-2 border border-[#E9E3DA] hover:border-[#111111] rounded-[8px] text-[#6A6A6A] hover:text-[#111111] transition-all cursor-pointer"
                          title="Edit Account Details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id.toString())}
                          disabled={isPending || sessionUser.userId === user._id.toString()}
                          className="p-2 border border-[#E9E3DA] hover:border-red-600 rounded-[8px] text-[#6A6A6A] hover:text-red-600 disabled:opacity-30 disabled:hover:border-[#E9E3DA] disabled:hover:text-[#6A6A6A] transition-all cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#111111]/40 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E9E3DA] w-full max-w-[500px] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E9E3DA] flex items-center justify-between bg-[#FCFBF8]">
              <h3 className="text-[18px] font-extrabold tracking-tight">
                {editingUser ? "Edit Account Details" : "Create New User Account"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#6A6A6A] hover:text-[#111111] transition-colors rounded-full hover:bg-[#111111]/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex flex-col gap-5 p-6 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. jdoe@growthbridge.studio"
                  className="w-full h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                  Access Level / Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor (User CMS Manager)</option>
                  <option value="User">User (Standard Reader)</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                    Password
                  </label>
                  {editingUser && (
                    <span className="text-[10px] font-semibold text-[#A8A296]">
                      Leave empty to retain existing
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingUser ? "••••••••" : "Provide a secure login password"}
                  className="w-full h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-5 border border-[#E9E3DA] hover:border-[#111111] hover:bg-[#111111]/5 rounded-[12px] text-[#6A6A6A] hover:text-[#111111] text-[13px] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 h-11 px-6 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving User...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
