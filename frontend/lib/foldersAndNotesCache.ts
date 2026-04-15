/**
 * React-query cache for GET /api/folders: `data` is `{ folders, tags }`.
 */

type FoldersPayload = {
  folders?: FolderWithNotes[] | null;
  tags?: Tag[] | null;
};

export function getFoldersFromQueryData(cached: unknown): FolderWithNotes[] {
  const data = (cached as { data?: FoldersPayload | null })?.data;
  const folders = data?.folders;
  if (!folders || !Array.isArray(folders)) return [];
  return folders;
}

export function updateFoldersInQueryCache(
  old: unknown,
  update: (folders: FolderWithNotes[]) => FolderWithNotes[],
): unknown {
  const o = old as { data?: FoldersPayload | null };
  if (!o?.data || typeof o.data !== "object" || Array.isArray(o.data)) {
    return old;
  }

  const rec = o.data;
  const folders = rec.folders ?? [];
  const nextFolders = update(folders);
  return {
    ...o,
    data: {
      ...rec,
      folders: nextFolders,
    },
  };
}
