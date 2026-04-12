import { NextRequest, NextResponse } from "next/server";
import { analyzeReceiptWithGemini } from "@/lib/vision";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Use Gemini to analyze the receipt image directly
    const receiptData = await analyzeReceiptWithGemini(image);

    return NextResponse.json({
      success: true,
      receipt: {
        ...receiptData,
        id: crypto.randomUUID(),
        uploadDate: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
