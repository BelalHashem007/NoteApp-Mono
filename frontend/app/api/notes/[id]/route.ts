import { requireAuth } from "@/lib/dal";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { UpdateNoteTitleSchema } from "@/lib/zod";
import { NextResponse } from "next/server";
import * as z from "zod";
import { forwardJsonError } from "@/lib/dal";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  await requireAuth();

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = json as { title?: unknown };

  const validationResult = UpdateNoteTitleSchema.safeParse({
    title: body.title,
  });

  if (!validationResult.success) {
    return NextResponse.json(
      { error: z.flattenError(validationResult.error) },
      { status: 400 },
    );
  }

  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/notes/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: validationResult.data.title,
      }),
    },
  );

  if (!res.ok) return forwardJsonError(res);

  return new NextResponse(null, { status: 200 });
}

export async function DELETE(_request: Request, context: RouteContext) {
  await requireAuth();

  const { id } = await context.params;

  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/notes/${id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!res.ok) return forwardJsonError(res);

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await res.text();
  if (!text) {
    return new NextResponse(null, { status: res.status });
  }
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return NextResponse.json({ message: text }, { status: res.status });
  }
}
