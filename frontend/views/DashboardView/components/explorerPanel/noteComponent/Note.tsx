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
import { usePathname, useSearchParams } from "next/navigation";
import { tagQuerySuffix } from "@/lib/tagQueryUrl";
import { UseMutationResult } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { useDraggable } from "@dnd-kit/react";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeNoteSlug = pathname.split("/").filter(Boolean)[2];
  const tagSuffix = tagQuerySuffix(searchParams.getAll("tag"));
  const { ref } = useDraggable({
    id: note.id,
    data: { currentFolderId: folderId, note },
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Link
          className={`flex gap-2 w-full truncate items-center dark:text-[#a1a1a1] ${
            activeNoteSlug === note.slug
              ? "bg-neutral-500 text-neutral-50 dark:bg-neutral-400 dark:text-neutral-900"
              : "hover:bg-primary/10 dark:hover:bg-neutral-700"
          }`}
          style={{ paddingLeft: 28 + level * 8 }}
          href={`/dashboard/note/${note.slug}${tagSuffix}`}
          onClick={() => {
            setOpenedNotes((prev) => {
              if (prev.some((x) => x.slug === note.slug)) return prev;
              else return [...prev, note];
            });
          }}
          ref={ref}
        >
          <FileText
            className={`w-4 h-4 shrink-0 ${
              activeNoteSlug !== note.slug &&
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
