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
import { useMutation } from "@tanstack/react-query";
import { updateFolder } from "@/actions/actions";
import toast from "react-hot-toast";

export default function FolderList({
  folders,
  level = 0,
}: {
  folders: FolderWithNotes[];
  level: number;
}) {
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const [renameFolder, setRenameFolder] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<
    | null
    | { type: "createNote"; folder: FolderWithNotes }
    | { type: "createFolder"; folder: FolderWithNotes; parentId?: string }
    | { type: "delete"; folder: FolderWithNotes }
  >(null);

  const mutationToUpdateFolder = useMutation({
    mutationFn: (updatedFolder: Folder) => {
      return updateFolder(updatedFolder);
    },
    onMutate: async (updatedFolder, context) => {
      await context.client.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousFolders = context.client.getQueryData(["foldersAndNotes"]);

      const updateNameRecursive = (
        list: FolderWithNotes[],
      ): FolderWithNotes[] => {
        return list.map((f) => {
          if (f.id === updatedFolder.id) {
            return { ...f, folderName: updatedFolder.folderName };
          }
          if (f.subFolders) {
            return { ...f, subFolders: updateNameRecursive(f.subFolders) };
          }
          return f;
        });
      };

      context.client.setQueryData(
        ["foldersAndNotes"],
        (old: ApiResponse<FolderWithNotes[]>) => ({
          ...old,
          data: updateNameRecursive(old.data ?? []),
        }),
      );

      setRenameFolder(null);
      return { previousFolders };
    },
    onError: (err, updatedFolder, onMutateResult, context) => {
      context.client.setQueryData(
        ["foldersAndNotes"],
        onMutateResult?.previousFolders,
      );
      toast.error("Failed to update foldername");
      console.error(err);
    },
    onSuccess: () => {
      toast.success("FolderName update is successful");
    },
    onSettled: (data, error, updatedFolder, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });

  return (
    <div className="overflow-y-auto">
      {folders.map((f) => {
        return (
          <div key={f.id}>
            {renameFolder === f.id ? (
              <div
                className="pl-2 flex gap-2 items-center w-full"
                style={{ paddingLeft: 8 + level * 8 }}
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
                )}
                <input
                  type="text"
                  defaultValue={f.folderName}
                  autoFocus
                  className="pl-1"
                  minLength={1}
                  maxLength={50}
                  onBlur={(e) => {
                    if (e.target.value === f.folderName) {
                      setRenameFolder(null);
                      return;
                    }
                    mutationToUpdateFolder.mutate({
                      folderName: e.target.value,
                      id: f.id,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setRenameFolder(null);
                  }}
                />
              </div>
            ) : (
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <button
                    className=" flex gap-2 hover:bg-gray-200 w-full items-center"
                    style={{ paddingLeft: 8 + level * 8 }}
                    onClick={() =>
                      setOpenFolders(
                        openFolders.includes(f.id)
                          ? openFolders.filter((folderId) => folderId !== f.id)
                          : [f.id, ...openFolders],
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key === "Delete" &&
                        activeAction?.type !== "delete"
                      ) {
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
                    <span className="truncate">
                      {!mutationToUpdateFolder.isError &&
                      mutationToUpdateFolder.variables?.id === f.id
                        ? mutationToUpdateFolder.variables.folderName
                        : f.folderName}
                    </span>
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
                    onSelect={(e) => {
                      // setActiveAction({
                      //   type: "rename",
                      //   folder: f,
                      // });
                      setRenameFolder(f.id);
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
            )}
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
