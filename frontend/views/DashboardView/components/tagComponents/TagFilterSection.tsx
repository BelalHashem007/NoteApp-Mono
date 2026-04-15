"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Tag as TagIcon } from "lucide-react";
import { tagNameEquals } from "@/lib/tagsFromFoldersCache";
import { Badge } from "@/components/ui/badge";

export function TagFilterSection({
  tags,
  folders,
  activeTags,
}: {
  tags: Tag[];
  folders: FolderWithNotes[];
  activeTags: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);

  const toggle = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeTags && tagNameEquals(activeTags, name)) {
      params.delete("tag", name);
    } else {
      params.append("tag", name.trim());
    }
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname);
  };

  const countsByTag = useMemo(() => {
    const map = new Map<string, number>();

    const walk = (nodes: FolderWithNotes[]) => {
      for (const f of nodes) {
        for (const n of f.notes ?? []) {
          for (const t of n.tags ?? []) {
            const key = t.name.trim().toLowerCase();
            if (!key) continue;
            map.set(key, (map.get(key) ?? 0) + 1);
          }
        }
        if (f.subFolders?.length) walk(f.subFolders);
      }
    };

    walk(folders ?? []);
    return map;
  }, [folders]);

  const colorClasses = [
    "text-rose-600 dark:text-rose-400",
    "text-amber-600 dark:text-amber-400",
    "text-lime-600 dark:text-lime-400",
    "text-emerald-600 dark:text-emerald-400",
    "text-cyan-600 dark:text-cyan-400",
    "text-blue-600 dark:text-blue-400",
    "text-indigo-600 dark:text-indigo-400",
    "text-violet-600 dark:text-violet-400",
    "text-fuchsia-600 dark:text-fuchsia-400",
    "text-pink-600 dark:text-pink-400",
  ];

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 min-h-0 flex-1 px-2 pt-2 pb-1">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between gap-2 px-2 pb-1 shrink-0 text-foreground/70 hover:text-foreground transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-semibold uppercase tracking-wider">
          Tags
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="overflow-y-auto min-h-0 flex-1 flex flex-wrap gap-1 px-1">
          {tags.map((t) => {
            const isActive = !!(
              activeTags && tagNameEquals(activeTags, t.name)
            );
            return (
              <Badge
                asChild
                key={t.id}
                className={`p-2 ${isActive ? "bg-neutral-950 text-white cursor-pointer" : "bg-neutral-200 text-black"}`}
                title={t.name}
              >
                <button onClick={() => toggle(t.name)}>#{t.name}</button>
              </Badge>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
