"use client";
import { Trash2, AlertTriangle } from "lucide-react";
import { useTransition } from "react";
import { deleteFolder } from "@/actions/actions";
import { TailSpin } from "react-loader-spinner";
import toast from "react-hot-toast";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteFolderModalProps {
  onClose: () => void;
  folder: Folder | FolderWithNotes;
}

export function DeleteFolderModal({ onClose, folder }: DeleteFolderModalProps) {
  const [isPending, startTransition] = useTransition();

  async function handleAction(formData: FormData) {
    startTransition(async () => {
      await deleteFolder(formData);

      onClose();
      toast.success("Folder Deleted Successfuly");
    });
  }
  return (
    <DialogContent className="sm:max-w-md">
      {/* Header */}
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center rel">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <span className="text-xl">Delete Folder</span>
        </DialogTitle>
      </DialogHeader>
      {/* Content */}
      <div className="flex flex-col gap-1">
        <p className="text-foreground/80 mb-4">
          Are you sure you want to delete the folder{" "}
          <span className="font-medium text-foreground">
            &quot;{folder.folderName}&quot;
          </span>
          ?
        </p>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone. All the notes inside will also be{" "}
          <em>
            <strong>deleted</strong>
          </em>
        </p>
      </div>

      {/* Footer */}
      <DialogFooter>
        <form action={handleAction}>
          <input hidden name="id" value={folder?.id} readOnly />
          <div className="flex items-center justify-end gap-3">
            <DialogClose asChild>
              <button
                disabled={isPending}
                type="button"
                className="bg-muted hover:bg-muted/80 text-foreground h-10 px-6 rounded-md
                        disabled:bg-[#e0e0e0] disabled:text-[#a1a1a1] disabled:opacity-70 disabled:border disabled:border-[#d1d1d1]"
              >
                Cancel
              </button>
            </DialogClose>
            <button
              disabled={isPending}
              type="submit"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 px-6 gap-2 flex items-center justify-center rounded-md "
            >
              {isPending ? (
                <TailSpin width={"30"} height={30} color="#ffffff" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Delete Folder
                </>
              )}
            </button>
          </div>
        </form>
      </DialogFooter>
    </DialogContent>
  );
}
