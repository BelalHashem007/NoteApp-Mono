"use client";

import { searchNotesRequest } from "@/lib/noteApi";
import { useQuery } from "@tanstack/react-query";
import { FileText, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { useTapsContext } from "@/app/dashboard/providers";

type HighlightRange =
  | {
      startIndex: number;
      endIndex: number;
    }
  | undefined;

function clampRange(text: string, range: HighlightRange) {
  if (!range) return null;
  const start = Math.max(0, Math.min(text.length, range.startIndex));
  const end = Math.max(start, Math.min(text.length, range.endIndex));
  return { start, end };
}

function HighlightedText({
  text,
  range,
}: {
  text: string;
  range: HighlightRange;
}) {
  const safe = clampRange(text, range);
  if (!safe || safe.start === safe.end) return <>{text}</>;
  const before = text.slice(0, safe.start);
  const match = text.slice(safe.start, safe.end);
  const after = text.slice(safe.end);
  return (
    <>
      {before}
      <mark className="bg-primary/20 text-foreground rounded px-0.5 truncate">
        {match}
      </mark>
      {after}
    </>
  );
}

export default function SearchSection() {
  const { setOpenedNotes } = useTapsContext();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = debouncedQuery.trim();

  const { data, isFetching, isError } = useQuery({
    queryKey: ["searchNotes", trimmed],
    enabled: trimmed.length > 0,
    queryFn: async () => {
      return searchNotesRequest(trimmed);
    },
  });

  const results = useMemo(() => data?.data ?? [], [data?.data]);

  return (
    <div className="pb-4 space-y-2 grow w-full">
      <div className="h-9 px-4 flex items-center justify-between text-foreground/70 text-xs font-semibold uppercase tracking-wider">
        <span>Search</span>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
            type="text"
            autoFocus
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded hover:bg-primary/10"
              title="Clear"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="px-2 overflow-y-auto">
        {trimmed.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            Type to search your notes.
          </div>
        ) : isFetching ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            Searching…
          </div>
        ) : isError ? (
          <div className="px-2 py-3 text-sm text-destructive">
            Failed to search.
          </div>
        ) : results.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            No results.
          </div>
        ) : (
          <div className="space-y-1">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/note/${r.slug}`}
                onClick={() => {
                  setOpenedNotes((prev) => {
                    if (prev.some((x) => x.slug === r.slug)) return prev;
                    return [...prev, { slug: r.slug, title: r.title }];
                  });
                }}
                className="flex gap-3 rounded-md px-3 py-2 hover:bg-primary/10"
              >
                <FileText className="w-4 h-4 mt-0.5 text-foreground/70 shrink-0" />
                <div className="min-w-0 flex flex-col gap-0.5">
                  <div className="text-sm text-foreground font-medium truncate">
                    <HighlightedText
                      text={r.title}
                      range={r.highLighted?.title}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {r.folderName}
                  </div>
                  {r.snippet ? (
                    <div className="text-xs text-foreground/80 line-clamp-2">
                      <HighlightedText
                        text={r.snippet}
                        range={r.highLighted?.body}
                      />
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
