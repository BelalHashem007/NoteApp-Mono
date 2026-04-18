import { requireAuth, forwardJsonError } from "@/lib/dal";
import { NextResponse } from "next/server";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";

export async function PUT(request: Request) {
  await requireAuth();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = json as { folderId: string; noteId: string };

  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/notes/${body.noteId}/${body.folderId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!res.ok) return forwardJsonError(res);

  return NextResponse.json(await res.json());
}
