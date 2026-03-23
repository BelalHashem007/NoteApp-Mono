import UserProfile from "./UserProfile";
import FolderSearch from "./FolderSearch";
import FolderList from "./FolderList";
import { Folder, Settings, HelpCircle, LogOut } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { auth } from "@/auth";


export default async function LeftSideBar() {
    const sesstion = await auth();
    const res = await fetch("http://localhost:5262/folders", {
        headers:{
            "Authorization": `Bearer ${sesstion?.accessToken}`
        }
    });
    
    const folders = (await res.json()).data as Folder[]

    return (
        <div className="w-60 bg-muted border-r border-border flex flex-col">

            <UserProfile />

            <FolderSearch />

            <FolderList folders={folders} />

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
                <LogoutButton/>
            </div>
        </div>
    )
}