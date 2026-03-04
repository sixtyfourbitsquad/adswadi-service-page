import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword, setAdminPassword } from "@/lib/admin";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const currentPassword = getAdminPassword();
  if (!token || token !== currentPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };
  const { currentPassword: submitted, newPassword } = body;
  if (submitted !== currentPassword) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }
  if (typeof newPassword !== "string" || newPassword.length < 4) {
    return NextResponse.json(
      { error: "New password must be at least 4 characters" },
      { status: 400 }
    );
  }
  try {
    setAdminPassword(newPassword);
    return NextResponse.json({
      success: true,
      message: "Password updated. Use the new password to log in next time.",
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save password" },
      { status: 500 }
    );
  }
}
