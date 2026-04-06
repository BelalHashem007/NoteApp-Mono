"use client";
import { useTapsContext } from "@/app/dashboard/providers";
import Link from "next/link";
import { FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NoteTappedNavigation({ note }: { note?: Note }) {
  const { openedNotes, setOpenedNotes } = useTapsContext();
  const router = useRouter();

  useEffect(() => {
    const handleLocalStorage = () => {
      if (note && !openedNotes.find((x) => x.slug === note.slug)) {
        setOpenedNotes((prev) => [
          ...prev,
          { slug: note.slug, title: note.title },
        ]);
      }
    };
    handleLocalStorage();
  }, [setOpenedNotes, note]);

  return (
    <div className="h-9 bg-muted/30 border-b border-border flex items-center overflow-x-auto">
      {openedNotes.map((openedNote) => {
        return (
          <div
            key={openedNote.slug}
            className={`group h-full flex items-center gap-2 border-r border-border cursor-pointer min-w-30 max-w-50 ${
              note?.slug === openedNote.slug
                ? "bg-background text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Link
              href={`/dashboard/note/${openedNote.slug}`}
              className="pl-3 flex w-full gap-2 h-full items-center justify-center"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span className="text-xs truncate flex-1">
                {openedNote.title}
              </span>
            </Link>
            <button
              onClick={() => {
                const updated = openedNotes.filter(
                  (n) => n.slug !== openedNote.slug,
                );
                setOpenedNotes(updated);
                if (openedNote.slug === note?.slug) {
                  if (updated.length > 0) {
                    router.push(`/dashboard/note/${updated[0].slug}`);
                  } else {
                    router.push("/dashboard");
                  }
                }
              }}
              className="mr-3 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-muted rounded transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
