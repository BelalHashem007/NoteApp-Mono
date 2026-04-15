"use client";
import { useTapsContext } from "@/app/dashboard/providers";
import Link from "next/link";
import { FileText, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { tagQuerySuffix } from "@/lib/tagQueryUrl";

function NoteTappedNavigationInner({ note }: { note?: Note }) {
  const { openedNotes, setOpenedNotes } = useTapsContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagSuffix = tagQuerySuffix(searchParams.getAll("tag"));

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
    <div className="h-9 border-b border-neutral-200 flex items-center overflow-x-auto">
      {openedNotes.map((openedNote) => {
        return (
          <div
            key={openedNote.slug}
            className={`group h-full flex items-center gap-2 border-r border-neutral-200 cursor-pointer min-w-30 max-w-50 ${
              note?.slug === openedNote.slug
                ? "bg-white text-neutral-950"
                : "bg-neutral-100 text-neutral-500 hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Link
              href={`/dashboard/note/${openedNote.slug}${tagSuffix}`}
              className="pl-3 flex w-full gap-2 h-full items-center justify-center"
            >
              <FileText className={`w-4 h-4 shrink-0 text-neutral-500`} />
              <span
                className={`text-xs truncate flex-1 text-black ${note?.slug === openedNote.slug ? "font-bold" : ""} `}
              >
                {openedNote.title}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => {
                const updated = openedNotes.filter(
                  (n) => n.slug !== openedNote.slug,
                );
                setOpenedNotes(updated);
                if (openedNote.slug === note?.slug) {
                  if (updated.length > 0) {
                    router.push(
                      `/dashboard/note/${updated[0].slug}${tagSuffix}`,
                    );
                  } else {
                    const base = "/dashboard";
                    router.push(tagSuffix ? `${base}${tagSuffix}` : base);
                  }
                }
              }}
              className="mr-3 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-muted rounded-full transition-all"
            >
              <X className="size-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default function NoteTappedNavigation({ note }: { note?: Note }) {
  return (
    <Suspense fallback={<div className="h-9 bg-muted/30 border-b" />}>
      <NoteTappedNavigationInner note={note} />
    </Suspense>
  );
}
