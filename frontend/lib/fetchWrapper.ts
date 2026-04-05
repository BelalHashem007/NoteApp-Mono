import { requireAuth } from "./utils";
import { redirect } from "next/navigation";

export async function fetchWrapperServerSide(
  url: string,
  options?: RequestInit,
): Promise<Response | null> {
  const session = await requireAuth();
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
    return response;
  } catch (error) {
    redirect("/login?error=server_down");
  }
}
