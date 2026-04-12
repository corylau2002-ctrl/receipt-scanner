"use client";

import { useState } from "react";
import { Receipt, ReceiptItem } from "@/lib/types";
import ReceiptTable from "./ReceiptTable";

interface ReceiptCardProps {
  receipt: Receipt;
  onUpdate: (receipt: Receipt) => void;
  onDelete: (id: string) => void;
}

export default function ReceiptCard({ receipt, onUpdate, onDelete }: ReceiptCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateField = (field: keyof Receipt, value: string | number) => {
    onUpdate({ ...receipt, [field]: value });
  };

  const updateItems = (items: ReceiptItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    onUpdate({
      ...receipt,
      items,
      subtotal,
      total: subtotal + receipt.tax,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{isExpanded ? "\u25BC" : "\u25B6"}</span>
          <div>
            <h3 className="font-semibold text-gray-800">{receipt.storeName || "Unknown Store"}</h3>
            <p className="text-sm text-gray-500">{receipt.receiptDate} &middot; {receipt.items.length} items</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-bold text-gray-800">${receipt.total.toFixed(2)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(receipt.id); }}
            className="text-red-400 hover:text-red-600 px-2 py-1 rounded"
            title="Delete receipt"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Receipt info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Store Name</label>
              <input
                type="text"
                value={receipt.storeName}
                onChange={(e) => updateField("storeName", e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg text-sm focus:border-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <input
                type="text"
                value={receipt.receiptDate}
                onChange={(e) => updateField("receiptDate", e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg text-sm focus:border-blue-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
              <input
                type="text"
                value={receipt.paymentMethod}
                onChange={(e) => updateField("paymentMethod", e.target.value)}
                className="w-full px-3 py-1.5 border rounded-lg text-sm focus:border-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Items table */}
          <ReceiptTable items={receipt.items} onChange={updateItems} />

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${receipt.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <input
                  type="number"
                  value={receipt.tax}
                  onChange={(e) => {
                    const tax = parseFloat(e.target.value) || 0;
                    onUpdate({ ...receipt, tax, total: receipt.subtotal + tax });
                  }}
                  className="w-24 text-right px-2 py-0.5 border rounded outline-none focus:border-blue-400"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-1">
                <span>Total</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
