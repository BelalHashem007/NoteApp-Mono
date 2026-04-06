import LeftSideBar from "@/views/DashboardView/components/LeftSideBar";
import { TapProvider } from "./providers";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TapProvider>
      <div className="h-screen w-full flex bg-background overflow-hidden">
        <LeftSideBar />
        <main className="flex-1 flex flex-col min-h-0">{children}</main>
      </div>
    </TapProvider>
  );
}
