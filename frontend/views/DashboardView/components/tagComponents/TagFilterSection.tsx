"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Tag as TagIcon } from "lucide-react";
import { tagNameEquals } from "@/lib/tagsFromFoldersCache";

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
    <div className="flex flex-col min-h-0 flex-1 px-2 pt-2 pb-1">
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
        <div className="overflow-y-auto min-h-0 flex-1 flex flex-col gap-1 px-1">
          {tags.map((t) => {
            const isActive = !!(
              activeTags && tagNameEquals(activeTags, t.name)
            );
            const key = t.name.trim().toLowerCase();
            const count = countsByTag.get(key) ?? 0;
            const iconClass = colorClasses[Number(t.id) % colorClasses.length];

            return (
              <button
                key={t.id ?? t.name}
                type="button"
                title={t.name}
                onClick={() => toggle(t.name)}
                className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-primary/10`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <TagIcon className={`h-4 w-4 shrink-0 ${iconClass}`} />
                  <span
                    className={`truncate ${
                      isActive
                        ? "bg-secondary/15 text-secondary"
                        : "text-foreground"
                    }`}
                  >
                    #{t.name}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums bg-muted text-foreground/70`}
                  aria-label={`${count} notes`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
