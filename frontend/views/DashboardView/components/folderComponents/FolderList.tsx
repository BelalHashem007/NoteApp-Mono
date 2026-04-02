import { useState } from "react";
import NoteList from "../noteComponent/NoteList";
import {
  FolderOpen,
  FolderClosed,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { createPortal } from "react-dom";
import { DeleteFolderModal } from "../modals/DeleteFolderModal";
import CreationAndEditModal from "../modals/CreationAndEditModal";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

export default function FolderList({
  folders,
}: {
  folders: FolderWithNotes[];
}) {
  // const pathName = usePathname();
  // const [selectedFolder, setSelectedFolder] = useState<string>(pathName.split("/").length > 1 ? pathName.split("/")[2] : "")
  // const router = useRouter();
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const [activeAction, setActiveAction] = useState<
    | null
    | { type: "createNote"; folder: FolderWithNotes }
    | { type: "createFolder"; folder: FolderWithNotes; parentId?: string }
    | { type: "rename"; folder: FolderWithNotes }
    | { type: "delete"; folder: FolderWithNotes }
  >(null);

  return (
    <div className="flex-1 overflow-y-auto pl-2">
      {folders.map((f) => {
        return (
          <div key={f.id}>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <button
                  className="flex gap-2 hover:bg-gray-200 w-full"
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
                      <ChevronDown />
                      <FolderOpen fill="yellow" />
                    </>
                  ) : (
                    <>
                      <ChevronRight />
                      <FolderClosed fill="yellow" />
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
              <div className="pl-2">
                <FolderList folders={f.subFolders} />
                <NoteList notes={f.notes} />
              </div>
            )}
          </div>
        );
      })}

      {/* modals */}
      {activeAction?.type === "delete" &&
        createPortal(
          <DeleteFolderModal
            folder={activeAction.folder}
            onClose={() => {
              setActiveAction(null);
            }}
          />,
          document.body,
        )}

      {activeAction?.type === "createFolder" &&
        createPortal(
          <CreationAndEditModal
            onClose={() => {
              setActiveAction(null);
            }}
            state="create"
            modalType="folder"
            parentId={activeAction.parentId}
          />,
          document.body,
        )}

      {activeAction?.type === "createNote" &&
        createPortal(
          <CreationAndEditModal
            onClose={() => {
              setActiveAction(null);
            }}
            state="create"
            folder={activeAction.folder}
            modalType="note"
          />,
          document.body,
        )}

      {activeAction?.type === "rename" &&
        createPortal(
          <CreationAndEditModal
            onClose={() => {
              setActiveAction(null);
            }}
            state="edit"
            folder={activeAction.folder}
            modalType="folder"
          />,
          document.body,
        )}
    </div>
  );
}
