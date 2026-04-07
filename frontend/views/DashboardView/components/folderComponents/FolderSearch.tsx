import { Search } from "lucide-react";
import { FolderPlus } from "lucide-react";
import { useState } from "react";

export default function FolderSearch({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (a: string) => void;
}) {
  return (
    <div className="p-4 flex gap-2">
      <div className="relative grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Find folder..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9 pl-9 bg-background border-2 border-border text-sm w-full"
        />
      </div>
    </div>
  );
}
