import LeftSideBar from "@/views/DashboardView/components/LeftSideBar";
import TopBar from "@/views/DashboardView/components/TopBar";
import AuthProvider from "@/views/AuthView/components/AuthProvider";

export default function layout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen w-full flex bg-background">
            <LeftSideBar />
            <div className="flex-1 flex flex-col">
                <TopBar/>
                <AuthProvider>{children}</AuthProvider>
            </div>
        </div>
    )
}