import UserProfile from "./UserProfile";
import { Settings, HelpCircle } from "lucide-react";
import LogoutButton from "./LogoutButton";
import CreateFolderButton from "./CreateFolderButton";
import FolderDataLayer from "./FolderDataLayer";
import { Suspense } from "react";
import FolderComponentSkeleton from "@/components/placeholders/FolderComponentSkeleton";


export default async function LeftSideBar() {

    return (
        <div className="min-w-100 bg-muted border-r border-border flex flex-col max-h-screen">

            <UserProfile />

            <Suspense fallback={<FolderComponentSkeleton/>}>
                <FolderDataLayer/>
            </Suspense>

            <CreateFolderButton />

            <div className="px-3 pb-4 space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:bg-background hover:text-foreground transition-colors text-sm">
                    <Settings className="w-4 h-4" />
                    Settings
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-foreground/70 hover:bg-background hover:text-foreground transition-colors text-sm">
                    <HelpCircle className="w-4 h-4" />
                    Help Center
                </button>
                <LogoutButton />
            </div>
        </div>
    )
}