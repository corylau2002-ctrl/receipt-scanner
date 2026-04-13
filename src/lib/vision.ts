import { Receipt } from "./types";

export async function analyzeReceiptWithGemini(
  base64Image: string
): Promise<Omit<Receipt, "id" | "uploadDate">> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  // Remove data URL prefix and extract mime type
  const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const imageContent = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `Analyze this receipt image and extract the following information in JSON format.
Return ONLY valid JSON, no markdown code blocks, no extra text.

{
  "storeName": "store/restaurant name",
  "receiptDate": "YYYY-MM-DD format",
  "items": [
    {
      "name": "item name",
      "quantity": 1,
      "unitPrice": 0.00,
      "subtotal": 0.00
    }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "total": 0.00,
  "paymentMethod": "Cash/Credit Card/etc"
}

Rules:
- If you can't determine a value, use reasonable defaults
- Prices should be numbers, not strings
- Date should be in YYYY-MM-DD format. If unclear, use today's date
- Include ALL line items you can identify
- subtotal for each item = quantity * unitPrice`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: imageContent,
                },
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from Gemini");
  }

  // Clean up response - remove markdown code blocks if present
  const cleaned = text
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      storeName: parsed.storeName || "Unknown Store",
      receiptDate:
        parsed.receiptDate || new Date().toISOString().split("T")[0],
      items: (parsed.items || []).map(
        (item: { name?: string; quantity?: number; unitPrice?: number; subtotal?: number }) => ({
          name: item.name || "",
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          subtotal: item.subtotal || 0,
        })
      ),
      subtotal: parsed.subtotal || 0,
      tax: parsed.tax || 0,
      total: parsed.total || 0,
      paymentMethod: parsed.paymentMethod || "Unknown",
    };
  } catch {
    throw new Error("Failed to parse Gemini response as JSON");
  }
}
