"use client";
import { Folder, X, Edit2, StickyNote } from "lucide-react";
import { createFolder, createNote, updateFolder } from "@/actions/actions";
import { useTransition, useState, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import { ApiError } from "@/actions/authActions";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
  state: "create" | "edit";
  folder?: Folder;
  parentId?: string;
  modalType: "folder" | "note";
}

export default function CreationAndEditModal({
  onClose,
  state,
  folder,
  parentId,
  modalType,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleClickOutside);
    };
  }, [onClose]);

  async function handleAction(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const result =
        modalType === "folder"
          ? state === "create"
            ? await createFolder(undefined, formData)
            : await updateFolder(undefined, formData)
          : await createNote(undefined, formData);

      if (result?.serverErrors || result?.validationErrors) {
        setError(result);
      } else {
        onClose();
        if (state === "create") toast.success("Folder Created Successfully");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {modalType === "folder" ? (
                state === "create" ? (
                  <Folder className="w-5 h-5 text-primary" />
                ) : (
                  <Edit2 className="w-5 h-5 text-primary" />
                )
              ) : (
                <StickyNote className="w-5 h-5 text-primary" />
              )}
            </div>
            <h2 className="text-xl">
              {modalType === "folder"
                ? state === "create"
                  ? "Create New Folder"
                  : "Edit Folder"
                : "Create New Note"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <form action={handleAction}>
          <input hidden name="folderId" value={folder?.id} readOnly />
          <input hidden name="parentId" value={parentId} readOnly />

          <div className="p-6">
            <label
              htmlFor="folderName"
              className="block text-sm mb-2 text-muted-foreground"
            >
              {modalType === "folder" ? "Folder Name" : "Note Title"}
            </label>
            <input
              id="folderName"
              type="text"
              name={modalType === "folder" ? "folderName" : "title"}
              defaultValue={
                modalType === "folder" ? (folder?.folderName ?? "") : ""
              }
              className="w-full h-11 bg-background border-border px-3"
              maxLength={50}
              autoFocus
              required
            />
            {error?.validationErrors?.map(
              (err, i) =>
                err.path[0] === "folderName" ||
                (err.path[0] === "title" && (
                  <div key={i} className="text-red-500 text-sm mt-2">
                    {err.message}
                  </div>
                )),
            )}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="bg-muted hover:bg-muted/80 text-foreground h-10 px-6 rounded-md
                                        disabled:bg-[#e0e0e0] disabled:text-[#a1a1a1] disabled:opacity-70 disabled:border disabled:border-[#d1d1d1]"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              disabled={isPending}
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 gap-2 flex items-center justify-center rounded-md 
                            "
            >
              {isPending ? (
                <TailSpin width={"30"} height={30} color="#ffffff" />
              ) : modalType === "folder" ? (
                <>
                  <Folder className="w-4 h-4" />{" "}
                  {state === "create" ? "Create Folder" : "Save Changes"}
                </>
              ) : (
                <>
                  <StickyNote className="w-4 h-4" />
                  Create Note
                </>
              )}
            </button>
          </div>
        </form>
        {error?.serverErrors && (
          <div className="text-red-500 text-sm">
            {error.serverErrors.message}
          </div>
        )}
      </div>
    </div>
  );
}
