import { Suspense } from "react";
import NotesGrid from "./components/NotesGrid";
import NotesHeader from "./components/NotesHeader";
import Skeleton from "react-loading-skeleton";

export default async function DashboardView({ notes }: { notes: Note[] }) {
    return (

        <div className="flex-1 overflow-y-auto p-6">
            <NotesHeader notes={notes} />
            <NotesGrid notes={notes} />
        </div>
    )
}