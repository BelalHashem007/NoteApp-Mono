"use client";
import FolderList from "./FolderList";
import { useState, useRef, useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import FolderComponentSkeleton from "@/components/placeholders/FolderComponentSkeleton";
import { ChevronRight, FolderClosed } from "lucide-react";
import { createFolderRequest } from "@/lib/folderApi";
import toast from "react-hot-toast";

export default function FoldersComponent({}) {
  const [showFolderCreationInput, setShowFolderCreationInput] =
    useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showFolderCreationInput) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [showFolderCreationInput]);

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

  const {
    data: result,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["foldersAndNotes"],
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/folders`, {
        signal,
      });

      if (!res.ok) throw Error("Failed to fetch folders");

      return res.json();
    },
  });

  if (isPending) return <FolderComponentSkeleton />;

  if (isError) {
    console.error(error);
    return <div>Failed to fetch folders</div>;
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* <FolderSearch query={query} setQuery={setQuery} /> */}

      <FolderList
        folders={result.data as FolderWithNotes[]}
        level={0}
        onCreateFolder={mutationToCreateFolder.mutate}
      />

      {showFolderCreationInput && (
        <div className="pl-2 flex gap-2 items-center w-full">
          <ChevronRight className="w-3 h-3" />
          <FolderClosed className="w-4 h-4 shrink-0 text-accent" />
          <input
            className="pl-1"
            type="text"
            ref={inputRef}
            minLength={1}
            maxLength={50}
            onBlur={(e) => {
              if (e.target.value.length === 0)
                return setShowFolderCreationInput(false);
              mutationToCreateFolder.mutate({ folderName: e.target.value });
              setShowFolderCreationInput(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
              if (e.key === "Escape") setShowFolderCreationInput(false);
            }}
          />
        </div>
      )}
      <ContextMenu>
        <ContextMenuTrigger className="grow"></ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setShowFolderCreationInput(true)}>
            New Folder...
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
