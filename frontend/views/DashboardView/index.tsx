import LeftSideBar from "./components/LeftSideBar";
import MainContent from "./components/MainContent";

export default function DashboardView() {
    return (
        <div className="min-h-screen w-full flex bg-background">
            <LeftSideBar/>
            <MainContent/>
        </div>
    )
}