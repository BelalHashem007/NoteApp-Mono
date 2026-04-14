import { fetchWithAuth } from "./fetchWithAuthentication";
import { throwIfNotOk } from "./folderApi";

export async function createTagRequest({
  name,
  noteId,
}: {
  name: string;
  noteId: string;
}) {
  const res = await fetchWithAuth("/api/tags", {
    method: "POST",
    body: JSON.stringify({ name, noteId }),
  });
  await throwIfNotOk(res);
  return Promise.resolve();
}

export async function deleteTagRequest({
  name,
  noteId,
}: {
  name: string;
  noteId: string;
}) {
  const res = await fetchWithAuth("/api/tags", {
    method: "DELETE",
    body: JSON.stringify({ name, noteId }),
  });
  await throwIfNotOk(res);
  return Promise.resolve();
}
