"use client";
import FolderList from "./FolderList";
import { useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ChevronRight, FolderClosed, FolderPlus } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { usePathname } from "next/navigation";
import { useExplorerContext } from "../ExplorerSection";
import { useMutation } from "@tanstack/react-query";
import { moveNoteToFolder } from "@/lib/noteApi";
import { updateFoldersInQueryCache } from "@/lib/foldersAndNotesCache";
import toast from "react-hot-toast";

type FoldersComponentProps = {
  folders: FolderWithNotes[];
  showFolderCreationInput: boolean;
  setShowFolderCreationInput: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

export default function FolderTree({
  folders,
  showFolderCreationInput,
  setShowFolderCreationInput,
  inputRef,
}: FoldersComponentProps) {
  const pathname = usePathname();
  const activeNoteSlug = pathname.split("/").filter(Boolean)[2];
  const { setOpenFolders, createFolder } = useExplorerContext();

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

  //open folders of the current active note
  useEffect(() => {
    if (!activeNoteSlug) return;

    const findPathToNote = (foldersList: FolderWithNotes[]): string[] => {
      const path: string[] = [];

      for (const folder of foldersList) {
        const hasNote = folder.notes.some((n) => n.slug === activeNoteSlug);
        if (hasNote) {
          path.push(folder.id);
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

    const folderIdsToOpen = findPathToNote(folders);

    const updateState = () =>
      setOpenFolders((prev) => {
        const combined = new Set([...prev, ...folderIdsToOpen]);
        return Array.from(combined);
      });

    updateState();
  }, [activeNoteSlug, folders]);

  useEffect(() => {
    if (!showFolderCreationInput) return;
    inputRef.current?.focus();
  }, [showFolderCreationInput, inputRef]);

  return (
    <DragDropProvider
      onDragEnd={({ operation }) => {
        console.log("targetId", operation.target?.id);
        console.log("sourceFolderId", operation.source?.data?.currentFolderId);
        if (
          operation.target &&
          operation.target.id !== operation.source?.data.currentFolderId
        ) {
          const { target, source } = operation;
          const noteId = source?.id as string;
          const folderId = target.id as string;
          const note = operation.source?.data.note as NoteWithoutBody;
          mutationToMoveNote.mutate({ note, folderId });
        }
      }}
    >
      <div className="h-full w-full flex flex-col min-h-0 pb-1">
        <FolderList folders={folders} level={0} />
        {showFolderCreationInput && (
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
                if (e.target.value.length === 0)
                  return setShowFolderCreationInput(false);
                createFolder.mutate({ folderName: e.target.value });
                setShowFolderCreationInput(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setShowFolderCreationInput(false);
              }}
            />
          </div>
        )}
        <ContextMenu>
          <ContextMenuTrigger className="grow"></ContextMenuTrigger>
          <ContextMenuContent
            onCloseAutoFocus={(e) => {
              if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current = null;
                e.preventDefault();
              }
            }}
          >
            <ContextMenuItem onSelect={() => setShowFolderCreationInput(true)}>
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
