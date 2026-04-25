"use client";
import { useTapsContext } from "@/app/dashboard/providers";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { FileText, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { tagQuerySuffix } from "@/lib/tagQueryUrl";
import { UseMutationResult } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { useDraggable } from "@dnd-kit/react";
import { useExplorerContext } from "../ExplorerContextProvider";

type Props = {
  note: NoteWithoutBody;
  level: number;
  mutationToUpdateNoteTitle: UseMutationResult<
    void,
    Error,
    NoteWithoutBody,
    { previousFolders: unknown }
  >;
  setEditTitle: Dispatch<SetStateAction<string | null>>;
  setDeleteAction: Dispatch<SetStateAction<NoteWithoutBody | undefined>>;
  folderId: string;
};

export function Note({
  note,
  level,
  mutationToUpdateNoteTitle,
  setEditTitle,
  setDeleteAction,
  folderId,
}: Props) {
  const { setOpenedNotes } = useTapsContext();
  const { activeItem, setActiveItem } = useExplorerContext();
  const searchParams = useSearchParams();
  const tagSuffix = tagQuerySuffix(searchParams.getAll("tag"));
  const { ref } = useDraggable({
    id: note.id,
    data: { currentFolderId: folderId, note },
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Link
          className={`flex pr-3 gap-2 w-full truncate items-center dark:text-[#a1a1a1] ${
            activeItem?.noteId === note.id
              ? "dark:bg-neutral-700 bg-primary/10"
              : "hover:bg-primary/10 dark:hover:bg-neutral-700"
          }`}
          style={{ paddingLeft: 28 + level * 8 }}
          href={`/dashboard/note/${note.slug}${tagSuffix}`}
          onClick={() => {
            setOpenedNotes((prev) => {
              if (prev.some((x) => x.slug === note.slug)) return prev;
              else return [...prev, note];
            });
            setActiveItem({
              type: "note",
              noteId: note.id,
              folderId: folderId,
            });
          }}
          ref={ref}
        >
          <FileText
            className={`w-4 h-4 shrink-0 ${
              activeItem?.noteId !== note.id &&
              "text-neutral-500 dark:text-[#a1a1a1]"
            }`}
          />{" "}
          {!mutationToUpdateNoteTitle.isError &&
          mutationToUpdateNoteTitle.variables?.id === note.id
            ? mutationToUpdateNoteTitle.variables.title
            : note.title}
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem onSelect={() => setEditTitle(note.id)}>
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 shrink-0" />
              <span className="text-sm">Rename</span>
            </div>
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem
          onSelect={() => setDeleteAction(note)}
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
