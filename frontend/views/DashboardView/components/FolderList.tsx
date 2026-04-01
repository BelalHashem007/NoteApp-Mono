import EditFolderButton from "./EditFolderButton";
import { usePathname, useRouter } from "next/navigation";
import { Ref, useRef, useState, useEffect } from "react";
import NoteList from "./Note";
import { FolderOpen, FolderClosed, MenuSquare } from "lucide-react";
import page from "@/app/dashboard/page";
import DeleteFolderButton from "./DeleteFolderButton";

export default function FolderList({
  folders,
}: {
  folders: FolderWithNotes[];
}) {
  // const pathName = usePathname();
  // const [selectedFolder, setSelectedFolder] = useState<string>(pathName.split("/").length > 1 ? pathName.split("/")[2] : "")
  // const router = useRouter();
  const [isOpen, setIsOpen] = useState<string>("");
  const contextMenuRef = useRef<HTMLUListElement | null>(null);
  const [clickedFolder, setClickedFolder] = useState<FolderWithNotes | null>(
    null,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        contextMenuRef.current.style.display = "none";
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  function handleContextMenu(
    e: React.MouseEvent<HTMLButtonElement>,
    folder: FolderWithNotes,
  ) {
    e.preventDefault();
    console.log("pageX", e.pageX);
    console.log("pageY", e.pageY);
    let posX = e.pageX;
    let posY = e.pageY;

    if (contextMenuRef.current !== null) {
      const menu = contextMenuRef.current;

      if (menu.style.display === "block") {
        menu.style.display = "none";
        return;
      }

      setClickedFolder(folder);

      const menuWidth = menu.offsetWidth;
      const menuHeight = menu.offsetHeight;

      if (posX + menuWidth > window.innerWidth) {
        posX = window.innerWidth - menuWidth;
      }

      if (posY + menuHeight > window.innerHeight) {
        posY = window.innerHeight - menuHeight;
      }

      menu.style.left = posX + "px";
      menu.style.top = posY + "px";
      menu.style.display = "block";
    }
  }

  return (
    <div className="flex-1 px-2 overflow-y-auto">
      {/* {folders.map((folder) => (
        <div
          key={folder.id}
          className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
            false
              ? "bg-primary/10 text-primary"
              : "text-foreground/70 hover:bg-background hover:text-foreground"
          }`}
        >
          <button
            className="flex-1 flex items-center gap-3 text-left"
            onClick={() => {
              // router.push(`/dashboard/${folder.id}`)
              // setSelectedFolder(folder.id)
            }}
          >
            <span className="text-lg">{folder.folderName}</span>
          </button>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <EditFolderButton folder={folder} />
            <DeleteFolderButton folder={folder} />
          </div>
        </div>
      ))} */}

      {folders.map((f) => {
        return (
          <div key={f.id}>
            <button
              className="flex gap-2"
              onClick={() => setIsOpen(isOpen === f.id ? "" : f.id)}
              onContextMenu={(e) => handleContextMenu(e, f)}
            >
              {isOpen === f.id ? (
                <FolderOpen fill="yellow" />
              ) : (
                <FolderClosed fill="yellow" />
              )}{" "}
              {f.folderName}
            </button>
            {isOpen === f.id && (
              <div>
                <FolderList folders={f.subFolders} />
                <NoteList notes={f.notes} />
              </div>
            )}
          </div>
        );
      })}

      <ul
        className="bg-gray-200 shadow-2xl absolute hidden border border-gray-300 min-w-30"
        ref={contextMenuRef}
      >
        <li
          onClick={() => {
            if (contextMenuRef.current)
              contextMenuRef.current.style.display = "none";
          }}
        >
          <DeleteFolderButton folder={clickedFolder as FolderWithNotes} />
        </li>
        <li
          onClick={() => {
            if (contextMenuRef.current)
              contextMenuRef.current.style.display = "none";
          }}
        >
          <EditFolderButton folder={clickedFolder as FolderWithNotes} />
        </li>
      </ul>
    </div>
  );
}
