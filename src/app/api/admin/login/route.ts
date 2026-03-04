import { NextRequest, NextResponse } from "next/server";
import { getAdminPassword } from "@/lib/admin";

export async function POST(request: NextRequest) {
  const { password } = (await request.json()) as { password?: string };
  const adminPassword = getAdminPassword();
  if (password === adminPassword) {
    return NextResponse.json({ token: adminPassword });
  }
  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
