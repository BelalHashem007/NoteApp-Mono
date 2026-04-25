import { useRef, RefObject } from "react";
import NoteList from "../noteComponent/NoteList";
import {
  FolderOpen,
  FolderClosed,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Folder } from "./Folder";
import { useDroppable } from "@dnd-kit/react";
import { useExplorerContext } from "../ExplorerContextProvider";

//it only exists to make droppable possible
const FolderEntry = ({
  f,
  level,
  creationInputRef,
}: {
  f: FolderWithNotes;
  level: number;
  creationInputRef: RefObject<HTMLInputElement | null>;
}) => {
  const {
    activeAction,
    openFolders,
    setActiveAction,
    updateFolder,
    createFolder,
    createNote,
  } = useExplorerContext();

  const { ref, isDropTarget } = useDroppable({ id: f.id });

  return (
    <div
      ref={ref}
      className={`${isDropTarget && "dark:bg-neutral-700 bg-neutral-200"}`}
    >
      {/* show input for rename if its renamefolder action */}
      {activeAction?.type === "renameFolder" &&
      activeAction.folder.id === f.id ? (
        <div
          className="pl-2 flex gap-2 items-center w-full dark:text-neutral-50 "
          style={{ paddingLeft: 8 + level * 8 }}
        >
          {openFolders.includes(f.id) ? (
            <>
              <ChevronDown className="w-3 h-3 text-neutral-500 dark:text-[#a1a1a1]" />
              <FolderOpen className="w-4 h-4 shrink-0 text-neutral-500 dark:text-[#a1a1a1]" />
            </>
          ) : (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-500 dark:text-[#a1a1a1]" />
              <FolderClosed className="w-4 h-4 shrink-0 text-neutral-500 dark:text-[#a1a1a1]" />
            </>
          )}
          <input
            type="text"
            defaultValue={f.folderName}
            autoFocus
            className="pl-1 overflow-visible focus:outline-1 dark:focus:outline-neutral-500 focus:outline-neutral-800"
            minLength={1}
            maxLength={50}
            onBlur={(e) => {
              if (e.target.value === f.folderName) {
                setActiveAction(null);
                return;
              }
              updateFolder.mutate({
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
        // else show actual folder
        <Folder folder={f} creationInputRef={creationInputRef} level={level} />
      )}
      {openFolders.includes(f.id) && (
        <div>
          {/* input for folder creation */}
          {activeAction?.type === "createFolder" &&
            activeAction.parentId === f.id && (
              <div
                className="pl-2 flex gap-2 items-center w-full dark:text-neutral-50"
                style={{ paddingLeft: 8 + (level + 1) * 8 }}
              >
                <ChevronRight className="w-3 h-3 text-neutral-500 dark:text-[#a1a1a1]" />
                <FolderClosed className="w-4 h-4 shrink-0 text-neutral-500 dark:text-[#a1a1a1]" />
                <input
                  className="pl-1 focus:outline-1 dark:focus:outline-neutral-500 focus:outline-neutral-800"
                  type="text"
                  ref={creationInputRef}
                  autoFocus
                  minLength={1}
                  maxLength={50}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value.length === 0) {
                      setActiveAction(null);
                    } else {
                      createFolder.mutate({
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
          {/* recursion folderlist */}
          <FolderList folders={f.subFolders} level={level + 1} />
          {/* input for note creation */}
          {activeAction?.type === "createNote" &&
            activeAction.folder.id === f.id && (
              <div
                className="flex gap-2  w-full  items-center "
                style={{ paddingLeft: 28 + (level + 1) * 8 }}
              >
                <FileText className="w-4 h-4 shrink-0 text-neutral-500 dark:text-[#a1a1a1]" />
                <input
                  className="pl-1 dark:text-[#a1a1a1] focus:outline-1 dark:focus:outline-neutral-500 focus:outline-neutral-800"
                  type="text"
                  ref={creationInputRef}
                  minLength={1}
                  maxLength={50}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value.length === 0) {
                      setActiveAction(null);
                    } else {
                      createNote.mutate({
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
          <NoteList notes={f.notes} level={level + 1} folderId={f.id} />
        </div>
      )}
    </div>
  );
};

export default function FolderList({
  folders,
  level = 0,
}: {
  folders: FolderWithNotes[];
  level: number;
}) {
  const creationInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="">
      {folders.map((f) => {
        return (
          <FolderEntry
            key={f.id}
            creationInputRef={creationInputRef}
            f={f}
            level={level}
          />
        );
      })}
    </div>
  );
}
