import { forwardJsonError, requireAuth } from "@/lib/dal";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { NextResponse } from "next/server";

export async function GET() {
  await requireAuth();

  const res = await serverFetchWithAuth("http://localhost:5001/api/users/me");

  if (!res.ok) forwardJsonError(res);

  const body = await res.json();

  return NextResponse.json(body);
}
