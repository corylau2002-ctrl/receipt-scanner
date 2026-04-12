"use client";

import { useState, useEffect, useCallback } from "react";
import { Receipt } from "@/lib/types";
import UploadZone from "@/components/UploadZone";
import ReceiptCard from "@/components/ReceiptCard";
import ExportButton from "@/components/ExportButton";

const STORAGE_KEY = "receipt-scanner-data";

function loadReceipts(): Receipt[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveReceipts(receipts: Receipt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
}

export default function Home() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setReceipts(loadReceipts());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveReceipts(receipts);
  }, [receipts, mounted]);

  const handleScan = useCallback(async (base64Image: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to scan receipt");
      }

      setReceipts((prev) => [data.receipt, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan receipt");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateReceipt = (updated: Receipt) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };

  const deleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to delete all receipts?")) {
      setReceipts([]);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 flex-1">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Receipt Scanner</h1>
        <p className="text-gray-500 mt-2">
          Upload receipt images to extract data and export to Excel
        </p>
      </div>

      {/* Upload */}
      <div className="mb-8">
        <UploadZone onScan={handleScan} isLoading={isLoading} />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <strong>Error:</strong> {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-400 hover:text-red-600"
          >
            &times;
          </button>
        </div>
      )}

      {/* Actions */}
      {mounted && receipts.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <ExportButton receipts={receipts} />
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Receipt list */}
      <div className="space-y-4">
        {mounted &&
          receipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onUpdate={updateReceipt}
              onDelete={deleteReceipt}
            />
          ))}
      </div>

      {mounted && receipts.length === 0 && !isLoading && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No receipts yet</p>
          <p className="text-sm mt-1">Upload a receipt image to get started</p>
        </div>
      )}
    </main>
  );
}
