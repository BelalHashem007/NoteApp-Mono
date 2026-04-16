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

type FoldersComponentProps = {
  folders: FolderWithNotes[];
  onCreateFolder: (args: { folderName: string; parentId?: string }) => void;
  showFolderCreationInput: boolean;
  setShowFolderCreationInput: React.Dispatch<React.SetStateAction<boolean>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  openFolders: string[];
  setOpenFolders: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function FoldersComponent({
  folders,
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

  return (
    <div className="h-full w-full flex flex-col min-h-0 pb-1">
      {/* <FolderSearch query={query} setQuery={setQuery} /> */}

      <FolderList
        folders={folders}
        level={0}
        onCreateFolder={onCreateFolder}
        openFolders={openFolders}
        setOpenFolders={setOpenFolders}
      />

      {showFolderCreationInput && (
        <div className="pl-2 flex gap-2 items-center w-full">
          <ChevronRight className="w-3 h-3 text-neutral-500 dark:text-[#a1a1a1]" />
          <FolderClosed className="w-4 h-4 shrink-0 text-neutral-500 dark:text-[#a1a1a1]" />
          <input
            className="pl-1 focus:outline-1 dark:focus:outline-neutral-500 focus:outline-neutral-800"
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
