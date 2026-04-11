import { Settings, Files } from "lucide-react";
import AccountComponent from "./AccountComponent";
import ExplorerSection from "./ExplorerSection";

export default function LeftSideBar() {
  return (
    <div className="lg:min-w-100 min-w-min bg-muted flex max-h-screen ">
      <div className="p-2 bg-neutral shadow-accent-foreground border-border flex flex-col items-center py-3">
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors mb-1 ${
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
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            false
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <ExplorerSection />
    </div>
  );
}
