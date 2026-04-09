import { requireAuth } from "@/lib/dal";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { CreateFolderSchema } from "@/lib/zod";
import { NextResponse } from "next/server";
import * as z from "zod";
import { forwardJsonError } from "@/lib/dal";

export async function GET() {
  await requireAuth();

  const res = await serverFetchWithAuth(
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

  const res = await serverFetchWithAuth(`http://localhost:5001/api/Folders`, {
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
