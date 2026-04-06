import { Settings, Files } from "lucide-react";
import AccountComponent from "./AccountComponent";
import FoldersComponent from "./folderComponents/FoldersComponent";

export default async function LeftSideBar() {
  return (
    <div className="lg:min-w-100 min-w-min bg-muted border-r border-border flex max-h-screen ">
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
        <AccountComponent />
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
        <div className="h-9 px-4 flex items-center justify-between text-foreground/70 text-xs font-semibold uppercase tracking-wider">
          <span>Explorer</span>
        </div>
        {/* Folders and notes */}
        <FoldersComponent />
      </div>
    </div>
  );
}
