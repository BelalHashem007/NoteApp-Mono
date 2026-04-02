import NotesGrid from "./components/noteComponent/NotesGrid";
import NotesHeader from "./components/noteComponent/NotesHeader";

export default async function DashboardView({ notes }: { notes: Note[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <NotesHeader notes={notes} />
      <NotesGrid notes={notes} />
    </div>
  );
}
