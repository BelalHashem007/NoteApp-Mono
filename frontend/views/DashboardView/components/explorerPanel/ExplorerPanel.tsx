"use client";

import { Suspense, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import ExplorerSection from "./ExplorerSection";
import { TagFilterSection } from "../tagComponents/TagFilterSection";
import { fetchFoldersAndNotes } from "@/lib/folderApi";
import { getFoldersFromQueryData } from "@/lib/foldersAndNotesCache";
import { getAllUserTagsFromFoldersCache } from "@/lib/tagsFromFoldersCache";
import { filterFolderTreeByTag } from "@/lib/filterFoldersByTag";
import FolderComponentSkeleton from "@/components/placeholders/FolderComponentSkeleton";
import { ExplorerContextProvider } from "./ExplorerContextProvider";

function ExplorerPanelContent() {
  const searchParams = useSearchParams();
  const activeTags = searchParams.getAll("tag");

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["foldersAndNotes"],
    queryFn: ({ signal }) => fetchFoldersAndNotes({ signal }),
  });
  const folders = useMemo(() => getFoldersFromQueryData(data), [data]);
  const globalTags = useMemo(
    () => getAllUserTagsFromFoldersCache(data),
    [data],
  );
  const filteredFolders = useMemo(
    () => filterFolderTreeByTag(folders, activeTags),
    [folders, activeTags],
  );

  if (isPending) {
    return <FolderComponentSkeleton />;
  }

  if (isError) {
    console.error(error);
    return (
      <div className="p-4 text-sm text-destructive">
        Failed to fetch folders
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col flex-1 min-h-0 w-full min-w-0 overflow-hidden">
      <div className="flex-7 min-h-0 flex flex-col overflow-hidden">
        <ExplorerContextProvider>
          <ExplorerSection folders={filteredFolders} />
        </ExplorerContextProvider>
      </div>
      <div className="flex-3 min-h-0 flex flex-col overflow-hidden dark:border-white/10 border-neutral-200 border-t shrink-0">
        <TagFilterSection
          tags={globalTags}
          folders={folders}
          activeTags={activeTags}
        />
      </div>
    </div>
  );
}

export default function ExplorerPanel() {
  return (
    <Suspense fallback={<FolderComponentSkeleton />}>
      <ExplorerPanelContent />
    </Suspense>
  );
}
