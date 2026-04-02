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
import { Dialog } from "@/components/ui/dialog";

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
    <div className="h-full w-full flex flex-col">
      <FolderSearch query={query} setQuery={setQuery} />

      <FolderList folders={filteredFolders} level={0} />

      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          if (!open) setShowModal(false);
        }}
      >
        <CreationAndEditModal
          onClose={() => {
            setShowModal(false);
          }}
          state="create"
          modalType="folder"
        />
      </Dialog>
      <ContextMenu>
        <ContextMenuTrigger className="grow"></ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setShowModal(true)}>
            New Folder...
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
