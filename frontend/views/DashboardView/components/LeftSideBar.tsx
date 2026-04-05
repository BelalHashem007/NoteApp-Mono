import { Settings, Files, User } from "lucide-react";
import LogoutButton from "./LogoutButton";
import FolderDataLayer from "./folderComponents/FolderDataLayer";
import { Suspense } from "react";
import FolderComponentSkeleton from "@/components/placeholders/FolderComponentSkeleton";

export default async function LeftSideBar() {
  return (
    <div className="min-w-100 bg-muted border-r border-border flex max-h-screen ">
      <div className="w-12 bg-card border-r border-border flex flex-col items-center py-3">
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors mb-1 ${
            true
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Explorer"
        >
          <Files className="w-5 h-5" />
        </button>
        <div className="flex-1" />

        <button
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors mb-1 ${
            false
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Account"
        >
          <User className="w-5 h-5" />
        </button>
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
            false
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="pb-4 space-y-1 grow">
        <LogoutButton />
        <div className="h-9 px-4 flex items-center justify-between text-foreground/70 text-xs font-semibold uppercase tracking-wider">
          <span>Explorer</span>
        </div>
        {/* Folders and notes */}
        <Suspense fallback={<FolderComponentSkeleton />}>
          <FolderDataLayer />
        </Suspense>
      </div>
    </div>
  );
}
