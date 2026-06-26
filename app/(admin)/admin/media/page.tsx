"use client";

import React, { useState, useEffect } from "react";
import { Upload, Trash2, Copy, Check, FileImage, Loader2 } from "lucide-react";

interface MediaItem {
  _id: string;
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  altText?: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [altText, setAltText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch all media items
  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.data) {
        setItems(data.data);
      }
    } catch (err) {
      console.error("Failed to load media items:", err);
      setError("Could not load media items.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Handle upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("alt", altText);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        setSuccess(`Uploaded "${file.name}" successfully.`);
        setAltText("");
        // Reload items list
        fetchMedia();
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong during upload");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, publicId: string) => {
    if (!confirm("Are you sure you want to permanently delete this media asset?")) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/media?id=${id}&publicId=${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSuccess("Asset deleted successfully.");
        fetchMedia();
      } else {
        const result = await res.json();
        setError(result.error || "Delete failed");
      }
    } catch (err: any) {
      setError(err?.message || "Could not delete asset");
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-[28px] font-extrabold tracking-tight">Media Library</h2>
        <p className="text-[14px] text-[#6A6A6A] mt-1">Upload and manage images, mockups, and files hosted on Cloudinary.</p>
      </div>

      {/* Notifications */}
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

      {/* Upload Zone & Alt Form */}
      <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 flex flex-col gap-4 w-full">
          <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
            Asset Alternative Text (Alt Text)
          </label>
          <input
            type="text"
            placeholder="Describe the image context (highly recommended for SEO accessibility)..."
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
          />
          <p className="text-[11px] text-[#A8A296] font-medium">
            Setting the alt text before uploading will save it to the database record.
          </p>
        </div>

        <div className="w-full md:w-auto shrink-0 self-stretch flex items-end">
          <label className="w-full md:w-[260px] h-32 border-2 border-dashed border-[#E9E3DA] hover:border-[#111111] rounded-[20px] bg-[#FCFBF8] flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
            {isUploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-[#6A6A6A]" />
                <span className="text-[13px] font-bold text-[#6A6A6A]">Uploading to Cloudinary...</span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-[#6A6A6A]" />
                <span className="text-[13px] font-bold text-[#111111]">Choose File / Upload</span>
                <span className="text-[11px] text-[#A8A296] font-medium">PNG, JPG, WebP up to 10MB</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Grid Library List */}
      <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h3 className="text-[16px] font-bold tracking-tight mb-6 pb-4 border-b border-[#E9E3DA]">Uploaded Assets ({items.length})</h3>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
            <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading media library...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#E9E3DA] rounded-[20px] bg-[#FCFBF8] text-center">
            <FileImage className="h-10 w-10 text-[#A8A296] mb-3" />
            <p className="text-[14px] font-bold text-[#111111]">No files in your library yet</p>
            <p className="text-[12px] text-[#6A6A6A] mt-1 max-w-[280px]">
              Use the upload area above to send your first image asset to Cloudinary.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item._id}
                className="group relative border border-[#E9E3DA] hover:border-[#111111] rounded-[16px] overflow-hidden bg-[#FCFBF8] flex flex-col transition-all"
              >
                {/* Image Box */}
                <div className="aspect-[4/3] w-full bg-[#E9E3DA] relative overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.altText || item.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                    <button
                      onClick={() => copyToClipboard(item.url, item._id)}
                      className="p-2.5 bg-white border border-[#E9E3DA] rounded-[10px] text-[#111111] hover:scale-110 transition-all cursor-pointer shadow-md"
                      title="Copy asset URL"
                    >
                      {copiedId === item._id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id, item.publicId)}
                      className="p-2.5 bg-white border border-[#E9E3DA] rounded-[10px] text-red-600 hover:scale-110 transition-all cursor-pointer shadow-md"
                      title="Delete asset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-4 flex flex-col gap-1 text-[12px] flex-1">
                  <span className="font-bold text-[#111111] truncate" title={item.fileName}>
                    {item.fileName}
                  </span>
                  <div className="flex justify-between items-center text-[#6A6A6A]">
                    <span>{formatBytes(item.fileSize)}</span>
                    <span className="font-mono text-[10px] bg-[#E9E3DA]/40 px-2 py-0.5 rounded-[4px]">
                      {item.mimeType.split("/")[1]?.toUpperCase() || "IMG"}
                    </span>
                  </div>
                  {item.altText && (
                    <span className="text-[#A8A296] italic truncate mt-1 border-t border-[#E9E3DA]/40 pt-1">
                      Alt: {item.altText}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
