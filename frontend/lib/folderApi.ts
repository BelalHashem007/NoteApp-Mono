import { fetchWithAuth } from "./fetchWithAuthentication";

export async function throwIfNotOk(res: Response) {
  if (res.ok) return;
  let message = res.statusText;
  try {
    const j = (await res.json()) as { error?: unknown };
    message =
      typeof j?.error === "string" ? j.error : JSON.stringify(j?.error ?? j);
  } catch {
    // keep statusText
  }
  throw new Error(message);
}

export async function createFolderRequest(
  folderName: string,
  parentId?: string,
) {
  const res = await fetchWithAuth("/api/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folderName, parentId: parentId ?? null }),
  });
  await throwIfNotOk(res);
  return res.json() as Promise<unknown>;
}

export async function updateFolderRequest(folder: Folder) {
  const res = await fetchWithAuth(`/api/folders/${folder.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folderName: folder.folderName }),
  });
  await throwIfNotOk(res);
}

export async function deleteFolderRequest(folder: FolderWithNotes) {
  const res = await fetchWithAuth(`/api/folders/${folder.id}`, {
    method: "DELETE",
  });
  await throwIfNotOk(res);
}
