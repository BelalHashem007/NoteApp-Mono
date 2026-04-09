import { NextResponse } from "next/server";

export async function GET() {
  const returnUrl = "http://localhost:3000/api/auth/google/callback";

  const backendUrl = `http://localhost:5001/api/auth/login/google?returnUrl=${returnUrl}`;

  return NextResponse.redirect(backendUrl);
}
