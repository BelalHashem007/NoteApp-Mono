import UserProfile from "./UserProfile";
import { Settings, HelpCircle, Search, FolderOpen } from "lucide-react";
import LogoutButton from "./LogoutButton";
import CreateFolderButton from "./CreateFolderButton";
import FolderDataLayer from "./FolderDataLayer";
import { Suspense } from "react";
import FolderComponentSkeleton from "@/components/placeholders/FolderComponentSkeleton";

export default async function LeftSideBar() {
  return (
    <div className="min-w-100 bg-muted border-r border-border flex flex-col max-h-screen ">
      {/* <UserProfile /> */}

      {/* <CreateFolderButton />

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
      </div> */}

      {/* File Explorer + Search */}
      <div className="p-4">
        <button className="flex gap-2 text-lg items-center p-4 pl-8 w-full border-l-6 border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]">
          <FolderOpen /> Explorer
        </button>
        <button className="flex gap-2 text-lg items-center p-4 pl-8">
          <Search /> Search
        </button>
      </div>
      <hr />

      {/* Folders and notes */}
      <Suspense fallback={<FolderComponentSkeleton />}>
        <FolderDataLayer />
      </Suspense>
    </div>
  );
}
