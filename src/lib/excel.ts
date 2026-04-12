import * as XLSX from "xlsx";
import { Receipt } from "./types";

export function generateExcel(receipts: Receipt[]): ArrayBuffer {
  const wb = XLSX.utils.book_new();

  // Sheet 1: All items detail
  const detailRows = receipts.flatMap((receipt) =>
    receipt.items.map((item) => ({
      "Store": receipt.storeName,
      "Receipt Date": receipt.receiptDate,
      "Item": item.name,
      "Quantity": item.quantity,
      "Unit Price": item.unitPrice,
      "Subtotal": item.subtotal,
    }))
  );

  if (detailRows.length > 0) {
    const detailSheet = XLSX.utils.json_to_sheet(detailRows);
    // Set column widths
    detailSheet["!cols"] = [
      { wch: 20 }, // Store
      { wch: 12 }, // Date
      { wch: 25 }, // Item
      { wch: 10 }, // Quantity
      { wch: 12 }, // Unit Price
      { wch: 12 }, // Subtotal
    ];
    XLSX.utils.book_append_sheet(wb, detailSheet, "Item Details");
  }

  // Sheet 2: Receipt summary
  const summaryRows = receipts.map((receipt) => ({
    "Store": receipt.storeName,
    "Date": receipt.receiptDate,
    "Items Count": receipt.items.length,
    "Subtotal": receipt.subtotal,
    "Tax": receipt.tax,
    "Total": receipt.total,
    "Payment": receipt.paymentMethod,
    "Upload Date": receipt.uploadDate,
  }));

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet["!cols"] = [
    { wch: 20 }, // Store
    { wch: 12 }, // Date
    { wch: 12 }, // Items Count
    { wch: 12 }, // Subtotal
    { wch: 10 }, // Tax
    { wch: 12 }, // Total
    { wch: 15 }, // Payment
    { wch: 12 }, // Upload Date
  ];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
  return buffer as ArrayBuffer;
}
