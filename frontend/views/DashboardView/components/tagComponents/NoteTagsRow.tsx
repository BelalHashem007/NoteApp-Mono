"use client";

import { TagPickerPopover } from "./TagPickerPopover";
import { deleteTagRequest } from "@/lib/tagsApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

function tagNameEquals(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
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

  const deleteTagMutation = useMutation({
    mutationFn: async (name: string) => {
      await deleteTagRequest({ name, noteId });
      return name;
    },
    onMutate: async (name) => {
      await queryClient.cancelQueries({ queryKey: ["note", noteSlug] });
      const previousNote = queryClient.getQueryData(["note", noteSlug]);

      queryClient.setQueryData(["note", noteSlug], (old: any) => {
        const existingTags: Tag[] = (old?.data?.tags ?? []) as Tag[];
        return {
          ...old,
          data: {
            ...old.data,
            tags: existingTags.filter((t) => !tagNameEquals(t.name, name)),
          },
        };
      });

      return { previousNote };
    },
    onError: (_err, _name, ctx) => {
      if (ctx?.previousNote !== undefined) {
        queryClient.setQueryData(["note", noteSlug], ctx.previousNote);
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

