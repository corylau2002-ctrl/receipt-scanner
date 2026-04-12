import { Receipt, ReceiptItem } from "./types";

export function parseReceiptText(ocrText: string): Omit<Receipt, "id" | "uploadDate"> {
  const lines = ocrText.split("\n").map((l) => l.trim()).filter(Boolean);

  // Extract store name (usually the first non-empty line)
  const storeName = lines[0] || "Unknown Store";

  // Try to find a date
  const receiptDate = extractDate(lines) || new Date().toISOString().split("T")[0];

  // Extract items
  const items = extractItems(lines);

  // Extract totals
  const total = extractTotal(lines);
  const tax = extractTax(lines);
  const subtotal = total - tax || items.reduce((sum, item) => sum + item.subtotal, 0);

  // Extract payment method
  const paymentMethod = extractPaymentMethod(lines);

  return {
    storeName,
    receiptDate,
    items,
    subtotal: subtotal || total,
    tax,
    total: total || subtotal,
    paymentMethod,
  };
}

function extractDate(lines: string[]): string | null {
  for (const line of lines) {
    // Match various date formats: YYYY-MM-DD, YYYY/MM/DD, DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY
    const patterns = [
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
      /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2})\b/,
    ];
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) return match[1];
    }
  }
  return null;
}

function extractItems(lines: string[]): ReceiptItem[] {
  const items: ReceiptItem[] = [];

  for (const line of lines) {
    // Pattern: item name followed by quantity and price
    // e.g., "Coffee 2 x $3.50  $7.00" or "Coffee  $3.50" or "Coffee 3.50"
    // or Chinese format: "咖啡 x2 $7.00"

    // Pattern 1: name  qty x price  subtotal
    const match1 = line.match(/^(.+?)\s+(\d+)\s*[xX×]\s*\$?([\d,.]+)\s+\$?([\d,.]+)$/);
    if (match1) {
      items.push({
        name: match1[1].trim(),
        quantity: parseInt(match1[2]),
        unitPrice: parseNumber(match1[3]),
        subtotal: parseNumber(match1[4]),
      });
      continue;
    }

    // Pattern 2: name  qty  price (no x separator)
    const match2 = line.match(/^(.+?)\s+(\d+)\s+\$?([\d,.]+)$/);
    if (match2 && !isKeyword(match2[1])) {
      const qty = parseInt(match2[2]);
      const price = parseNumber(match2[3]);
      items.push({
        name: match2[1].trim(),
        quantity: qty,
        unitPrice: price / qty,
        subtotal: price,
      });
      continue;
    }

    // Pattern 3: name  price (single item)
    const match3 = line.match(/^(.+?)\s+\$?([\d,.]+)$/);
    if (match3 && !isKeyword(match3[1]) && parseNumber(match3[2]) > 0) {
      const name = match3[1].trim();
      // Skip lines that look like totals or tax
      if (!isTotalLine(name)) {
        items.push({
          name,
          quantity: 1,
          unitPrice: parseNumber(match3[2]),
          subtotal: parseNumber(match3[2]),
        });
      }
    }
  }

  return items;
}

function extractTotal(lines: string[]): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].toLowerCase();
    if (line.match(/total|合計|總計|合计|总计|總額|总额/i)) {
      const match = lines[i].match(/\$?([\d,.]+)/);
      if (match) return parseNumber(match[1]);
    }
  }
  return 0;
}

function extractTax(lines: string[]): number {
  for (const line of lines) {
    if (line.match(/tax|稅|税|vat|gst|營業稅|营业税/i)) {
      const match = line.match(/\$?([\d,.]+)/);
      if (match) return parseNumber(match[1]);
    }
  }
  return 0;
}

function extractPaymentMethod(lines: string[]): string {
  const text = lines.join(" ").toLowerCase();
  if (text.match(/visa/i)) return "Visa";
  if (text.match(/master/i)) return "MasterCard";
  if (text.match(/amex|american express/i)) return "Amex";
  if (text.match(/cash|現金|现金/i)) return "Cash";
  if (text.match(/credit|信用卡/i)) return "Credit Card";
  if (text.match(/debit|簽帳/i)) return "Debit Card";
  if (text.match(/line pay/i)) return "Line Pay";
  if (text.match(/apple pay/i)) return "Apple Pay";
  if (text.match(/google pay/i)) return "Google Pay";
  return "Unknown";
}

function parseNumber(str: string): number {
  return parseFloat(str.replace(/,/g, "")) || 0;
}

function isKeyword(str: string): boolean {
  return /^(subtotal|total|tax|change|balance|amount|date|time|order|receipt|invoice|thank|tel|phone|address|no\.|#)/i.test(
    str.trim()
  );
}

function isTotalLine(str: string): boolean {
  return /total|subtotal|tax|change|balance|amount|tip|合計|總計|稅|找零|小計|合计|总计|税|找零|小计/i.test(str);
}
