"use client";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useTapsContext } from "@/app/dashboard/providers";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useMutation } from "@tanstack/react-query";
import { updateNoteTitle } from "@/actions/actions";
import { useState } from "react";
import toast from "react-hot-toast";

export default function NoteList({
  notes,
  level = 1,
}: {
  notes: NoteWithoutBody[];
  level: number;
}) {
  const { setOpenedNotes } = useTapsContext();
  const [editTitle, setEditTitle] = useState<string | null>(null);
  const mutationToUpdateNoteTitle = useMutation({
    mutationFn: (updatedNote: NoteWithoutBody) => {
      return updateNoteTitle(updatedNote);
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
            <FileText className="w-4 h-4 shrink-0 text-primary" />
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
                  className="flex gap-2 hover:bg-gray-200 w-full truncate items-center"
                  style={{ paddingLeft: 28 + level * 8 }}
                  href={`/dashboard/note/${n.slug}`}
                  onClick={() => {
                    setOpenedNotes((prev) => {
                      if (prev.some((x) => x.slug === n.slug)) return prev;
                      else return [...prev, n];
                    });
                  }}
                >
                  <FileText className="w-4 h-4 shrink-0 text-primary" />{" "}
                  {!mutationToUpdateNoteTitle.isError &&
                  mutationToUpdateNoteTitle.variables?.id === n.id
                    ? mutationToUpdateNoteTitle.variables.title
                    : n.title}
                </Link>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onSelect={() => setEditTitle(n.id)}>
                  Rename
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        ),
      )}
    </div>
  );
}
