"use client"
import UserProfile from "./UserProfile";
import FolderSearch from "./FolderSearch";
import FolderList from "./FolderList";
import {Folder, Settings, HelpCircle } from "lucide-react"
import { useState } from "react";

const folders: Folder[] = [
        { id: "work", name: "Work", icon: "📁" },
        { id: "personal", name: "Personal", icon: "👤" },
        { id: "ideas", name: "Ideas", icon: "💡" },
        { id: "archive", name: "Archive", icon: "📦" },
];

export default function LeftSideBar(){
    const [selectedFolder, setSelectedFolder] = useState("work");
    const currentFolder = folders.find((f) => f.id === selectedFolder);

    return (
        <div className="w-60 bg-muted border-r border-border flex flex-col">

                <UserProfile/>

               <FolderSearch/>

                <FolderList folders={folders} selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder}/>

                <div className="p-3 border-t border-border">
                    <button className="w-full rounded-md px-4 py-2 flex justify-center items-center bg-primary hover:bg-primary/90 text-primary-foreground h-10 gap-2">
                        <Folder className="w-4 h-4" />
                        Create Folder
                    </button>
                </div>

                <div className="px-3 pb-4 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:bg-background hover:text-foreground transition-colors text-sm">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:bg-background hover:text-foreground transition-colors text-sm">
                        <HelpCircle className="w-4 h-4" />
                        Help Center
                    </button>
                </div>
            </div>
    )
}