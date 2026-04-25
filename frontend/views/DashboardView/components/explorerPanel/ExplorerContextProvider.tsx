"use client";
import {
  useState,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
} from "react";
import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { createFolderRequest, updateFolderRequest } from "@/lib/folderApi";
import { createNoteRequest } from "@/lib/noteApi";
import toast from "react-hot-toast";
import { updateFoldersInQueryCache } from "@/lib/foldersAndNotesCache";

export type ActiveAction =
  | null
  | { type: "createNote"; folder: FolderWithNotes }
  | { type: "createFolder"; parentId?: string }
  | { type: "renameFolder"; folder: FolderWithNotes }
  | { type: "delete"; folder: FolderWithNotes };

export type ActiveItem = {
  type: "folder" | "note";
  folderId: string;
  noteId?: string;
} | null;

export type ExplorerContext = {
  activeAction: ActiveAction;
  setActiveAction: Dispatch<SetStateAction<ActiveAction>>;
  openFolders: string[];
  setOpenFolders: Dispatch<SetStateAction<string[]>>;
  activeItem: ActiveItem;
  setActiveItem: Dispatch<SetStateAction<ActiveItem>>;
  createFolder: UseMutationResult<
    unknown,
    Error,
    {
      folderName: string;
      parentId?: string;
    },
    {
      previousFolders: unknown;
    }
  >;
  updateFolder: UseMutationResult<
    void,
    Error,
    Folder,
    {
      previousFolders: unknown;
    }
  >;
  createNote: UseMutationResult<
    unknown,
    Error,
    {
      folderId: string;
      title: string;
    },
    {
      previousFolders: unknown;
    }
  >;
};

const ExplorerContext = createContext<ExplorerContext | undefined>(undefined);

export const useExplorerContext = () => {
  const context = useContext(ExplorerContext);
  if (!context) throw new Error("Explorer context is null");
  return context;
};

export function ExplorerContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openFolders, setOpenFolders] = useState<string[]>([]);
  const [activeAction, setActiveAction] = useState<ActiveAction>(null);
  const [activeItem, setActiveItem] = useState<ActiveItem>(null);

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

      context.client.setQueryData(["foldersAndNotes"], (old: unknown) =>
        updateFoldersInQueryCache(old, (tree) => createFolderRecursion(tree)),
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

  const mutationToUpdateFolder = useMutation({
    mutationFn: (updatedFolder: Folder) => {
      return updateFolderRequest(updatedFolder);
    },
    onMutate: async (updatedFolder, context) => {
      await context.client.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousFolders = context.client.getQueryData(["foldersAndNotes"]);

      const updateNameRecursive = (
        list: FolderWithNotes[],
      ): FolderWithNotes[] => {
        return list.map((f) => {
          if (f.id === updatedFolder.id) {
            return { ...f, folderName: updatedFolder.folderName };
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

      setActiveAction(null);
      return { previousFolders };
    },
    onError: (err, updatedFolder, onMutateResult, context) => {
      context.client.setQueryData(
        ["foldersAndNotes"],
        onMutateResult?.previousFolders,
      );
      toast.error("Failed to update foldername");
      console.error(err);
    },
    onSuccess: () => {
      toast.success("FolderName update is successful");
    },
    onSettled: (data, error, updatedFolder, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });

  const mutationToCreateNote = useMutation({
    mutationFn: ({ folderId, title }: { folderId: string; title: string }) => {
      return createNoteRequest(folderId, title);
    },
    onMutate: async ({ folderId, title }, context) => {
      await context.client.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousFolders = context.client.getQueryData(["foldersAndNotes"]);

      const createNoteRecursive = (
        list: FolderWithNotes[],
      ): FolderWithNotes[] => {
        return list.map((f) => {
          if (f.id === folderId) {
            return {
              ...f,
              notes: [
                ...f.notes,
                {
                  id: crypto.randomUUID(),
                  title,
                  slug: "",
                  tags: [],
                },
              ],
            };
          }
          if (f.subFolders) {
            return { ...f, subFolders: createNoteRecursive(f.subFolders) };
          }
          return f;
        });
      };

      context.client.setQueryData(["foldersAndNotes"], (old: unknown) =>
        updateFoldersInQueryCache(old, (tree) => createNoteRecursive(tree)),
      );

      return { previousFolders };
    },
    onError: (err, updatedFolder, onMutateResult, context) => {
      context.client.setQueryData(
        ["foldersAndNotes"],
        onMutateResult?.previousFolders,
      );
      toast.error("Failed to create note");
      console.error(err);
    },
    onSuccess: () => {
      toast.success("Note creation is successful");
    },
    onSettled: (data, error, updatedFolder, onMutateResult, context) => {
      context.client.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });

  return (
    <ExplorerContext
      value={{
        activeAction,
        setActiveAction,
        openFolders,
        setOpenFolders,
        activeItem: activeItem,
        setActiveItem: setActiveItem,
        createFolder: mutationToCreateFolder,
        createNote: mutationToCreateNote,
        updateFolder: mutationToUpdateFolder,
      }}
    >
      {children}
    </ExplorerContext>
  );
}
