"use client";

import { Settings, Files, Search } from "lucide-react";
import AccountComponent from "./AccountComponent";
import ExplorerPanel from "./ExplorerPanel";
import { useState } from "react";
import SearchSection from "./SearchSection";

export default function LeftSideBar() {
  const [activePanel, setActivePanel] = useState<"explorer" | "search">(
    "explorer",
  );
  return (
    <div className="lg:min-w-100 min-w-min bg-muted flex h-full max-h-screen max-w-100 shrink-0 min-h-0">
      <div className="p-2 bg-neutral shadow-accent-foreground border-border flex flex-col items-center py-3">
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors mb-1 ${
            activePanel === "explorer"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Explorer"
          type="button"
          onClick={() => setActivePanel("explorer")}
        >
          <Files className="w-5 h-5" />
        </button>
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors mb-1 ${
            activePanel === "search"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          title="Search"
          type="button"
          onClick={() => setActivePanel("search")}
        >
          <Search className="w-5 h-5" />
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
          type="button"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {activePanel === "explorer" ? (
        <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
          <ExplorerPanel />
        </div>
      ) : (
        <SearchSection />
      )}
    </div>
  );
}
