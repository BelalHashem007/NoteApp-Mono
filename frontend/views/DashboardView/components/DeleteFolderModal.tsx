'use client'
import { X, Trash2, AlertTriangle } from "lucide-react";
import { useTransition } from "react";
import { deleteFolder } from "@/actions/folderActions";
import { TailSpin } from "react-loader-spinner";
import toast from "react-hot-toast";

interface DeleteFolderModalProps {
  onClose: () => void;
  folder: Folder
}

export function DeleteFolderModal({ onClose, folder }: DeleteFolderModalProps) {

  const [isPending, startTransition] = useTransition();

  async function handleAction(formData: FormData) {

    startTransition(async () => {
      await deleteFolder(formData);

      onClose();
      toast.success("Folder Deleted Successfuly")
    });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-xl">Delete Folder</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground/80 mb-4">
            Are you sure you want to delete the folder{" "}
            <span className="font-medium text-foreground">&quot;{folder.folderName}&quot;</span>?
          </p>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All the notes inside will also be <em><strong>deleted</strong></em>
          </p>
        </div>

        {/* Footer */}
        <form action={handleAction}>
         <input hidden name="id" value={folder?.id} readOnly/>
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <button
              disabled={isPending}
              type="button"
              onClick={onClose}
              className="bg-muted hover:bg-muted/80 text-foreground h-10 px-6 rounded-md
                        disabled:bg-[#e0e0e0] disabled:text-[#a1a1a1] disabled:opacity-70 disabled:border disabled:border-[#d1d1d1]"
            >
              Cancel
            </button>
            <button
              disabled={isPending}
              type="submit"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-10 px-6 gap-2 flex items-center justify-center rounded-md "
            >
              <Trash2 className="w-4 h-4" />
              {isPending ? <TailSpin width={"30"} height={30} color="#ffffff"/> : "Delete Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}