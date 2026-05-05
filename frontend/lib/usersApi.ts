import { fetchWithAuth } from "./fetchWithAuthentication";
import { throwIfNotOk } from "./folderApi";

export async function getUser() {
  const res = await fetchWithAuth("/api/users/me", {
    method: "GET",
  });

  await throwIfNotOk(res);

  return res.json() as Promise<ApiResponse<User>>;
}
