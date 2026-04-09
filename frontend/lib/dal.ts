import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { NextResponse } from "next/server";

export const requireAuth = cache(async () => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) return redirect("/login");

  return { accessToken, refreshToken };
});

export async function forwardJsonError(res: Response) {
  const text = await res.text();
  if (!text) {
    return NextResponse.json({ error: res.statusText }, { status: res.status });
  }
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return NextResponse.json({ error: text }, { status: res.status });
  }
}
