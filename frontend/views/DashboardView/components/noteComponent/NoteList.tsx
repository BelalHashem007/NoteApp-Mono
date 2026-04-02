import { StickyNote } from "lucide-react";
import Link from "next/link";

export default function NoteList({
  notes,
  level = 0,
}: {
  notes: NoteWithoutBody[];
  level: number;
}) {
  console.log(notes);
  return (
    <div>
      {notes.map((n) => (
        <Link
          key={n.id}
          className="flex gap-2 hover:bg-gray-200 w-full"
          style={{ paddingLeft: 24 + level * 16 }}
          href={`/dashboard/note/${n.slug}`}
        >
          <StickyNote className=" text-primary" /> {n.title}
        </Link>
      ))}
    </div>
  );
}
