import { requireAuth } from "@/lib/dal";
import { fetchWithAuth } from "@/lib/fetchWithAuthentication";
import { CreateFolderSchema } from "@/lib/zod";
import { NextResponse } from "next/server";
import * as z from "zod";

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

export async function GET() {
  await requireAuth();

  const res = await fetchWithAuth(
    `http://localhost:5001/api/Folders/GetAllItems`,
  );

  if (!res.ok) return forwardJsonError(res);

  const body = await res.json();

  return NextResponse.json(body);
}

export async function POST(request: Request) {
  await requireAuth();

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = json as { folderName?: unknown; parentId?: unknown };

  const validationResult = CreateFolderSchema.safeParse({
    folderName: body.folderName,
  });
  if (!validationResult.success) {
    return NextResponse.json(
      { error: z.flattenError(validationResult.error) },
      { status: 400 },
    );
  }

  const parentId =
    body.parentId === undefined || body.parentId === null
      ? null
      : String(body.parentId);

  const res = await fetchWithAuth(`http://localhost:5001/api/Folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folderName: validationResult.data.folderName,
      parentId,
    }),
  });

  if (!res.ok) return forwardJsonError(res);

  return NextResponse.json(await res.json());
}
