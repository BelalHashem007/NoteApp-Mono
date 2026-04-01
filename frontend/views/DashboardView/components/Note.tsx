import { Notebook } from "lucide-react";

export default function NoteList({ notes }: { notes: NoteWithoutBody[] }) {
  return (
    <div>
      {notes.map((n) => (
        <button key={n.id} className="flex gap-2">
          <Notebook /> {n.title}
        </button>
      ))}
    </div>
  );
}
