"use client";
import { Folder, Edit2, StickyNote } from "lucide-react";
import { createFolder, createNote, updateFolder } from "@/actions/actions";
import { useTransition, useState, useRef, useEffect } from "react";
import { TailSpin } from "react-loader-spinner";
import { ApiError } from "@/actions/authActions";
import toast from "react-hot-toast";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => clearTimeout(t);
  }, []);

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
    <DialogContent className="sm:max-w-md">
      {/* Header */}
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
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

          {modalType === "folder"
            ? state === "create"
              ? "Create New Folder"
              : "Edit Folder"
            : "Create New Note"}
        </DialogTitle>
      </DialogHeader>

      {/* Content */}
      <form action={handleAction}>
        <input hidden name="folderId" value={folder?.id} readOnly />
        <input hidden name="parentId" value={parentId} readOnly />

        <div className="py-4">
          <label
            htmlFor="folderName"
            className="block text-sm mb-2 text-muted-foreground"
          >
            {modalType === "folder" ? "Folder Name" : "Note Title"}
          </label>

          <input
            ref={inputRef}
            id="folderName"
            type="text"
            name={modalType === "folder" ? "folderName" : "title"}
            defaultValue={
              modalType === "folder" ? (folder?.folderName ?? "") : ""
            }
            className="w-full h-11 bg-background border border-border px-3 rounded-md"
            maxLength={50}
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
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <button
              type="button"
              className="bg-muted hover:bg-muted/80 text-foreground h-10 px-6 rounded-md disabled:bg-[#e0e0e0] disabled:text-[#a1a1a1] disabled:opacity-70 disabled:border disabled:border-[#d1d1d1]"
              disabled={isPending}
            >
              Cancel
            </button>
          </DialogClose>

          <button
            disabled={isPending}
            type="submit"
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 gap-2 flex items-center justify-center rounded-md"
          >
            {isPending ? (
              <TailSpin width={"30"} height={30} color="#ffffff" />
            ) : modalType === "folder" ? (
              <>
                <Folder className="w-4 h-4" />
                {state === "create" ? "Create Folder" : "Save Changes"}
              </>
            ) : (
              <>
                <StickyNote className="w-4 h-4" />
                Create Note
              </>
            )}
          </button>
        </DialogFooter>
      </form>

      {error?.serverErrors && (
        <div className="text-red-500 text-sm mt-2">
          {error.serverErrors.message}
        </div>
      )}
    </DialogContent>
  );
}
