"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onScan: (base64: string) => void;
  isLoading: boolean;
}

export default function UploadZone({ onScan, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);
        onScan(base64);
      };
      reader.readAsDataURL(file);
    },
    [onScan]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleClick = () => fileInputRef.current?.click();

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
          ${isLoading ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Analyzing receipt...</p>
          </div>
        ) : preview ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={preview}
              alt="Receipt preview"
              className="max-h-48 rounded-lg shadow"
            />
            <p className="text-sm text-gray-500">Click or drag to upload another receipt</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div>
              <p className="text-lg font-medium text-gray-700">Upload Receipt Image</p>
              <p className="text-sm text-gray-500 mt-1">Drag & drop or click to select</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
        className="hidden"
      />
    </div>
  );
}
