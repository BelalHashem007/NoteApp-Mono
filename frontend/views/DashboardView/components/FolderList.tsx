export default function FolderList({ folders }: { folders: Folder[]}) {
    return (
        <div className="flex-1 px-2 overflow-y-auto">
            {folders.map((folder) => (
                <button
                    key={folder.id}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${false
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-background hover:text-foreground"
                        }`}
                >
                    <span className="text-sm">{folder.folderName}</span>
                </button>
            ))}
        </div>
    )
}