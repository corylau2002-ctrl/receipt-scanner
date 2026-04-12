"use client";

import { ReceiptItem } from "@/lib/types";

interface ReceiptTableProps {
  items: ReceiptItem[];
  onChange: (items: ReceiptItem[]) => void;
}

export default function ReceiptTable({ items, onChange }: ReceiptTableProps) {
  const updateItem = (index: number, field: keyof ReceiptItem, value: string) => {
    const updated = [...items];
    if (field === "name") {
      updated[index] = { ...updated[index], name: value };
    } else {
      const num = parseFloat(value) || 0;
      updated[index] = { ...updated[index], [field]: num };
      // Auto-calculate subtotal
      if (field === "quantity" || field === "unitPrice") {
        updated[index].subtotal =
          (field === "quantity" ? num : updated[index].quantity) *
          (field === "unitPrice" ? num : updated[index].unitPrice);
      }
    }
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, { name: "", quantity: 1, unitPrice: 0, subtotal: 0 }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="px-3 py-2 text-left font-medium">Item Name</th>
            <th className="px-3 py-2 text-right font-medium w-20">Qty</th>
            <th className="px-3 py-2 text-right font-medium w-28">Unit Price</th>
            <th className="px-3 py-2 text-right font-medium w-28">Subtotal</th>
            <th className="px-3 py-2 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-1">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                  className="w-full px-2 py-1 border border-transparent hover:border-gray-300 focus:border-blue-400 rounded outline-none"
                />
              </td>
              <td className="px-3 py-1">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", e.target.value)}
                  className="w-full px-2 py-1 text-right border border-transparent hover:border-gray-300 focus:border-blue-400 rounded outline-none"
                  min="0"
                />
              </td>
              <td className="px-3 py-1">
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                  className="w-full px-2 py-1 text-right border border-transparent hover:border-gray-300 focus:border-blue-400 rounded outline-none"
                  step="0.01"
                  min="0"
                />
              </td>
              <td className="px-3 py-1 text-right font-mono">
                {item.subtotal.toFixed(2)}
              </td>
              <td className="px-3 py-1 text-center">
                <button
                  onClick={() => removeItem(i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none"
                  title="Delete item"
                >
                  &times;
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={addItem}
        className="mt-2 text-sm text-blue-600 hover:text-blue-800 px-3 py-1"
      >
        + Add Item
      </button>
    </div>
  );
}
