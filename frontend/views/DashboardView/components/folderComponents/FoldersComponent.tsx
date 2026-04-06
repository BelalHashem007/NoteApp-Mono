"use client";
import FolderList from "./FolderList";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import CreationAndEditModal from "../modals/CreationAndEditModal";
import { Dialog } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useFetchWrapperClient } from "@/lib/fetchWrapperClient";
import FolderComponentSkeleton from "@/components/placeholders/FolderComponentSkeleton";

export default function FoldersComponent({}) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const fetchClient = useFetchWrapperClient();
  const {
    data: result,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["foldersAndNotes"],
    queryFn: async ({ signal }) => {
      return fetchClient(`http://localhost:5001/api/Folders/GetAllItems`, {
        signal,
      });
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

      <FolderList folders={result.data as FolderWithNotes[]} level={0} />

      <Dialog
        open={showModal}
        onOpenChange={(open) => {
          if (!open) setShowModal(false);
        }}
      >
        <CreationAndEditModal
          onClose={() => {
            setShowModal(false);
          }}
          state="create"
          modalType="folder"
        />
      </Dialog>
      <ContextMenu>
        <ContextMenuTrigger className="grow"></ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => setShowModal(true)}>
            New Folder...
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
