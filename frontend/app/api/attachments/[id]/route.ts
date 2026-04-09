import { forwardJsonError } from "@/lib/dal";
import { requireAuth } from "@/lib/dal";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  await requireAuth();

  const attachmentId = (await context.params).id;

  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/Attachments/${attachmentId}`,
  );

  if (!res.ok) return forwardJsonError(res);

  const blob = await res.blob();
  const contentType = res.headers.get("content-type") || "image/jpeg";

  return new NextResponse(blob, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "max-age=3600, public",
    },
  });
}
