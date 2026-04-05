"use client";
import { FileText } from "lucide-react";
import Link from "next/link";
import { useTapsContext } from "@/app/dashboard/providers";

export default function NoteList({
  notes,
  level = 1,
}: {
  notes: NoteWithoutBody[];
  level: number;
}) {
  const { setOpenedNotes } = useTapsContext();
  console.log(notes);
  return (
    <div>
      {notes.map((n) => (
        <Link
          key={n.id}
          className="flex gap-2 hover:bg-gray-200 w-full truncate items-center"
          style={{ paddingLeft: 28 + level * 8 }}
          href={`/dashboard/note/${n.slug}`}
          onClick={() => {
            setOpenedNotes((prev) => {
              if (prev.some((x) => x.slug === n.slug)) return prev;
              else return [...prev, n];
            });
          }}
        >
          <FileText className="w-4 h-4 shrink-0 text-primary" /> {n.title}
        </Link>
      ))}
    </div>
  );
}
