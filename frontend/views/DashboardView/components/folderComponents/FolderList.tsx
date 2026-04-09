import { useEffect, useRef, useState } from "react";
import NoteList from "../noteComponent/NoteList";
import {
  FolderOpen,
  FolderClosed,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Dialog } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { updateFolderRequest } from "@/lib/folderApi";
import toast from "react-hot-toast";
import { DeleteModal } from "../modals/DeleteModal";
import { createNoteRequest } from "@/lib/noteApi";

export default function FolderList({
  folders,
  level = 0,
  onCreateFolder,
}: {
  folders: FolderWithNotes[];
  level: number;
  onCreateFolder: (args: { folderName: string; parentId?: string }) => void;
}) {
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const [activeAction, setActiveAction] = useState<
    | null
    | { type: "createNote"; folder: FolderWithNotes }
    | { type: "createFolder"; folder: FolderWithNotes; parentId?: string }
    | { type: "renameFolder"; folder: FolderWithNotes }
    | { type: "delete"; folder: FolderWithNotes }
  >(null);
  const creationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      activeAction?.type === "createFolder" ||
      activeAction?.type === "createNote"
    ) {
      const timer = setTimeout(() => {
        creationInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeAction]);

  const mutationToUpdateFolder = useMutation({
    mutationFn: (updatedFolder: Folder) => {
      return updateFolderRequest(updatedFolder);
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

      setActiveAction(null);
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

  const mutationToCreateNote = useMutation({
    mutationFn: ({ folderId, title }: { folderId: string; title: string }) => {
      return createNoteRequest(folderId, title);
    },
    onMutate: async ({ folderId, title }, context) => {
      await context.client.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousFolders = context.client.getQueryData(["foldersAndNotes"]);

      const createNoteRecursive = (
        list: FolderWithNotes[],
      ): FolderWithNotes[] => {
        return list.map((f) => {
          if (f.id === folderId) {
            return {
              ...f,
              notes: [...f.notes, { id: crypto.randomUUID(), title, slug: "" }],
            };
          }
          if (f.subFolders) {
            return { ...f, subFolders: createNoteRecursive(f.subFolders) };
          }
          return f;
        });
      };

      context.client.setQueryData(
        ["foldersAndNotes"],
        (old: ApiResponse<FolderWithNotes[]>) => ({
          ...old,
          data: createNoteRecursive(old.data ?? []),
        }),
      );

      return { previousFolders };
    },
    onError: (err, updatedFolder, onMutateResult, context) => {
      context.client.setQueryData(
        ["foldersAndNotes"],
        onMutateResult?.previousFolders,
      );
      toast.error("Failed to create note");
      console.error(err);
    },
    onSuccess: () => {
      toast.success("Note creation is successful");
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
            {activeAction?.type === "renameFolder" &&
            activeAction.folder.id === f.id ? (
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
                      setActiveAction(null);
                      return;
                    }
                    mutationToUpdateFolder.mutate({
                      folderName: e.target.value,
                      id: f.id,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") setActiveAction(null);
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
                    <span className="truncate inline-block max-w-50">
                      {!mutationToUpdateFolder.isError &&
                      mutationToUpdateFolder.variables?.id === f.id
                        ? mutationToUpdateFolder.variables?.folderName
                        : f.folderName}
                    </span>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent
                  onCloseAutoFocus={(e) => {
                    if (activeAction?.type === "createFolder")
                      e.preventDefault();
                  }}
                >
                  <ContextMenuItem
                    onSelect={() => {
                      if (!openFolders.find((x) => x === f.id)) {
                        setOpenFolders((prev) => [...prev, f.id]);
                      }
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
                      if (!openFolders.find((x) => x === f.id)) {
                        setOpenFolders((prev) => [...prev, f.id]);
                      }
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
                        type: "renameFolder",
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
            )}
            {openFolders.includes(f.id) && (
              <div>
                {/* input for folder creation */}
                {activeAction?.type === "createFolder" &&
                  activeAction.folder.id === f.id && (
                    <div
                      className="pl-2 flex gap-2 items-center w-full"
                      style={{ paddingLeft: 8 + (level + 1) * 8 }}
                    >
                      <ChevronRight className="w-3 h-3" />
                      <FolderClosed className="w-4 h-4 shrink-0 text-accent" />
                      <input
                        className="pl-1"
                        type="text"
                        ref={creationInputRef}
                        minLength={1}
                        maxLength={50}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value.length === 0) {
                            setActiveAction(null);
                          } else {
                            onCreateFolder({
                              folderName: value,
                              parentId: f.id,
                            });
                            setActiveAction(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                          if (e.key === "Escape") setActiveAction(null);
                        }}
                      />
                    </div>
                  )}
                <FolderList
                  folders={f.subFolders}
                  level={level + 1}
                  onCreateFolder={onCreateFolder}
                />
                {/* input for note creation */}
                {activeAction?.type === "createNote" &&
                  activeAction.folder.id === f.id && (
                    <div
                      className="flex gap-2  w-full  items-center "
                      style={{ paddingLeft: 28 + (level + 1) * 8 }}
                    >
                      <FileText className="w-4 h-4 shrink-0 text-primary" />
                      <input
                        className="pl-1"
                        type="text"
                        ref={creationInputRef}
                        minLength={1}
                        maxLength={50}
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value.length === 0) {
                            setActiveAction(null);
                          } else {
                            mutationToCreateNote.mutate({
                              title: value,
                              folderId: f.id,
                            });
                            setActiveAction(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.currentTarget.blur();
                          if (e.key === "Escape") setActiveAction(null);
                        }}
                      />
                    </div>
                  )}
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
        {activeAction?.type === "delete" && (
          <DeleteModal
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
