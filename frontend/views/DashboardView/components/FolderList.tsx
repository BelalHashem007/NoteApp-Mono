import EditFolderButton from "./EditFolderButton"
import DeleteFolderButton from "./DeleteFolderButton"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react";

export default function FolderList({ folders }: { folders: Folder[]}) {
  const pathName = usePathname();
  const [selectedFolder, setSelectedFolder] = useState<string>(pathName.split("/").length > 1 ? pathName.split("/")[2] : "")
  const router = useRouter();
    return (
        <div className="flex-1 px-2 overflow-y-auto">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${selectedFolder === folder.id
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-background hover:text-foreground"
              }`}
            >
              <button
                className="flex-1 flex items-center gap-3 text-left"
                onClick={()=> {
                  router.push(`/dashboard/${folder.id}`)
                  setSelectedFolder(folder.id)
                }}
              >
                <span className="text-lg">{folder.folderName}</span>
              </button>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <EditFolderButton folder={folder}/>
                <DeleteFolderButton folder={folder}/>
              </div>
            </div>
          ))}
        </div>
    )
}