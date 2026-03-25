"use client"
import { Folder } from "lucide-react"
import { useState } from "react"
import CreateFolderModal from "./CreateFolderModal";

export default function CreateFolderButton() {
    const [showModal, setShowModal] = useState<boolean>(false);
    
    function handleOnClose(){
        setShowModal(false)
    }

    return (
        <div className="p-3 border-t border-border">
            <button 
            onClick={()=>setShowModal(true)}
            className="w-full rounded-md px-4 py-2 flex justify-center items-center bg-primary hover:bg-primary/90 text-primary-foreground h-10 gap-2">
                <Folder className="w-4 h-4" />
                Create Folder
            </button>
            {showModal && <CreateFolderModal onClose={handleOnClose}/>}
        </div>

    )
}