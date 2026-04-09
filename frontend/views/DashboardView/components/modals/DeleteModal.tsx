"use client";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteNote } from "@/actions/actions";
import { deleteFolderRequest } from "@/lib/folderApi";
import { TailSpin } from "react-loader-spinner";
import toast from "react-hot-toast";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { useTapsContext } from "@/app/dashboard/providers";
import { usePathname, useRouter } from "next/navigation";
import { OpenedNote } from "@/app/dashboard/providers";

interface DeleteFolderModalProps {
  onClose: () => void;
  folder?: FolderWithNotes;
  note?: NoteWithoutBody;
}

export function DeleteModal({ onClose, folder, note }: DeleteFolderModalProps) {
  const { openedNotes, setOpenedNotes } = useTapsContext();
  const router = useRouter();
  const path = usePathname();

  const mutatuionToDeleteFolder = useMutation({
    mutationFn: (folderToDelete: FolderWithNotes) => {
      return deleteFolderRequest(folderToDelete);
    },
    onMutate: async (folderToDelete, context) => {
      await context.client.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousFolders = context.client.getQueryData(["foldersAndNotes"]);

      const deleteFolderRecursive = (
        list: FolderWithNotes[],
      ): FolderWithNotes[] => {
        return list.filter((f) => {
          if (f.id === folderToDelete.id) {
            return false;
          }
          if (f.subFolders) {
            return deleteFolderRecursive(f.subFolders);
          }
          return true;
        });
      };

      context.client.setQueryData(
        ["foldersAndNotes"],
        (old: ApiResponse<FolderWithNotes[]>) => ({
          ...old,
          data: deleteFolderRecursive(old.data ?? []),
        }),
      );

      return { previousFolders };
    },
    onSuccess: (data, folderToDelete) => {
      const notesToDeleteSlugs = new Set(
        folderToDelete.notes.map((n) => n.slug),
      );

      if (notesToDeleteSlugs.size > 0) {
        const remainingNotes = openedNotes.filter(
          (note) => !notesToDeleteSlugs.has(note.slug),
        );

        const currentSlug = path.split("/").pop();
        const isCurrentNoteDeleted = notesToDeleteSlugs.has(currentSlug ?? "");

        setOpenedNotes(remainingNotes);

        if (isCurrentNoteDeleted) {
          const nextPath =
            remainingNotes.length > 0
              ? `/dashboard/note/${remainingNotes[0].slug}`
              : "/dashboard";
          router.push(nextPath);
        }
      }
      onClose();
      toast.success("Folder is deleted");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to delete folder");
    },
    onSettled: (data, error, updatedFolder, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });

  const mutatuionToDeleteNote = useMutation({
    mutationFn: (noteToDelete: NoteWithoutBody) => {
      return deleteNote(noteToDelete);
    },
    onMutate: async (noteToDelete, context) => {
      await context.client.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousFolders = context.client.getQueryData(["foldersAndNotes"]);

      const deleteNoteRecursive = (
        list: FolderWithNotes[],
      ): FolderWithNotes[] => {
        return list.map((f) => {
          if (f.notes.find((x) => x.id === noteToDelete.id)) {
            return {
              ...f,
              notes: f.notes.filter((x) => {
                if (x.id === noteToDelete.id) return false;
                else return true;
              }),
            };
          }
          if (f.subFolders) {
            return { ...f, subFolders: deleteNoteRecursive(f.subFolders) };
          }
          return f;
        });
      };

      context.client.setQueryData(
        ["foldersAndNotes"],
        (old: ApiResponse<FolderWithNotes[]>) => ({
          ...old,
          data: deleteNoteRecursive(old.data ?? []),
        }),
      );

      return { previousFolders };
    },
    onSuccess: (data, noteToDelete) => {
      if (openedNotes.find((x) => x.slug === noteToDelete.slug)) {
        const updatedNotes = openedNotes.filter(
          (x) => x.slug !== noteToDelete.slug,
        );
        setOpenedNotes(updatedNotes);
        if (path.split("/").pop() === noteToDelete.slug) {
          router.push(
            updatedNotes.length > 0
              ? `/dashboard/note/${updatedNotes[0].slug}`
              : "/dashboard",
          );
        }
      }
      onClose();
      toast.success("note is deleted");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to delete note");
    },
    onSettled: (data, error, updatedFolder, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });

  return (
    <DialogContent className="sm:max-w-md">
      {/* Header */}
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center rel">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <span className="text-xl">
            {folder ? "Delete Folder" : "Delete Note"}
          </span>
        </DialogTitle>
      </DialogHeader>
      {/* Content */}
      <div className="flex flex-col gap-1">
        <p className="text-foreground/80 mb-4">
          Are you sure you want to delete {folder ? " folder " : " note "}
          {folder ? (
            <span className="font-medium text-foreground">
              &quot;{folder?.folderName}&quot;
            </span>
          ) : (
            <span className="font-medium text-foreground">
              &quot;{note?.title}&quot;
            </span>
          )}
          ?
        </p>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone.{" "}
          {folder && (
            <>
              <span>All the notes inside will also be</span>{" "}
              <em>
                <strong>deleted</strong>
              </em>
            </>
          )}
        </p>
      </div>

      {/* Footer */}
      <DialogFooter>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (folder) mutatuionToDeleteFolder.mutate(folder);
            else if (note) mutatuionToDeleteNote.mutate(note);
          }}
        >
          <div className="flex items-center justify-end gap-3">
            <DialogClose asChild>
              <button
                disabled={
                  mutatuionToDeleteFolder.isPending ||
                  mutatuionToDeleteNote.isPending
                }
                type="button"
                className="bg-muted hover:bg-muted/80 text-foreground h-10 px-6 rounded-md
                        disabled:bg-[#e0e0e0] disabled:text-[#a1a1a1] disabled:opacity-70 disabled:border disabled:border-[#d1d1d1]"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              disabled={
                mutatuionToDeleteFolder.isPending ||
                mutatuionToDeleteNote.isPending
              }
              type="submit"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 px-6 gap-2 flex items-center justify-center rounded-md "
            >
              {mutatuionToDeleteFolder.isPending ||
              mutatuionToDeleteNote.isPending ? (
                <TailSpin width={"30"} height={30} color="#ffffff" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />{" "}
                  {folder ? "Delete Folder" : "Delete Note"}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogFooter>
    </DialogContent>
  );
}
