"use client";

import { Files, Search } from "lucide-react";
import AccountComponent from "./AccountComponent";
import ExplorerPanel from "./explorerPanel/ExplorerPanel";
import { useState } from "react";
import SearchSection from "./searchPanel/SearchPanel";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

function activityButtonClass(active: boolean) {
  return cn(
    "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
    active
      ? "bg-neutral-700 text-neutral-100 dark:bg-neutral-600"
      : "text-muted-foreground hover:text-foreground",
  );
}

export default function LeftSideBar() {
  const [activePanel, setActivePanel] = useState<"explorer" | "search">(
    "explorer",
  );

  return (
    <Sidebar className="border-0">
      <div className="flex h-full min-h-0 w-full flex-1 flex-row">
        <div
          className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-sidebar-border bg-sidebar py-3"
          aria-label="Activity bar"
        >
          <button
            type="button"
            title="Explorer"
            className={activityButtonClass(activePanel === "explorer")}
            onClick={() => setActivePanel("explorer")}
          >
            <Files className="size-5" />
          </button>
          <button
            type="button"
            title="Search"
            className={activityButtonClass(activePanel === "search")}
            onClick={() => setActivePanel("search")}
          >
            <Search className="size-5" />
          </button>
          <div className="min-h-2 flex-1" />
          <AccountComponent
            triggerClassName={cn(activityButtonClass(false), "mb-0")}
          />
        </div>
        <SidebarContent className="min-w-0 flex-1 border-0 bg-neutral-50 dark:bg-neutral-900">
          <div className=" flex min-h-0 flex-1 flex-col overflow-hidden">
            {activePanel === "explorer" ? <ExplorerPanel /> : <SearchSection />}
          </div>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
