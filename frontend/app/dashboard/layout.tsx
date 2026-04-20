import type { CSSProperties, ReactNode } from "react";
import LeftSideBar from "@/views/DashboardView/components/LeftSideBar";
import { TapProvider } from "./providers";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const sidebarLayoutStyle = {
  "--sidebar-width": "22rem",
} as CSSProperties;

export default function layout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <TapProvider>
      <SidebarProvider
        className="flex h-screen w-full bg-white dark:bg-neutral-950"
        style={sidebarLayoutStyle}
      >
        <LeftSideBar />
        <SidebarInset className="overflow-hidden flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-neutral-950">
          <header className="flex shrink-0 items-center gap-2 h-9 px-2 py-2">
            <SidebarTrigger />
          </header>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TapProvider>
  );
}
