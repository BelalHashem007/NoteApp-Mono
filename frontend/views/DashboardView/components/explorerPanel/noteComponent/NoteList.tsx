"use client";
import { FileText } from "lucide-react";
import { useTapsContext } from "@/app/dashboard/providers";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { Dialog } from "@/components/ui/dialog";
import { DeleteModal } from "../../modals/DeleteModal";
import { updateNoteTitleRequest } from "@/lib/noteApi";
import { updateFoldersInQueryCache } from "@/lib/foldersAndNotesCache";
import { Note } from "./Note";

export default function NoteList({
  notes,
  level = 1,
  folderId,
}: {
  notes: NoteWithoutBody[];
  level: number;
  folderId: string;
}) {
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

      context.client.setQueryData(["foldersAndNotes"], (old: unknown) =>
        updateFoldersInQueryCache(old, (tree) => updateNameRecursive(tree)),
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

  return (
    <div>
      {notes.map((n) =>
        // show rename input if its in editmode
        editTitle === n.id ? (
          <div
            key={n.id}
            className="flex gap-2 w-full items-center"
            style={{ paddingLeft: 28 + level * 8 }}
          >
            <FileText className="w-4 h-4 shrink-0 text-neutral-500 dark:text-[#a1a1a1]" />
            <input
              className="pl-1 focus:outline-1 dark:focus:outline-neutral-500 focus:outline-neutral-800"
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
            <Note
              note={n}
              level={level}
              mutationToUpdateNoteTitle={mutationToUpdateNoteTitle}
              setDeleteAction={setDeleteAction}
              setEditTitle={setEditTitle}
              folderId={folderId}
            />
          </div>
        ),
      )}

      {/* dialog for deletion */}
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
