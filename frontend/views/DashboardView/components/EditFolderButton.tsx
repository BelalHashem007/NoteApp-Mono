'use client'
import { Edit2 } from "lucide-react"
import { useState } from "react"
import FolderModal from "./FolderModal";

export default function EditFolderButton({folder}:{folder:Folder}) {
    const [showModal, setShowModal] = useState<boolean>(false);

    function onClose(){
        setShowModal(false)
    }
    return (
        <>
            <button
                className="w-7 h-7 rounded hover:bg-muted flex items-center justify-center transition-colors"
                title="Edit folder"
                onClick={()=> setShowModal(true)}
            >
                <Edit2 className="w-3.5 h-3.5" />
            </button>
            {showModal && <FolderModal onClose={onClose} state="edit" folder={folder}/>}
        </>
    )
}