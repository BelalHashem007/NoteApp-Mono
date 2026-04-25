"use client";
import FolderList from "./FolderList";
import { useEffect, useRef } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ChevronRight, FolderClosed, FolderPlus } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { usePathname } from "next/navigation";
import { useExplorerContext } from "../ExplorerContextProvider";
import { useMutation } from "@tanstack/react-query";
import { moveNoteToFolder } from "@/lib/noteApi";
import { updateFoldersInQueryCache } from "@/lib/foldersAndNotesCache";
import toast from "react-hot-toast";

type FoldersComponentProps = {
  folders: FolderWithNotes[];
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export default function FolderTree({
  folders,
  inputRef,
}: FoldersComponentProps) {
  const {
    setOpenFolders,
    createFolder,
    activeAction,
    setActiveAction,
    setActiveItem,
  } = useExplorerContext();

  const pathname = usePathname();
  const activeNoteSlug = pathname.split("/").filter(Boolean)[2];

  const mutationToMoveNote = useMutation({
    mutationFn: ({
      note,
      folderId,
    }: {
      note: NoteWithoutBody;
      folderId: string;
    }) => {
      return moveNoteToFolder(note.id, folderId);
    },
    onMutate: async ({ folderId, note }, context) => {
      await context.client.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousFolders = context.client.getQueryData(["foldersAndNotes"]);

      function moveNoteRecursion(
        folders: FolderWithNotes[],
      ): FolderWithNotes[] {
        const parentFolder = folders.find((f) => f.id === folderId);
        if (!parentFolder)
          return folders.map((f) => ({
            ...f,
            subFolders: moveNoteRecursion(f.subFolders),
          }));

        parentFolder.notes.push(note);
        return folders;
      }

      context.client.setQueryData(["foldersAndNotes"], (old: unknown) =>
        updateFoldersInQueryCache(old, (tree) => moveNoteRecursion(tree)),
      );

      return { previousFolders };
    },
    onError: (err, updatedFolder, onMutateResult, context) => {
      context.client.setQueryData(
        ["foldersAndNotes"],
        onMutateResult?.previousFolders,
      );
      toast.error("Failed to create folder");
      console.error(err);
    },
    onSettled: (data, error, updatedFolder, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });

  //ref to hold folders so that when the folders change size react does not throw error saying the folders changed but its not mentioned in the dependancy array
  const foldersRef = useRef(folders);

  //open folders of the current active note
  useEffect(() => {
    if (!activeNoteSlug) return;

    const findPathToNote = (foldersList: FolderWithNotes[]): string[] => {
      const path: string[] = [];

      for (const folder of foldersList) {
        const note = folder.notes.find((n) => n.slug === activeNoteSlug);
        if (note) {
          path.push(folder.id);
          setActiveItem({ type: "note", folderId: folder.id, noteId: note.id });
          return path;
        }

        const subFolderPath = findPathToNote(folder.subFolders);

        if (subFolderPath.length > 0) {
          path.push(folder.id, ...subFolderPath);
          return path;
        }
      }
      return path;
    };

    const folderIdsToOpen = findPathToNote(foldersRef.current);

    const updateState = () =>
      setOpenFolders((prev) => {
        const combined = new Set([...prev, ...folderIdsToOpen]);
        return Array.from(combined);
      });

    updateState();
  }, [activeNoteSlug]);

  useEffect(() => {
    if (activeAction?.type !== "createFolder") return;
    inputRef.current?.focus();
  }, [activeAction?.type, inputRef]);

  return (
    <DragDropProvider
      onDragEnd={({ operation }) => {
        if (
          operation.target &&
          operation.target.id !== operation.source?.data.currentFolderId
        ) {
          const { target, source } = operation;
          const folderId = target.id as string;
          const note = source?.data.note as NoteWithoutBody;
          mutationToMoveNote.mutate({ note, folderId });
        }
      }}
    >
      <div className="h-full w-full flex flex-col min-h-0">
        <FolderList folders={folders} level={0} />
        {activeAction?.type === "createFolder" && !activeAction.parentId && (
          <div className="pl-2 flex gap-2 items-center w-full">
            <ChevronRight className="w-3 h-3 text-neutral-500 dark:text-[#a1a1a1]" />
            <FolderClosed className="w-4 h-4 shrink-0 text-neutral-500 dark:text-[#a1a1a1]" />
            <input
              className="pl-1 mt-1 focus:outline-1 dark:focus:outline-neutral-500 focus:outline-neutral-800"
              type="text"
              ref={inputRef}
              minLength={1}
              maxLength={50}
              onBlur={(e) => {
                if (e.target.value.length === 0) return setActiveAction(null);

                createFolder.mutate({ folderName: e.target.value });
                setActiveAction(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setActiveAction(null);
              }}
            />
          </div>
        )}
        <ContextMenu>
          <ContextMenuTrigger
            className="grow pb-20"
            onClick={() => setActiveItem(null)}
          ></ContextMenuTrigger>
          <ContextMenuContent
            onCloseAutoFocus={(e) => {
              if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current = null;
                e.preventDefault();
              }
            }}
          >
            <ContextMenuItem
              onSelect={() => setActiveAction({ type: "createFolder" })}
            >
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 shrink-0" />
                <span className="text-sm">New Folder...</span>
              </div>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </DragDropProvider>
  );
}
