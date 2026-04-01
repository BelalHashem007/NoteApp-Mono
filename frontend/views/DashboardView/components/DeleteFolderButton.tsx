"use client";
import { useState } from "react";
import { DeleteFolderModal } from "./DeleteFolderModal";
import { createPortal } from "react-dom";

export default function DeleteFolderButton({
  folder,
}: {
  folder: Folder | FolderWithNotes;
}) {
  const [showModal, setShowModal] = useState<boolean>(false);

  function onClose() {
    setShowModal(false);
  }

  return (
    <>
      <button
        className="w-full h-full text-start hover:bg-white p-2 hover:cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        Delete
      </button>
      {showModal &&
        createPortal(
          <DeleteFolderModal folder={folder} onClose={onClose} />,
          document.body,
        )}
    </>
  );
}
