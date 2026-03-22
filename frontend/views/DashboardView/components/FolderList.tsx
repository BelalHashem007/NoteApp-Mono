export default function FolderList({ folders, selectedFolder, setSelectedFolder }: { folders: Folder[], selectedFolder: string, setSelectedFolder: (a:string) => void }) {
    return (
        <div className="flex-1 px-2 overflow-y-auto">
            {folders.map((folder) => (
                <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${selectedFolder === folder.id
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-background hover:text-foreground"
                        }`}
                >
                    <span className="text-lg">{folder.icon}</span>
                    <span className="text-sm">{folder.name}</span>
                </button>
            ))}
        </div>
    )
}