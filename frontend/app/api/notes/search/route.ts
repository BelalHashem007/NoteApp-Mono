import { forwardJsonError, requireAuth } from "@/lib/dal";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await requireAuth();

  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("searchQuery") ?? "";
  const tags = url.searchParams.getAll("tags");
  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/notes?searchQuery=${encodeURIComponent(searchQuery)}${
      tags ? `&tags=${tags}` : ""
    }`,
  );

  if (!res.ok) return forwardJsonError(res);
  const body = await res.json();
  return NextResponse.json(body);
}
