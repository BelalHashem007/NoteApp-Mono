"use client";

import { TagPickerPopover } from "./TagPickerPopover";
import { deleteTagRequest } from "@/lib/tagsApi";
import { tagNameEquals as tagListIncludes } from "@/lib/tagsFromFoldersCache";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function tagNameEquals(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function removeTagFromParams(params: URLSearchParams, name: string) {
  const key = "tag";
  const target = name.trim().toLowerCase();
  const values = params.getAll(key);
  params.delete(key);
  for (const v of values) {
    if (v.trim().toLowerCase() !== target) params.append(key, v);
  }
}

export function NoteTagsRow({
  noteId,
  noteSlug,
  tags,
}: {
  noteId: string;
  noteSlug: string;
  tags?: Tag[];
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const deleteTagMutation = useMutation({
    mutationFn: async (name: string) => {
      await deleteTagRequest({ name, noteId });
      return name;
    },
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["note", noteSlug] });
      await queryClient.cancelQueries({ queryKey: ["foldersAndNotes"] });
      const previousNote = queryClient.getQueryData(["note", noteSlug]);
      const previousFoldersAndNotes = queryClient.getQueryData([
        "foldersAndNotes",
      ]);
      const previousUrl = `${pathname}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;

      queryClient.setQueryData(["note", noteSlug], (old: {data:Note}) => {
        const existingTags: Tag[] = (old?.data?.tags ?? []) as Tag[];
        return {
          ...old,
          data: {
            ...old.data,
            tags: existingTags.filter((t) => !tagNameEquals(t.name, name)),
          },
        };
      });

      let removedGlobally = false;

      queryClient.setQueryData(
        ["foldersAndNotes"],
        (old: { data?: FoldersWithTags }) => {
          if (
            !old?.data ||
            typeof old.data !== "object" ||
            Array.isArray(old.data)
          )
            return old;

          const target = name.trim().toLowerCase();

          const updateFolders = (nodes: FolderWithNotes[]): FolderWithNotes[] =>
            (nodes ?? []).map((f) => {
              const nextNotes = (f.notes ?? []).map((n) => {
                if (n.id !== noteId) return n;
                const nextTags = (n.tags ?? []).filter(
                  (t) => t.name.trim().toLowerCase() !== target,
                );
                return { ...n, tags: nextTags };
              });

              const nextSub =
                f.subFolders?.length ? updateFolders(f.subFolders) : f.subFolders;

              // keep referential stability when possible
              const notesChanged = nextNotes.some((n, i) => n !== f.notes?.[i]);
              const subChanged =
                (nextSub ?? []).some((sf, i) => sf !== f.subFolders?.[i]) ?? false;
              if (!notesChanged && !subChanged) return f;

              return { ...f, notes: nextNotes, subFolders: nextSub ?? [] };
            });

          const nextFolders = updateFolders(old.data.folders ?? []);

          // Count tag usage across all notes after update.
          let usage = 0;
          const walk = (nodes: FolderWithNotes[]) => {
            for (const f of nodes) {
              for (const n of f.notes ?? []) {
                for (const t of n.tags ?? []) {
                  if (t.name.trim().toLowerCase() === target) usage++;
                }
              }
              if (f.subFolders?.length) walk(f.subFolders);
            }
          };
          walk(nextFolders);

          const nextGlobalTags: Tag[] = Array.isArray(old.data.tags)
            ? (old.data.tags as Tag[])
            : [];

          let prunedTags = nextGlobalTags;
          if (usage === 0) {
            removedGlobally = true;
            prunedTags = nextGlobalTags.filter(
              (t) => t.name.trim().toLowerCase() !== target,
            );
          }

          return {
            ...old,
            data: {
              ...old.data,
              folders: nextFolders,
              tags: prunedTags,
            },
          };
        },
      );

      if (
        removedGlobally &&
        tagListIncludes(searchParams.getAll("tag"), name)
      ) {
        const params = new URLSearchParams(searchParams.toString());
        removeTagFromParams(params, name);
        const q = params.toString();
        router.replace(q ? `${pathname}?${q}` : pathname);
      }

      return { previousNote, previousFoldersAndNotes, removedGlobally, previousUrl };
    },
    onError: (_err, _name, ctx) => {
      if (ctx?.previousNote !== undefined) {
        queryClient.setQueryData(["note", noteSlug], ctx.previousNote);
      }
      if (ctx?.previousFoldersAndNotes !== undefined) {
        queryClient.setQueryData(["foldersAndNotes"], ctx.previousFoldersAndNotes);
      }
      if (ctx?.removedGlobally && ctx?.previousUrl) {
        router.replace(ctx.previousUrl);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["note", noteSlug] });
      await queryClient.invalidateQueries({ queryKey: ["foldersAndNotes"] });
    },
  });

  return (
    <div className="bg-muted/10 border-b px-3 py-2">
      <div className="flex flex-wrap items-center gap-2 min-h-8">
        {(tags ?? []).map((tag) => (
          <span
            key={tag.id ?? tag.name}
            className="group/tag inline-flex items-center gap-1 rounded-full bg-primary/10 text-foreground pl-2.5 pr-1 py-1 text-xs font-medium hover:bg-primary/15 transition-colors"
            title={tag.name}
          >
            <span className="truncate max-w-40">#{tag.name}</span>
            <button
              type="button"
              aria-label={`Remove tag ${tag.name}`}
              title="Remove tag"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full opacity-0 pointer-events-none group-hover/tag:opacity-100 group-hover/tag:pointer-events-auto group-focus-within/tag:opacity-100 group-focus-within/tag:pointer-events-auto hover:bg-background/60 text-muted-foreground hover:text-foreground transition-all focus-visible:opacity-100 focus-visible:pointer-events-auto"
              disabled={deleteTagMutation.isPending}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteTagMutation.mutate(tag.name);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}

        <TagPickerPopover
          noteId={noteId}
          noteSlug={noteSlug}
          currentTags={tags}
        >
          <button
            type="button"
            className="inline-flex items-center rounded-full border border-border bg-background/60 text-muted-foreground px-2.5 py-1 text-xs font-medium hover:bg-background hover:text-foreground transition-colors"
          >
            + Add tag
          </button>
        </TagPickerPopover>
      </div>
    </div>
  );
}

