"use client";
import FolderSearch from "./FolderSearch";
import FolderList from "./FolderList";
import { useState } from "react";

export default function FoldersComponent({
  folders,
}: {
  folders: FolderWithNotes[];
}) {
  const [query, setQuery] = useState<string>("");
  const filteredFolders = folders.filter((f) =>
    f.folderName.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <FolderSearch query={query} setQuery={setQuery} />

      <FolderList folders={filteredFolders} />
    </>
  );
}
