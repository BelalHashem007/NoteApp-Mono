"use client";
import { FileText, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTapsContext } from "@/app/dashboard/providers";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useMutation } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Dialog } from "@/components/ui/dialog";
import { DeleteModal } from "../modals/DeleteModal";
import { updateNoteTitleRequest } from "@/lib/noteApi";

export default function NoteList({
  notes,
  level = 1,
}: {
  notes: NoteWithoutBody[];
  level: number;
}) {
  const pathname = usePathname();
  const activeNoteSlug = pathname.match(/^\/dashboard\/note\/([^/]+)/)?.[1];
  const { setOpenedNotes } = useTapsContext();
  const [editTitle, setEditTitle] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<NoteWithoutBody | undefined>(
    undefined,
  );
  const mutationToUpdateNoteTitle = useMutation({
    mutationFn: (updatedNote: NoteWithoutBody) => {
      return updateNoteTitleRequest(updatedNote);
    },
    onMutate: async (updatedNote, context) => {
      await context.client.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousFolders = context.client.getQueryData(["foldersAndNotes"]);

      const updateNameRecursive = (
        list: FolderWithNotes[],
      ): FolderWithNotes[] => {
        return list.map((f) => {
          if (f.notes.find((x) => x.id === updatedNote.id)) {
            return {
              ...f,
              notes: f.notes.map((x) => {
                if (x.id === updatedNote.id)
                  return { ...x, title: updatedNote.title };
                else return x;
              }),
            };
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

      setEditTitle(null);
      return { previousFolders };
    },
    onError: (err, updatedFolder, onMutateResult, context) => {
      context.client.setQueryData(
        ["foldersAndNotes"],
        onMutateResult?.previousFolders,
      );
      toast.error("Failed to update note title");
      console.error(err);
    },
    onSuccess: (data, updatedNote) => {
      setOpenedNotes((prev) => {
        return prev.map((x) => (x.slug === updatedNote.slug ? updatedNote : x));
      });
      toast.success("Note Title update is successful");
    },
    onSettled: (data, error, updatedFolder, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });
  console.log(notes);
  return (
    <div>
      {notes.map((n) =>
        editTitle === n.id ? (
          <div
            key={n.id}
            className="flex gap-2  w-full  items-center "
            style={{ paddingLeft: 28 + level * 8 }}
          >
            <FileText className="w-4 h-4 shrink-0 text-black" />
            <input
              className="pl-1"
              type="text"
              defaultValue={n.title}
              autoFocus
              minLength={1}
              maxLength={50}
              onBlur={(e) => {
                if (e.target.value === n.title) {
                  setEditTitle(null);
                  return;
                }
                mutationToUpdateNoteTitle.mutate({
                  ...n,
                  title: e.target.value,
                });
                setEditTitle(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") setEditTitle(null);
              }}
            />
          </div>
        ) : (
          <div key={n.id}>
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Link
                  className={`flex gap-2 w-full truncate items-center ${
                    activeNoteSlug === n.slug
                      ? "bg-secondary/10 text-secondary font-bold"
                      : "text-foreground hover:bg-primary/10"
                  }`}
                  style={{ paddingLeft: 28 + level * 8 }}
                  href={`/dashboard/note/${n.slug}`}
                  onClick={() => {
                    setOpenedNotes((prev) => {
                      if (prev.some((x) => x.slug === n.slug)) return prev;
                      else return [...prev, n];
                    });
                  }}
                >
                  <FileText
                    className={`w-4 h-4 shrink-0 ${
                      activeNoteSlug === n.slug
                        ? "text-secondary"
                        : "text-black"
                    }`}
                  />{" "}
                  {!mutationToUpdateNoteTitle.isError &&
                  mutationToUpdateNoteTitle.variables?.id === n.id
                    ? mutationToUpdateNoteTitle.variables.title
                    : n.title}
                </Link>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuGroup>
                  <ContextMenuItem onSelect={() => setEditTitle(n.id)}>
                    <div className="flex items-center gap-2">
                      <Pencil className="w-4 h-4 shrink-0" />
                      <span className="text-sm">Rename</span>
                    </div>
                  </ContextMenuItem>
                </ContextMenuGroup>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onSelect={() => setDeleteAction(n)}
                  className="focus:bg-destructive/10"
                >
                  <div className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span className="text-sm">Delete</span>
                  </div>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        ),
      )}

      <Dialog
        open={!!deleteAction}
        onOpenChange={(open) => {
          if (!open) setDeleteAction(undefined);
        }}
      >
        {deleteAction && (
          <DeleteModal
            onClose={() => setDeleteAction(undefined)}
            note={deleteAction}
          />
        )}
      </Dialog>
    </div>
  );
}
