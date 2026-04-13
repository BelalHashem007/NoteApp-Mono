import { forwardJsonError, requireAuth } from "@/lib/dal";
import { serverFetchWithAuth } from "@/lib/serverFetchWithAuthentication";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await requireAuth();

  const searchQuery = new URL(request.url).searchParams.get("searchQuery");

  const res = await serverFetchWithAuth(
    `http://localhost:5001/api/notes?searchQuery=${searchQuery}`,
  );

  if (!res.ok) return forwardJsonError(res);

  return NextResponse.json(await res.json());
}
