import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { toMaxAge } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  let refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    const body = await request.json();
    refreshToken = body.refreshToken;
    if (!refreshToken)
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  console.log("iam in refreshaccesstoken");
  console.log(refreshToken);

  const result = await fetch("http://localhost:5001/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshToken }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(result);

  if (!result.ok)
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });

  const body: ApiResponse<LoginResponse> = await result.json();

  if (!body.data)
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });

  const response = NextResponse.json({
    success: true,
    accessToken: body.data.accessToken,
  });

  response.cookies.set("accessToken", body.data?.accessToken, {
    httpOnly: true,
    secure: true, // Only over HTTPS
    sameSite: "lax", // Required for <img> tags to work
    maxAge: toMaxAge(body.data?.accessTokenExpirationDate) - 10, // Use the expiry from .NET
    path: "/",
  });

  response.cookies.set("refreshToken", body.data?.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: toMaxAge(body.data?.refreshTokenExpiration) - 10,
  });
  return response;
}
