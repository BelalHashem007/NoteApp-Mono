import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/dal";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { forwardJsonError } from "@/lib/dal";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  await requireAuth();

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
    console.log(json);
  } catch {
    console.log("in invalid json");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = json as { body: string; imageIds: string[] };

  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/notes/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: data.body,
        imageIds: data.imageIds,
      }),
    },
  );

  if (!res.ok) return forwardJsonError(res);

  return new NextResponse(null, { status: 200 });
}
