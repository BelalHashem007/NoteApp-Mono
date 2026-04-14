"use client";

import { createTagRequest } from "@/lib/tagsApi";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

function normalizeTagName(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function getAllUserTagsFromFoldersCache(cached: unknown): Tag[] {
  const anyCached = cached as any;
  const data = anyCached?.data;
  const tags: unknown =
    data?.Tags ?? data?.tags ?? data?.TAGS ?? anyCached?.Tags ?? anyCached?.tags;
  return Array.isArray(tags) ? (tags as Tag[]) : [];
}

function tagNameEquals(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function TagPickerPopover({
  noteId,
  noteSlug,
  currentTags,
  children,
}: {
  noteId: string;
  noteSlug: string;
  currentTags?: Tag[];
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const allUserTags = React.useMemo(() => {
    const cached = queryClient.getQueryData(["foldersAndNotes"]);
    return getAllUserTagsFromFoldersCache(cached);
  }, [queryClient, open]);

  const normalizedQuery = normalizeTagName(query);
  const filtered = React.useMemo(() => {
    const q = normalizedQuery.toLowerCase();
    if (!q) return allUserTags;
    return allUserTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [allUserTags, normalizedQuery]);

  const hasExactMatch = React.useMemo(() => {
    if (!normalizedQuery) return false;
    return allUserTags.some((t) => tagNameEquals(t.name, normalizedQuery));
  }, [allUserTags, normalizedQuery]);

  const mutation = useMutation({
    mutationFn: async (name: string) => {
      await createTagRequest({ name, noteId });
      return name;
    },
    onMutate: async (name) => {
      const normalizedName = normalizeTagName(name);
      if (!normalizedName) return;

      await queryClient.cancelQueries({ queryKey: ["note", noteSlug] });

      // Optimistic: note tags
      queryClient.setQueryData(["note", noteSlug], (old: any) => {
        const existingTags: Tag[] = (old?.data?.tags ?? []) as Tag[];
        if (existingTags.some((t) => tagNameEquals(t.name, normalizedName)))
          return old;
        const nextTags = [
          ...existingTags,
          { id: crypto.randomUUID(), name: normalizedName } satisfies Tag,
        ];
        return { ...old, data: { ...old.data, tags: nextTags } };
      });

      // Optimistic: global tags list in folders cache
      queryClient.setQueryData(["foldersAndNotes"], (old: any) => {
        const data = old?.data ?? old;
        const existing: Tag[] =
          (data?.Tags ?? data?.tags ?? data?.TAGS ?? []) as Tag[];
        if (existing.some((t) => tagNameEquals(t.name, normalizedName)))
          return old;

        const nextTags = [
          ...existing,
          { id: crypto.randomUUID(), name: normalizedName } satisfies Tag,
        ];

        if (old?.data) {
          if (Array.isArray(old.data.Tags))
            return { ...old, data: { ...old.data, Tags: nextTags } };
          if (Array.isArray(old.data.tags))
            return { ...old, data: { ...old.data, tags: nextTags } };
          return { ...old, data: { ...old.data, Tags: nextTags } };
        }
        if (Array.isArray(old?.Tags)) return { ...old, Tags: nextTags };
        if (Array.isArray(old?.tags)) return { ...old, tags: nextTags };
        return { ...old, Tags: nextTags };
      });

      setOpen(false);
      setQuery("");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["note", noteSlug] });
      await queryClient.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const commit = (name: string) => {
    const normalizedName = normalizeTagName(name);
    if (!normalizedName) return;
    mutation.mutate(normalizedName);
  };

  const currentTagNames = React.useMemo(() => {
    return new Set((currentTags ?? []).map((t) => t.name.trim().toLowerCase()));
  }, [currentTags]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-3">
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Add a tag…"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                setQuery("");
                return;
              }
              if (e.key === "Enter") {
                e.preventDefault();
                if (!normalizedQuery) return;
                commit(normalizedQuery);
              }
            }}
          />

          <div className="max-h-56 overflow-auto rounded-md border border-border bg-background">
            {normalizedQuery && !hasExactMatch && (
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted/40"
                onClick={() => commit(normalizedQuery)}
                disabled={mutation.isPending}
              >
                Create &quot;{normalizedQuery}&quot;
              </button>
            )}

            {filtered.length === 0 && (!normalizedQuery || hasExactMatch) && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No tags found
              </div>
            )}

            {filtered.slice(0, 30).map((t) => {
              const alreadyOnNote = currentTagNames.has(t.name.trim().toLowerCase());
              return (
                <button
                  key={t.id ?? t.name}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/40 disabled:opacity-60"
                  onClick={() => commit(t.name)}
                  disabled={alreadyOnNote || mutation.isPending}
                  title={alreadyOnNote ? "Already added" : t.name}
                >
                  #{t.name}
                  {alreadyOnNote && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (added)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

