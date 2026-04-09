import { requireAuth } from "@/lib/dal";
import { NextResponse } from "next/server";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { forwardJsonError } from "@/lib/dal";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  await requireAuth();

  const noteId = (await context.params).id;

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid FormData" }, { status: 400 });
  }

  const file = data.get("file");

  if (!file)
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const formData = new FormData();
  formData.append("file", file);

  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/notes/${noteId}/upload-image`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!res.ok) return forwardJsonError(res);

  return NextResponse.json(await res.json());
}
