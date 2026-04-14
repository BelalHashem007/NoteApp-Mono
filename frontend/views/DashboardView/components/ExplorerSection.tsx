"use client";

import { CopyMinus, FolderPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { createFolderRequest } from "@/lib/folderApi";
import FoldersComponent from "./folderComponents/FoldersComponent";

export default function ExplorerSection() {
  const [showFolderCreationInput, setShowFolderCreationInput] =
    useState<boolean>(false);
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutationToCreateFolder = useMutation({
    mutationFn: ({
      folderName,
      parentId,
    }: {
      folderName: string;
      parentId?: string;
    }) => {
      return createFolderRequest(folderName, parentId);
    },
    onMutate: async ({ folderName, parentId }, context) => {
      await context.client.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousFolders = context.client.getQueryData(["foldersAndNotes"]);

      const createFolderRecursion = (
        folders: FolderWithNotes[],
      ): FolderWithNotes[] => {
        if (!parentId)
          return [
            ...folders,
            {
              id: crypto.randomUUID(),
              folderName,
              notes: [],
              createdAt: "",
              subFolders: [],
            },
          ];
        else
          return folders.map((f) => {
            if (f.subFolders && f.subFolders.length > 0) {
              if (f.id === parentId)
                return {
                  ...f,
                  subFolders: [
                    ...f.subFolders,
                    {
                      id: "123test123",
                      folderName,
                      notes: [],
                      createdAt: "",
                      subFolders: [],
                    },
                  ],
                };
              return {
                ...f,
                subFolders: createFolderRecursion(f.subFolders),
              };
            } else return f;
          });
      };

      context.client.setQueryData(
        ["foldersAndNotes"],
        (old: ApiResponse<FolderWithNotes[]>) => ({
          ...old,
          data: createFolderRecursion(old.data ?? []),
        }),
      );

      return { previousFolders };
    },
    onError: (err, updatedFolder, onMutateResult, context) => {
      context.client.setQueryData(
        ["foldersAndNotes"],
        onMutateResult?.previousFolders,
      );
      toast.error("Failed to create folder");
      console.error(err);
    },
    onSuccess: () => {
      toast.success("Folder creation is successful");
    },
    onSettled: (data, error, updatedFolder, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });

  return (
    <div className="pb-4 space-y-1 grow">
      <div className="h-9 px-4 flex items-center justify-between text-foreground/70 text-xs font-semibold uppercase tracking-wider">
        <span>Explorer</span>
        <div>
          <button
            type="button"
            title="Collapse Folders"
            className="p-1 hover:bg-primary/10 rounded-md"
            onClick={() => setOpenFolders([])}
          >
            <CopyMinus className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="p-1 hover:bg-primary/10 rounded-md"
            title="New Folder..."
            onClick={() => setShowFolderCreationInput(true)}
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <FoldersComponent
        onCreateFolder={mutationToCreateFolder.mutate}
        showFolderCreationInput={showFolderCreationInput}
        setShowFolderCreationInput={setShowFolderCreationInput}
        inputRef={inputRef}
        openFolders={openFolders}
        setOpenFolders={setOpenFolders}
      />
    </div>
  );
}
