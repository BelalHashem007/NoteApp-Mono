import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthCallbackClient from "./AuthCallbackClient";

export default async function Page() {
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.has("refreshToken");

  if (!hasAuthCookie) {
    redirect("/login?error=InvalidSession");
  }

  return <AuthCallbackClient />;
}