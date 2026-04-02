import NotesHeader from "./components/noteComponent/NotesHeader";

export default async function DashboardView({ notes }: { notes: Note[] }) {
  return (
    <div>
      <NotesHeader notes={notes} /> <p>Open a note to continue</p>
    </div>
  );
}
