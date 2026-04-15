"use client";

import { searchNotesRequest } from "@/lib/noteApi";
import { useQuery } from "@tanstack/react-query";
import { FileText, Filter, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { useTapsContext } from "@/app/dashboard/providers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchFoldersAndNotes } from "@/lib/folderApi";
import {
  getAllUserTagsFromFoldersCache,
  tagNameEquals,
} from "@/lib/tagsFromFoldersCache";

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

function normalizeTagName(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

export default function SearchSection() {
  const { setOpenedNotes } = useTapsContext();
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const trimmed = debouncedQuery.trim();
  const normalizedTagQuery = normalizeTagName(tagQuery);

  // Reuse the same cache key used elsewhere; this typically hits cache
  // when Explorer has already loaded.
  const { data: foldersAndNotesData } = useQuery({
    queryKey: ["foldersAndNotes"],
    queryFn: ({ signal }) => fetchFoldersAndNotes({ signal }),
  });

  const allTags = useMemo(() => {
    return getAllUserTagsFromFoldersCache(foldersAndNotesData);
  }, [foldersAndNotesData]);

  const filteredTags = useMemo(() => {
    const q = normalizedTagQuery.toLowerCase();
    if (!q) return allTags;
    return allTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [allTags, normalizedTagQuery]);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["searchNotes", trimmed, selectedTags.join("|")],
    enabled: trimmed.length > 0,
    queryFn: async () => {
      return searchNotesRequest(trimmed, selectedTags);
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
          <Popover open={tagFilterOpen} onOpenChange={setTagFilterOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="inline-flex min-h-7.5 items-center gap-2 rounded-md border border-border bg-background/60 px-2 py-1 text-xs text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                title="Filter tags"
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filter</span>
                {selectedTags.length > 0 ? (
                  <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-foreground tabular-nums">
                    {selectedTags.length}
                  </span>
                ) : null}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-3">
              <div className="flex flex-col gap-2">
                <input
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  placeholder="Filter tags..."
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setTagFilterOpen(false);
                      setTagQuery("");
                    }
                  }}
                />

                <div className="max-h-40 overflow-auto rounded-md">
                  {filteredTags.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No tags found
                    </div>
                  ) : (
                    filteredTags.map((t) => {
                      const isSelected = tagNameEquals(selectedTags, t.name);
                      return (
                        <button
                          key={t.id ?? t.name}
                          type="button"
                          onClick={() => {
                            setSelectedTags((prev) => {
                              if (tagNameEquals(prev, t.name)) {
                                return prev.filter(
                                  (x) =>
                                    x.trim().toLowerCase() !==
                                    t.name.trim().toLowerCase(),
                                );
                              }
                              return [...prev, t.name.trim()];
                            });
                          }}
                          className="w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-sm hover:bg-muted/40"
                          title={t.name}
                        >
                          <div className="flex max-w-full gap-2 items-center">
                            <span
                              className={`h-4 w-4 shrink-0 rounded-full border border-border text-[10px] flex items-center justify-center ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-background"
                              }`}
                              aria-hidden="true"
                            >
                              {isSelected ? "✓" : null}
                            </span>
                            <span className="truncate">#{t.name}</span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
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

      <div className="px-2 overflow-y-auto py-1">
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
          <div className="space-y-2 flex flex-col gap-1">
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
                  {(r.tags?.length ?? 0) > 0 ? (
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {(r.tags ?? []).slice(0, 2).map((t: Tag) => (
                        <span
                          key={t.id ?? t.name}
                          className="inline-flex items-center rounded-full bg-primary/10 text-foreground px-2 py-0.5 text-[10px] font-medium"
                          title={t.name}
                        >
                          #{t.name}
                        </span>
                      ))}
                      {(r.tags?.length ?? 0) > 2 ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] text-foreground/70 hover:bg-muted/80"
                              title="More tags"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                            >
                              +{(r.tags?.length ?? 0) - 2}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            align="start"
                            className="w-56 p-2"
                            onOpenAutoFocus={(e) => e.preventDefault()}
                          >
                            <div className="flex flex-wrap gap-1">
                              {(r.tags ?? []).slice(0, 5).map((t: Tag) => (
                                <span
                                  key={t.id ?? t.name}
                                  className="inline-flex items-center rounded-full bg-primary/10 text-foreground px-2 py-0.5 text-[10px] font-medium"
                                  title={t.name}
                                >
                                  #{t.name}
                                </span>
                              ))}
                              {(r.tags?.length ?? 0) > 5 ? (
                                <span className="text-[10px] text-muted-foreground px-1">
                                  …
                                </span>
                              ) : null}
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : null}
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
