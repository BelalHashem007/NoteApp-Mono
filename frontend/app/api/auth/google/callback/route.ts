import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function toMaxAge(dateString: string) {
  return Math.max(
    0,
    Math.floor((new Date(dateString).getTime() - Date.now()) / 1000),
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cookieStore = await cookies();
  console.log(cookieStore);

  const accessToken = cookieStore.get("accessToken");
  const refreshToken = cookieStore.get("refreshToken");

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect("/login?error=oauth_failed");
  }

  const res = NextResponse.redirect(new URL("/dashboard", req.url));

  res.cookies.set("accessToken", accessToken.value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 29 * 60,
  });

  res.cookies.set("refreshToken", refreshToken.value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 24 * 60 * 60,
  });

  return res;
}
