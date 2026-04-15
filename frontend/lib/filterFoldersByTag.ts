function noteHasTag(note: NoteWithoutBody, tagNames: string[]): boolean {
  return tagNames.every((t) =>
    (note.tags ?? []).some(
      (nt) => nt.name.trim().toLowerCase() === t.trim().toLowerCase(),
    ),
  );
}

export function filterFolderTreeByTag(
  folders: FolderWithNotes[],
  tagNames: string[],
): FolderWithNotes[] {
  if (tagNames.length === 0) return folders;

  const recurse = (list: FolderWithNotes[]): FolderWithNotes[] => {
    return list
      .map((f) => {
        const notes = f.notes.filter((n) => noteHasTag(n, tagNames));
        const subFolders = recurse(f.subFolders);
        return { ...f, notes, subFolders };
      })
      .filter((f) => f.notes.length > 0 || f.subFolders.length > 0);
  };

  return recurse(folders);
}
