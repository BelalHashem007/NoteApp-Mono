import { StickyNote } from "lucide-react";

export default function NoteList({ notes }: { notes: NoteWithoutBody[] }) {
  return (
    <div>
      {notes.map((n) => (
        <button key={n.id} className="flex gap-2 pl-4 hover:bg-gray-200 w-full">
          <StickyNote className=" text-primary" /> {n.title}
        </button>
      ))}
    </div>
  );
}
