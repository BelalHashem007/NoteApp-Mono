"use client";
import FolderSearch from "./FolderSearch";
import FolderList from "./FolderList";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import CreationAndEditModal from "../modals/CreationAndEditModal";

export default function FoldersComponent({
  folders,
}: {
  folders: FolderWithNotes[];
}) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const filteredFolders = folders.filter((f) =>
    f.folderName.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <ContextMenu>
      <div className="h-full flex flex-col">
        <ContextMenuTrigger className="grow">
          <FolderSearch query={query} setQuery={setQuery} />

          <FolderList folders={filteredFolders} />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setShowModal(true)}>
            New Folder...
          </ContextMenuItem>
        </ContextMenuContent>
      </div>
      {showModal && (
        <CreationAndEditModal
          onClose={() => {
            setShowModal(false);
          }}
          state="create"
          modalType="folder"
        />
      )}
    </ContextMenu>
  );
}
