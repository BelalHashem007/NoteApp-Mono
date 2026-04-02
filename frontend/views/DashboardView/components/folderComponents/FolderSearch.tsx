import { Search } from "lucide-react";
import { FolderPlus } from "lucide-react";
import CreationAndEditModal from "../modals/CreationAndEditModal";
import { useState } from "react";

export default function FolderSearch({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (a: string) => void;
}) {
  const [showModal, setShowModal] = useState<boolean>(false);

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
      <button
        onClick={() => setShowModal(true)}
        className={`p-2 h-full hover:bg-gray-200 rounded-full`}
        title={"New Folder..."}
      >
        <FolderPlus className="w-5 h-5" />
      </button>
      {showModal && (
        <CreationAndEditModal
          onClose={() => {
            setShowModal(false);
          }}
          state="create"
          modalType="folder"
        />
      )}
    </div>
  );
}
