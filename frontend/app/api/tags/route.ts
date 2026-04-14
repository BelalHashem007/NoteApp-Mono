import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { requireAuth } from "@/lib/dal";
import { forwardJsonError } from "@/lib/dal";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await requireAuth();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const res = await serverFetchWithAuth("http://localhost:5001/api/tags", {
    method: "POST",
    body: JSON.stringify(json),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return forwardJsonError(res);
  return new NextResponse(null, { status: 200 });
}

export async function DELETE(request: Request) {
  await requireAuth();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const res = await serverFetchWithAuth("http://localhost:5001/api/tags", {
    method: "DELETE",
    body: JSON.stringify(json),
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return forwardJsonError(res);
  return new NextResponse(null, { status: 204 });
}
