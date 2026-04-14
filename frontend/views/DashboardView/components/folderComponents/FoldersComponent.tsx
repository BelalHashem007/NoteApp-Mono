"use client";
import FolderList from "./FolderList";
import { useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useQuery } from "@tanstack/react-query";
import FolderComponentSkeleton from "@/components/placeholders/FolderComponentSkeleton";
import { ChevronRight, FolderClosed, FolderPlus } from "lucide-react";

type FoldersComponentProps = {
  onCreateFolder: (args: { folderName: string; parentId?: string }) => void;
  showFolderCreationInput: boolean;
  setShowFolderCreationInput: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  openFolders: string[];
  setOpenFolders: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function FoldersComponent({
  onCreateFolder,
  showFolderCreationInput,
  setShowFolderCreationInput,
  inputRef,
  openFolders,
  setOpenFolders,
}: FoldersComponentProps) {
  useEffect(() => {
    if (!showFolderCreationInput) return;
    inputRef.current?.focus();
  }, [showFolderCreationInput, inputRef]);

  const {
    data: result,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["foldersAndNotes"],
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/folders`, {
        signal,
      });

      if (!res.ok) throw Error("Failed to fetch folders");

      return res.json();
    },
  });

  if (isPending) return <FolderComponentSkeleton />;

  if (isError) {
    console.error(error);
    return <div>Failed to fetch folders</div>;
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* <FolderSearch query={query} setQuery={setQuery} /> */}

      <FolderList
        folders={result.data as FolderWithNotes[]}
        level={0}
        onCreateFolder={onCreateFolder}
        openFolders={openFolders}
        setOpenFolders={setOpenFolders}
      />

      {showFolderCreationInput && (
        <div className="pl-2 flex gap-2 items-center w-full">
          <ChevronRight className="w-3 h-3" />
          <FolderClosed className="w-4 h-4 shrink-0 text-primary" />
          <input
            className="pl-1"
            type="text"
            ref={inputRef}
            minLength={1}
            maxLength={50}
            onBlur={(e) => {
              if (e.target.value.length === 0)
                return setShowFolderCreationInput(false);
              onCreateFolder({ folderName: e.target.value });
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
  );
}
