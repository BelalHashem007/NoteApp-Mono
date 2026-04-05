import LeftSideBar from "@/views/DashboardView/components/LeftSideBar";
import { TapProvider } from "./providers";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TapProvider>
      <div className="min-h-screen w-full flex bg-background">
        <LeftSideBar />
        <div className="flex-1 flex flex-col relative">{children}</div>
      </div>
    </TapProvider>
  );
}
