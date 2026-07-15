"use client";

import React, { useState } from "react";
import { useCRM, CRMClient, CRMFile } from "./CRMProvider";
import { Folder, FolderOpen, FileText, Download, Plus, Search, ChevronRight } from "lucide-react";

export default function FilesView() {
  const { clients, addFile } = useCRM();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  
  // Folder upload form states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [targetClientId, setTargetClientId] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileCategory, setFileCategory] = useState<CRMFile["category"]>("Brand Assets");

  const folders: CRMFile["category"][] = [
    "Logo",
    "Brand Assets",
    "Images",
    "Proposal",
    "Agreement",
    "Invoices",
    "Source Files",
    "Credentials",
  ];

  // Map all files from all clients
  interface ExtendedFile extends CRMFile {
    clientCompany: string;
    clientId: string;
  }

  const allFiles: ExtendedFile[] = [];
  clients.forEach((c) => {
    if (c.files) {
      c.files.forEach((f) => {
        allFiles.push({
          ...f,
          clientId: c._id,
          clientCompany: c.company,
        });
      });
    }
  });

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientId || !fileName) return;

    await addFile(targetClientId, {
      name: fileName,
      category: fileCategory,
      size: fileSize || "1.5 MB",
      url: "#",
      uploadedAt: new Date().toISOString().split("T")[0]
    });

    setFileName("");
    setFileSize("");
    setShowUploadModal(false);
  };

  const getFolderCount = (cat: CRMFile["category"]) => {
    return allFiles.filter(f => f.category === cat).length;
  };

  const renderFoldersGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
      {folders.map((folder) => {
        const count = getFolderCount(folder);
        return (
          <div
            key={folder}
            onClick={() => setSelectedFolder(folder)}
            className="bg-white border border-[#E9E3DA] p-5 rounded-[24px] hover:border-[#111111] transition-all cursor-pointer shadow-sm group flex flex-col justify-between h-36"
          >
            <div className="p-2.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl self-start text-[#6A6A6A] group-hover:text-emerald-600 transition-colors">
              <Folder size={20} />
            </div>
            <div>
              <h3 className="text-[13.5px] font-extrabold text-[#111111] truncate">{folder}</h3>
              <span className="text-[11px] text-[#A8A296] font-semibold mt-1 block">{count} Files</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderFilesList = (folderCat: string) => {
    const files = allFiles.filter(f => f.category === folderCat);
    return (
      <div className="flex flex-col gap-6">
        {/* Breadcrumb back */}
        <div className="flex items-center gap-1.5 text-[12.5px] font-semibold">
          <button 
            onClick={() => setSelectedFolder(null)}
            className="text-[#6A6A6A] hover:text-[#111111] transition-colors"
          >
            Vault Folder View
          </button>
          <ChevronRight size={12} className="text-[#A8A296]" />
          <span className="text-[#111111] font-bold">{folderCat}</span>
        </div>

        {/* List table */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#E9E3DA] bg-[#FCFBF8] text-[#6A6A6A] font-bold font-mono text-[10px] uppercase tracking-wider">
                <th className="p-4 pl-6">Document Name</th>
                <th className="p-4">Client / Company</th>
                <th className="p-4">Uploaded Date</th>
                <th className="p-4">Size</th>
                <th className="p-4 pr-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file._id} className="border-b border-[#E9E3DA] last:border-0 hover:bg-[#FCFBF8]/40 transition-colors">
                  <td className="p-4 pl-6 font-semibold text-[#111111] flex items-center gap-2">
                    <FileText size={14} className="text-[#6A6A6A]" />
                    <span>{file.name}</span>
                  </td>
                  <td className="p-4 text-[#6A6A6A] font-medium">{file.clientCompany}</td>
                  <td className="p-4 font-mono text-[#6A6A6A] text-[11.5px]">{file.uploadedAt}</td>
                  <td className="p-4 text-[#111111] font-medium">{file.size}</td>
                  <td className="p-4 pr-6 text-center">
                    <a 
                      href={file.url} 
                      className="p-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#111111] text-[#6A6A6A] hover:text-[#111111] transition-all inline-block"
                      title="Download File"
                    >
                      <Download size={13} />
                    </a>
                  </td>
                </tr>
              ))}
              {files.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#A8A296] italic">
                    No files uploaded in this folder category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-10 select-none">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">Files Vault</h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Browse and organize digital agency assets, agreements, and developer details.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold transition-all shadow-sm hover:bg-[#222222] cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>Upload File</span>
        </button>
      </div>

      {/* Folders grid or list */}
      {selectedFolder ? renderFilesList(selectedFolder) : renderFoldersGrid()}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-[16px] font-bold text-[#111111] mb-4">Upload File</h3>
            <form onSubmit={handleUploadFile} className="flex flex-col gap-4">
              
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
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">File Category Folder</label>
                <select
                  required
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value as any)}
                  className="px-3 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  {folders.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haramain_Brand_Guide_v2.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">File Size (e.g. 2.4 MB)</label>
                <input
                  type="text"
                  placeholder="e.g. 4.2 MB"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-[13px] font-bold text-[#6A6A6A] hover:text-[#111111] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#111111] text-white text-[13px] font-bold transition-all hover:bg-[#222222]"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
