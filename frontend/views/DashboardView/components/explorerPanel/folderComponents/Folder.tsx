import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Trash2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FolderClosed,
  FolderPlus,
  Pencil,
  FilePlus,
} from "lucide-react";
import { RefObject } from "react";
import { useExplorerContext } from "../ExplorerSection";

type Props = {
  folder: FolderWithNotes;
  level: number;
  creationInputRef: RefObject<HTMLInputElement | null>;
};

export function Folder({ folder, level, creationInputRef }: Props) {
  const {
    openFolders,
    setOpenFolders,
    activeAction,
    setActiveAction,
    updateFolder,
  } = useExplorerContext();
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          className=" flex pr-3 gap-2 hover:bg-primary/10 dark:hover:bg-neutral-700 w-full items-center dark:text-neutral-50"
          style={{ paddingLeft: 8 + level * 8 }}
          onClick={() =>
            setOpenFolders(
              openFolders.includes(folder.id)
                ? openFolders.filter((folderId) => folderId !== folder.id)
                : [folder.id, ...openFolders],
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Delete" && activeAction?.type !== "delete") {
              setActiveAction({ type: "delete", folder: folder });
            }
          }}
        >
          {openFolders.includes(folder.id) ? (
            <>
              <ChevronDown className="w-3 h-3 text-neutral-500 dark:text-[#a1a1a1]" />
              <FolderOpen className="w-4 h-4 shrink-0 text-neutral-500 dark:text-[#a1a1a1]" />
            </>
          ) : (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-500 dark:text-[#a1a1a1]" />
              <FolderClosed className="w-4 h-4 shrink-0 text-neutral-500 dark:text-[#a1a1a1]" />
            </>
          )}{" "}
          <span className="truncate inline-block max-w-50">
            {!updateFolder.isError && updateFolder.variables?.id === folder.id
              ? updateFolder.variables?.folderName
              : folder.folderName}
          </span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(e) => {
          if (
            activeAction?.type === "createFolder" ||
            activeAction?.type === "createNote"
          ) {
            if (creationInputRef.current) {
              creationInputRef.current.focus();
              creationInputRef.current = null;
              e.preventDefault();
            }
          }
        }}
      >
        <ContextMenuGroup>
          <ContextMenuItem
            onSelect={() => {
              if (!openFolders.find((x) => x === folder.id)) {
                setOpenFolders((prev) => [...prev, folder.id]);
              }
              setActiveAction({
                type: "createNote",
                folder: folder,
              });
            }}
          >
            <div className="flex items-center gap-2">
              <FilePlus className="w-4 h-4 shrink-0 " />
              <span className="text-sm">New Note...</span>
            </div>
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => {
              if (!openFolders.find((x) => x === folder.id)) {
                setOpenFolders((prev) => [...prev, folder.id]);
              }
              setActiveAction({
                type: "createFolder",
                folder: folder,
                parentId: folder.id,
              });
            }}
          >
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 shrink-0" />
              <span className="text-sm">New Folder...</span>
            </div>
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => {
              setActiveAction({
                type: "renameFolder",
                folder: folder,
              });
            }}
          >
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 shrink-0" />
              <span className="text-sm">Rename</span>
            </div>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => {
            setActiveAction({
              type: "delete",
              folder: folder,
            });
          }}
          className="focus:bg-destructive/10"
        >
          <div className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4 shrink-0" />
            <span className="text-sm">Delete</span>
          </div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
