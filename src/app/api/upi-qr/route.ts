import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

/**
 * Generates a UPI QR code for a specific amount (or static pay without amount).
 * GET /api/upi-qr?pa=upiid@bank&pn=PayeeName&am=4999
 * pa = payee address (UPI ID), pn = payee name, am = amount (optional, number)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pa = searchParams.get("pa"); // UPI ID
  const pn = searchParams.get("pn") || "Merchant"; // Payee name
  const amParam = searchParams.get("am"); // Amount (optional)

  if (!pa || !pa.trim()) {
    return NextResponse.json(
      { error: "Missing UPI ID (pa)" },
      { status: 400 }
    );
  }

  const params = new URLSearchParams();
  params.set("pa", pa.trim());
  params.set("pn", pn.trim().slice(0, 50));
  if (amParam != null && amParam !== "") {
    const amount = parseFloat(amParam.replace(/,/g, ""));
    if (!Number.isNaN(amount) && amount > 0) {
      params.set("am", amount.toFixed(2));
    }
  }
  params.set("cu", "INR");

  const upiString = `upi://pay?${params.toString()}`;

  try {
    const pngBuffer = await QRCode.toBuffer(upiString, {
      type: "png",
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    return new NextResponse(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
