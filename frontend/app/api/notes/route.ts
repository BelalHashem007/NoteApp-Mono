import { requireAuth } from "@/lib/dal";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { CreateNoteSchema } from "@/lib/zod";
import { NextResponse } from "next/server";
import { z } from "zod";

async function forwardJsonError(res: Response) {
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

export async function POST(request: Request) {
  await requireAuth();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = json as { folderId: string; title: string };

  const validationResult = CreateNoteSchema.safeParse({
    title: body.title,
  });
  if (!validationResult.success) {
    return NextResponse.json(
      { error: z.flattenError(validationResult.error) },
      { status: 400 },
    );
  }

  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/folders/${body.folderId}/notes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validationResult.data,
      }),
    },
  );

  if (!res.ok) return forwardJsonError(res);

  return NextResponse.json(await res.json());
}
