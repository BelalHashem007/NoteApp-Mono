import UserProfile from "./UserProfile";
import FolderSearch from "./FolderSearch";
import FolderList from "./FolderList";
import { Folder, Settings, HelpCircle, LogOut } from "lucide-react";
import LogoutButton from "./LogoutButton";
import { auth } from "@/auth";
import CreateFolderButton from "./CreateFolderButton";
import { requireAuth } from "@/helper/requireAuth";


export default async function LeftSideBar() {
    const session = await requireAuth();
    const res = await fetch("http://localhost:5001/api/folders", {
        headers:{
            "Authorization": `Bearer ${session?.accessToken}`
        }
    });
    console.log(session)
    
    const folders = (await res.json()).data as Folder[]

    return (
        <div className="w-60 bg-muted border-r border-border flex flex-col">

            <UserProfile />

            <FolderSearch />

            <FolderList folders={folders} />

           <CreateFolderButton/>

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