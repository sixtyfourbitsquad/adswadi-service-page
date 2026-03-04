import { NextRequest, NextResponse } from "next/server";
import { getConfig, saveConfig } from "@/lib/config";
import { getAdminPassword } from "@/lib/admin";
import type { Config } from "@/lib/types";

function auth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  return authHeader.slice(7) === getAdminPassword();
}

export async function GET(request: NextRequest) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const config = getConfig();
    return NextResponse.json(config);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load config" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!auth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as Partial<Config>;
    const config = getConfig();
    if (body.title !== undefined) config.title = body.title;
    if (body.subtitle !== undefined) config.subtitle = body.subtitle;
    if (body.services !== undefined) config.services = body.services;
    if (body.payment !== undefined) config.payment = body.payment;
    saveConfig(config);
    return NextResponse.json(config);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save config" },
      { status: 500 }
    );
  }
}
