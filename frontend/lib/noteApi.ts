import { throwIfNotOk } from "./folderApi";
import { fetchWithAuth } from "./fetchWithAuthentication";

export async function createNoteRequest(folderId: string, title: string) {
  const res = await fetchWithAuth("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folderId, title }),
  });
  await throwIfNotOk(res);
  return res.json() as Promise<unknown>;
}

export async function updateNoteTitleRequest(updatedNote: NoteWithoutBody) {
  const res = await fetchWithAuth(`/api/notes/${updatedNote.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: updatedNote.title }),
  });
  await throwIfNotOk(res);
}

export async function updateNoteBodyRequest(
  bodyToUpdate: string,
  noteId?: string,
  imageIds?: string[],
) {
  if (!noteId) throw new Error("no note id is given!!");
  const res = await fetchWithAuth(`/api/notes/${noteId}/body`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body: bodyToUpdate, imageIds }),
    keepalive: true,
  });
  await throwIfNotOk(res);
}

export async function deleteNoteRequest(noteToDelete: NoteWithoutBody) {
  const res = await fetchWithAuth(`/api/notes/${noteToDelete.id}`, {
    method: "DELETE",
  });
  await throwIfNotOk(res);
}

export async function searchNotesRequest(
  searchQuery: string,
  tags: string[] = [],
) {
  const params = new URLSearchParams();
  params.set("searchQuery", searchQuery);
  if (tags.length > 0) {
    params.set("tags", JSON.stringify(tags));
  }
  const res = await fetchWithAuth(`/api/notes/search?${params.toString()}`, {
    method: "GET",
  });
  await throwIfNotOk(res);
  return res.json() as Promise<ApiResponse<SearchNotesResponse>>;
}
