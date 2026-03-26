'use client'
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { DeleteFolderModal } from "./DeleteFolderModal";

export default function DeleteFolderButton({folder}:{folder:Folder}) {
    const [showModal, setShowModal] = useState<boolean>(false);

    function onClose(){
        setShowModal(false);
    }

    return (
        <>
            <button
                className="w-7 h-7 rounded hover:bg-destructive/10 flex items-center justify-center transition-colors text-destructive"
                title="Delete folder"
                onClick={()=> setShowModal(true)}
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
            {showModal && <DeleteFolderModal folder={folder} onClose={onClose}/>}
        </>
    )
}