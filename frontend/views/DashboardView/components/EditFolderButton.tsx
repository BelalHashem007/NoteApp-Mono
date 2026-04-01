"use client";
import { useState } from "react";
import FolderModal from "./FolderModal";
import { createPortal } from "react-dom";

export default function EditFolderButton({
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
        className=" w-full h-full text-start hover:bg-white p-2 hover:cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        Rename
      </button>
      {showModal &&
        createPortal(
          <FolderModal onClose={onClose} state="edit" folder={folder} />,
          document.body,
        )}
    </>
  );
}
