import { useState } from "react";
import NoteList from "../noteComponent/NoteList";
import {
  FolderOpen,
  FolderClosed,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { DeleteFolderModal } from "../modals/DeleteFolderModal";
import CreationAndEditModal from "../modals/CreationAndEditModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Dialog } from "@/components/ui/dialog";

export default function FolderList({
  folders,
  level = 0,
}: {
  folders: FolderWithNotes[];
  level: number;
}) {
  const [openFolders, setOpenFolders] = useState<string[]>([]);

  const [activeAction, setActiveAction] = useState<
    | null
    | { type: "createNote"; folder: FolderWithNotes }
    | { type: "createFolder"; folder: FolderWithNotes; parentId?: string }
    | { type: "rename"; folder: FolderWithNotes }
    | { type: "delete"; folder: FolderWithNotes }
  >(null);

  return (
    <div className="overflow-y-auto">
      {folders.map((f) => {
        return (
          <div key={f.id}>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <button
                  className=" flex gap-2 hover:bg-gray-200 w-full items-center truncate"
                  style={{ paddingLeft: 8 + level * 8 }}
                  onClick={() =>
                    setOpenFolders(
                      openFolders.includes(f.id)
                        ? openFolders.filter((folderId) => folderId !== f.id)
                        : [f.id, ...openFolders],
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Delete" && activeAction?.type !== "delete") {
                      setActiveAction({ type: "delete", folder: f });
                    }
                  }}
                >
                  {openFolders.includes(f.id) ? (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      <FolderOpen className="w-4 h-4 shrink-0 text-accent" />
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      <FolderClosed className="w-4 h-4 shrink-0 text-accent" />
                    </>
                  )}{" "}
                  {f.folderName}
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onSelect={() => {
                    setActiveAction({
                      type: "createNote",
                      folder: f,
                    });
                  }}
                >
                  New Note...
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => {
                    setActiveAction({
                      type: "createFolder",
                      folder: f,
                      parentId: f.id,
                    });
                  }}
                >
                  New Folder...
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => {
                    setActiveAction({
                      type: "rename",
                      folder: f,
                    });
                  }}
                >
                  Rename
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => {
                    setActiveAction({
                      type: "delete",
                      folder: f,
                    });
                  }}
                >
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            {openFolders.includes(f.id) && (
              <div>
                <FolderList folders={f.subFolders} level={level + 1} />
                <NoteList notes={f.notes} level={level + 1} />
              </div>
            )}
          </div>
        );
      })}

      {/* modals */}
      <Dialog
        open={!!activeAction}
        onOpenChange={(open) => {
          if (!open) setActiveAction(null);
        }}
      >
        {activeAction?.type === "createFolder" && (
          <CreationAndEditModal
            onClose={() => {
              setActiveAction(null);
            }}
            state="create"
            modalType="folder"
            parentId={activeAction?.parentId}
          />
        )}

        {activeAction?.type === "createNote" && (
          <CreationAndEditModal
            onClose={() => {
              setActiveAction(null);
            }}
            state="create"
            folder={activeAction.folder}
            modalType="note"
          />
        )}

        {activeAction?.type === "rename" && (
          <CreationAndEditModal
            onClose={() => {
              setActiveAction(null);
            }}
            state="edit"
            folder={activeAction.folder}
            modalType="folder"
          />
        )}

        {activeAction?.type === "delete" && (
          <DeleteFolderModal
            folder={activeAction.folder}
            onClose={() => {
              setActiveAction(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
