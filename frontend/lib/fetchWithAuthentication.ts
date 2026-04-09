import { cookies } from "next/headers";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("accessToken")?.value;

  let res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // If expired → refresh
  if (res.status === 401) {
    const refreshRes = await fetch("http://localhost:3000/api/auth/refresh", {
      method: "POST",
    });

    if (!refreshRes.ok) {
      throw new Error("Session expired");
    }

    accessToken = (await cookies()).get("accessToken")?.value;

    res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return res;
}
