"use client";

import { Receipt } from "@/lib/types";
import { generateExcel } from "@/lib/excel";

interface ExportButtonProps {
  receipts: Receipt[];
}

export default function ExportButton({ receipts }: ExportButtonProps) {
  const handleExport = () => {
    if (receipts.length === 0) return;

    const data = generateExcel(receipts);
    const blob = new Blob([data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipts_${new Date().toISOString().split("T")[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={receipts.length === 0}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
        ${receipts.length > 0
          ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }
      `}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Export to Excel ({receipts.length} receipt{receipts.length !== 1 ? "s" : ""})
    </button>
  );
}
