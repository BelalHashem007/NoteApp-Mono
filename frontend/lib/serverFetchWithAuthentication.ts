import { cookies } from "next/headers";

export async function serverFetchWithAuth(
  url: string,
  options: RequestInit = {},
) {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;

  const makeRequest = (token?: string) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

  const res = await makeRequest(accessToken);

  return res;
}
