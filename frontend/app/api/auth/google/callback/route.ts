import { NextResponse } from "next/server";

function toMaxAge(dateString: string) {
  return Math.max(
    0,
    Math.floor((new Date(dateString).getTime() - Date.now()) / 1000),
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const accessExp = searchParams.get("accessExp");
  const refreshExp = searchParams.get("refreshExp");

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect("/login?error=oauth_failed");
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));

  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: toMaxAge(accessExp!) - 10,
  });

  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: toMaxAge(refreshExp!) - 10,
  });

  return res;
}
