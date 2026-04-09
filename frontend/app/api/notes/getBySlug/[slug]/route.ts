import { requireAuth } from "@/lib/dal";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { NextResponse } from "next/server";
import { forwardJsonError } from "@/lib/dal";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  await requireAuth();
  const { slug } = await context.params;
  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/notes/GetBySlug/${slug}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );
  if (!res.ok) return forwardJsonError(res);
  return NextResponse.json(await res.json());
}
