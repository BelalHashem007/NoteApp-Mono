"use client";

import { CopyMinus, FilePlus, FolderPlus } from "lucide-react";
import { useRef } from "react";
import FolderTree from "./folderComponents/FolderTree";
import { Dialog } from "@/components/ui/dialog";
import { DeleteModal } from "../modals/DeleteModal";
import { useExplorerContext } from "./ExplorerContextProvider";

export default function ExplorerSection({
  folders,
}: {
  folders: FolderWithNotes[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    setOpenFolders,
    openFolders,
    activeAction,
    setActiveAction,
    activeItem,
  } = useExplorerContext();

  return (
    <>
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden pb-2">
        <div className="h-9 px-4 shrink-0 flex items-center justify-between text-foreground/70 text-xs font-semibold uppercase tracking-wider">
          <span>Explorer</span>
          <div>
            <button
              type="button"
              className="p-1 hover:bg-primary/10 dark:hover:bg-neutral-700 rounded-md"
              title="New Note..."
              onClick={() => {
                if (activeItem && !openFolders.includes(activeItem.folderId))
                  setOpenFolders((prev) => [...prev, activeItem.folderId]);

                if (activeItem)
                  setActiveAction({
                    type: "createNote",
                    folderId: activeItem?.folderId,
                  });
              }}
            >
              <FilePlus className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1 hover:bg-primary/10 dark:hover:bg-neutral-700 rounded-md"
              title="New Folder..."
              onClick={() => {
                if (activeItem && !openFolders.includes(activeItem.folderId))
                  setOpenFolders((prev) => [...prev, activeItem.folderId]);
                setActiveAction({
                  type: "createFolder",
                  parentId: activeItem?.folderId ?? undefined,
                });
              }}
            >
              <FolderPlus className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Collapse Folders"
              className="p-1 hover:bg-primary/10 dark:hover:bg-neutral-700 rounded-md"
              onClick={() => setOpenFolders([])}
            >
              <CopyMinus className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <FolderTree folders={folders} inputRef={inputRef} />
        </div>
      </div>
      {/* modals */}
      <Dialog
        open={!!activeAction}
        onOpenChange={(open) => {
          if (!open) setActiveAction(null);
        }}
      >
        {activeAction?.type === "delete" && (
          <DeleteModal
            folder={activeAction.folder}
            onClose={() => {
              setActiveAction(null);
            }}
          />
        )}
      </Dialog>
    </>
  );
}
